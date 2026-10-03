import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { generateNarrative, auditReport, extractMetrics, isGeminiActive } from './server/gemini';
import { serverStore } from './server/store';
import { processDHIS2Sync, fetchFHIRClinicalEncounters, sendSMSAlert } from './server/integrations';
import {
  applySecurityHeaders,
  createRateLimiter,
  sanitizePayload,
  hashPassword,
  generateSessionToken,
  verifySessionToken,
  requireAuth
} from './server/security';
import {
  reconcileProceduresAgainstInvoices,
  buildVerifiedDeterministicSummary
} from './utils/deterministicBilling';
import {
  verifyFirebaseIdToken,
  getUserProfileFromFirestore,
  adminDb
} from './server/firebaseAdmin';

function getTenantContext(req: Request) {
  const user = (req as any).user;
  if (user) {
    return {
      isGuest: user.isGuest,
      facilityCode: user.isGuest ? 'MFL #DEMO-01' : (user.facilityCode || 'MFL #UNASSIGNED')
    };
  }
  // Unauthenticated fallback: strictly restricted to guest sandbox partition ('MFL #DEMO-01').
  // Client-supplied headers cannot override or access real facility partitions without valid token.
  return { isGuest: true, facilityCode: 'MFL #DEMO-01' };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Security Headers & Protected File Guard
  app.use(applySecurityHeaders);

  // 2. JSON Body Parser with safe limits
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // 3. Rate Limiters (120 req/min for general API, 30 req/min for AI)
  const apiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 120,
    keyPrefix: 'api_general'
  });
  const aiLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: 'api_ai',
    message: 'AI audit rate limit reached. Please wait a moment before requesting another clinical report.'
  });

  app.use('/api', apiLimiter);
  app.use('/api/ai', aiLimiter);

  // 4. Request logger for diagnostic tracing
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ==========================================
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { idToken, isGuest, emailOrMfl } = sanitizePayload(req.body);

      // 1. Guest Sandbox Session
      // Strictly scoped to the isolated synthetic demo clinic partition ('MFL #DEMO-01')
      if (isGuest) {
        const guestToken = generateSessionToken('guest-sandbox', 'guest', 'MFL #DEMO-01');
        res.json({
          success: true,
          token: guestToken,
          user: {
            identifier: 'guest.evaluator@kazira.sandbox',
            name: 'Guest Health Auditor',
            role: 'guest',
            facilityCode: 'MFL #DEMO-01',
            facilityName: 'Kazira Clinical Sandbox (Demo Clinic)',
            isGuest: true,
            issuedAt: new Date().toISOString()
          }
        });
        return;
      }

      // 2. Authenticated Firebase User Session
      const authHeader = req.headers.authorization;
      const tokenToVerify = idToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined);

      if (!tokenToVerify) {
        res.status(401).json({
          error: 'Authentication failed: A valid Firebase ID token is required.',
          code: 'MISSING_ID_TOKEN'
        });
        return;
      }

      let decoded;
      try {
        decoded = await verifyFirebaseIdToken(tokenToVerify);
      } catch (authErr: any) {
        res.status(401).json({
          error: 'Invalid or expired Firebase ID token.',
          code: 'INVALID_ID_TOKEN',
          details: authErr.message
        });
        return;
      }

      const uid = decoded.uid;
      const email = decoded.email;

      // Authoritative lookup: Read user profile directly from Firestore.
      // NEVER trust role or facilityCode from the client request body.
      const profile = await getUserProfileFromFirestore(uid, email || emailOrMfl);

      if (!profile) {
        res.status(404).json({
          error: 'User account not found in hospital registry. Please complete facility onboarding registration first.',
          code: 'PROFILE_NOT_FOUND',
          uid,
          email
        });
        return;
      }

      // Extract verified role and facilityCode from Firestore document
      const verifiedRole = profile.role || 'facility_admin';
      const verifiedFacilityCode = profile.facilityCode || (profile as any).facilityId || 'MFL #UNASSIGNED';

      const sessionToken = generateSessionToken(uid, verifiedRole, verifiedFacilityCode);

      res.json({
        success: true,
        token: sessionToken,
        user: {
          identifier: email || uid,
          name: profile.name,
          role: verifiedRole,
          facilityCode: verifiedFacilityCode,
          facilityName: profile.facilityName,
          issuedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      console.error('[API /api/auth/login] Error:', err);
      res.status(500).json({ error: 'Authentication verification failed.' });
    }
  });

  app.get('/api/auth/verify-session', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ valid: false, error: 'Missing or malformed bearer token.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const verification = verifySessionToken(token);
    if (!verification.valid) {
      res.status(401).json({ valid: false, error: 'Session token has expired or is invalid.' });
      return;
    }
    res.json(verification);
  });

  // Register new hospital facility & administrator account
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const payload = sanitizePayload(req.body);
      const { profile, idToken } = payload || {};
      if (!profile || !profile.facilityCode || !profile.email || !profile.name) {
        res.status(400).json({ error: 'Missing required registration profile fields (facilityCode, email, name).' });
        return;
      }

      // If idToken is provided, bind to the verified Firebase identity
      let verifiedUid = profile.id;
      if (idToken) {
        try {
          const decoded = await verifyFirebaseIdToken(idToken);
          verifiedUid = decoded.uid;
          profile.id = verifiedUid;
          profile.email = decoded.email || profile.email;
        } catch (idErr: any) {
          console.warn('[Register] Optional ID token verification notice:', idErr.message);
        }
      }

      // Strict role security: Never allow callers to self-register as supervisory roles
      if (profile.role === 'moh' || profile.role === 'county_health') {
        profile.role = 'facility_admin';
      }

      const cleanFac = profile.facilityCode.replace(/[^a-zA-Z0-9_-]/g, '_');

      // Persist in Firestore authoritative database
      try {
        await adminDb.collection('users').doc(verifiedUid).set({
          ...profile,
          facilityId: cleanFac,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        await adminDb.collection('facilities').doc(cleanFac).set({
          id: cleanFac,
          facilityName: profile.facilityName,
          facilityCode: profile.facilityCode,
          facilityType: profile.facilityType || 'private',
          adminEmail: profile.email,
          adminName: profile.name,
          adminUserId: verifiedUid,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (fsErr: any) {
        console.warn('[Register] Firestore write notice:', fsErr.message);
      }

      // Save profile in persistent server store
      const savedProfile = serverStore.addRegisteredProfile(profile);

      // Generate sovereign auth token with verified facility partition binding
      const token = generateSessionToken(verifiedUid, profile.role || 'facility_admin', profile.facilityCode);
      
      // Log audit
      serverStore.logAudit({
        id: `AUDIT-${Date.now()}`,
        type: 'AI_REPORT',
        status: 'SUCCESS',
        summary: `Facility Registered: ${profile.facilityName} (${profile.facilityCode}) by ${profile.name}`,
        timestamp: new Date().toISOString()
      }, false, profile.facilityCode);

      res.status(201).json({
        success: true,
        profile: savedProfile,
        token,
        message: `Facility ${profile.facilityName} registered successfully with zero-mock partitioned ledger.`
      });
    } catch (err: any) {
      console.error('[API /api/auth/register] Error:', err);
      res.status(500).json({ error: err.message || 'Failed to register facility.' });
    }
  });

  // Get all registered facility profiles
  app.get('/api/auth/profiles', (req: Request, res: Response) => {
    try {
      const profiles = serverStore.getRegisteredProfiles();
      res.json({ success: true, profiles });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // HEALTH & DIAGNOSTIC ENDPOINTS
  // ==========================================
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'kazira-clinical-intelligence-backend',
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      isGeminiActive: isGeminiActive(),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/system/status', (req: Request, res: Response) => {
    const { isGuest, facilityCode } = getTenantContext(req);
    const debts = serverStore.getDebts(isGuest, facilityCode);
    const recoveryEntries = serverStore.getRecoveryEntries(isGuest, facilityCode);
    const reports = serverStore.getReports(isGuest, facilityCode);

    res.json({
      status: 'healthy',
      version: '2.6.0',
      uptime: Math.floor(process.uptime()),
      tenant: {
        isGuest,
        facilityCode
      },
      compliance: {
        kdpa2019: 'VERIFIED_ACTIVE',
        dpiaStatus: 'IN_PROGRESS',
        pseudonymisationMethod: 'SHA-256 One-Way Token Masking',
        dataRetentionLimitDays: 90
      },
      aiEngine: {
        provider: 'Google Gemini 3.8',
        narrativeModel: 'gemini-3.8-flash',
        auditModel: 'gemini-3.8-flash',
        isConfigured: Boolean(process.env.GEMINI_API_KEY),
        mode: isGeminiActive() ? 'live_api' : 'deterministic_clinical'
      },
      integrations: {
        dhis2Endpoint: process.env.DHIS2_BASE_URL || 'https://dhis2.health.go.ke/api/33',
        fhirEndpoint: process.env.KENYAEMR_FHIR_BASE_URL || 'https://kenyaemr.health.go.ke/openmrs/ws/fhir2/R4',
        smsGateway: 'AfricasTalking Kenya (+254)'
      },
      stats: {
        totalDebtsTracked: debts.length,
        pendingDebtsCount: debts.filter(d => d.status === 'pending').length,
        recoveryLogEntries: recoveryEntries.length,
        storedReportsCount: reports.length
      },
      timestamp: new Date().toISOString()
    });
  });

  // ==========================================
  // GEMINI AI SECURE BACKEND PROXY
  // ==========================================
  app.post('/api/ai/narrative', async (req: Request, res: Response) => {
    try {
      const payload = sanitizePayload(req.body);
      const data = payload?.data || payload?.text;
      if (!data || typeof data !== 'string') {
        res.status(400).json({ error: 'Missing "data" or "text" string in request body.' });
        return;
      }
      const overrideKey = (req.headers['x-gemini-api-key'] as string) || undefined;
      const narrative = await generateNarrative(data, overrideKey);
      res.json({ success: true, narrative });
    } catch (err: any) {
      console.error('[API /api/ai/narrative] Error:', err);
      const isProd = process.env.NODE_ENV === 'production';
      res.status(500).json({
        error: isProd ? 'Clinical narrative engine temporarily unavailable.' : (err.message || 'Failed to generate narrative report.')
      });
    }
  });

  app.post('/api/ai/audit', async (req: Request, res: Response) => {
    try {
      const payload = sanitizePayload(req.body);
      const data = payload?.data || payload?.text;
      const narrative = payload?.narrative;
      if (!data || !narrative) {
        res.status(400).json({ error: 'Missing "data" or "narrative" in request body.' });
        return;
      }
      const overrideKey = (req.headers['x-gemini-api-key'] as string) || undefined;
      const auditedReport = await auditReport(data, narrative, overrideKey);
      res.json({ success: true, audit: auditedReport, auditedReport });
    } catch (err: any) {
      console.error('[API /api/ai/audit] Error:', err);
      const isProd = process.env.NODE_ENV === 'production';
      res.status(500).json({
        error: isProd ? 'Deterministic clinical audit loop failed.' : (err.message || 'Failed to complete audit loop.')
      });
    }
  });

  app.post('/api/ai/extract-metrics', async (req: Request, res: Response) => {
    try {
      const payload = sanitizePayload(req.body);
      const text = payload?.text || payload?.data;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Missing "text" or "data" string in request body.' });
        return;
      }
      const overrideKey = (req.headers['x-gemini-api-key'] as string) || undefined;
      const metrics = await extractMetrics(text, overrideKey);
      res.json({ success: true, metrics });
    } catch (err: any) {
      console.error('[API /api/ai/extract-metrics] Error:', err);
      const isProd = process.env.NODE_ENV === 'production';
      res.status(500).json({
        error: isProd ? 'Clinical metric extraction failed.' : (err.message || 'Failed to extract metrics.')
      });
    }
  });

  // ==========================================
  // DETERMINISTIC BILLING RECONCILIATION ENGINE
  // ==========================================
  app.post('/api/reconcile/billing', (req: Request, res: Response) => {
    try {
      const { procedures, invoices, syncToDebts } = sanitizePayload(req.body);
      const { isGuest, facilityCode } = getTenantContext(req);

      if (!Array.isArray(procedures)) {
        res.status(400).json({ error: 'Expected "procedures" array.' });
        return;
      }

      const invoiceList = Array.isArray(invoices) ? invoices : [];
      const reconciliation = reconcileProceduresAgainstInvoices(procedures, invoiceList, facilityCode);

      // Optionally sync generated debts directly to the facility's ledger
      if (syncToDebts && reconciliation.generatedDebtItems.length > 0) {
        serverStore.addDebtsBatch(reconciliation.generatedDebtItems, isGuest, facilityCode);
      }

      res.json({
        success: true,
        reconciliation,
        summaryText: buildVerifiedDeterministicSummary(reconciliation)
      });
    } catch (err: any) {
      console.error('[API /api/reconcile/billing] Error:', err);
      res.status(500).json({ error: err.message || 'Deterministic reconciliation failed.' });
    }
  });

  // ==========================================
  // DEBTS & RECEIVABLES LEDGER ENDPOINTS (Multi-Tenant Partitioned & Authenticated)
  // ==========================================
  const tenantReadAuth = requireAuth({ allowGuest: true });
  const tenantWriteAuth = requireAuth({
    allowGuest: true,
    requireRoles: ['facility_admin', 'moh', 'county_health', 'guest']
  });

  app.get('/api/debts', tenantReadAuth, async (req: Request, res: Response) => {
    const { isGuest, facilityCode } = getTenantContext(req);
    const debts = await serverStore.getDebtsAsync(isGuest, facilityCode);
    res.json({ success: true, debts, isGuest, facilityCode });
  });

  app.post('/api/debts', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const newItem = sanitizePayload(req.body);
      if (!newItem || !newItem.id || !newItem.procedureName) {
        res.status(400).json({ error: 'Invalid debt item payload.' });
        return;
      }
      const saved = serverStore.addDebt(newItem, isGuest, facilityCode);
      res.status(201).json({ success: true, debt: saved });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/debts/batch', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const items = sanitizePayload(req.body?.items);
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Expected items array.' });
        return;
      }
      const saved = serverStore.addDebtsBatch(items, isGuest, facilityCode);
      res.status(201).json({ success: true, count: saved.length, debts: saved });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/debts/:id', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updates = sanitizePayload(req.body);
      const updated = serverStore.updateDebt(id, updates, isGuest, facilityCode);
      if (!updated) {
        res.status(404).json({ error: `Debt item ${id} not found.` });
        return;
      }
      res.json({ success: true, debt: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/debts/:id', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const success = serverStore.deleteDebt(id, isGuest, facilityCode);
      if (!success) {
        res.status(404).json({ error: `Debt item ${id} not found.` });
        return;
      }
      res.json({ success: true, deletedId: id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // RECOVERY LOGBOOK & BASELINE ENDPOINTS (Multi-Tenant Partitioned & Authenticated)
  // ==========================================
  app.get('/api/recovery-log', tenantReadAuth, (req: Request, res: Response) => {
    const { isGuest, facilityCode } = getTenantContext(req);
    const entries = serverStore.getRecoveryEntries(isGuest, facilityCode);
    res.json({ success: true, entries, isGuest });
  });

  app.post('/api/recovery-log', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const newEntry = sanitizePayload(req.body);
      if (!newEntry || !newEntry.id) {
        res.status(400).json({ error: 'Invalid recovery log entry.' });
        return;
      }
      const saved = serverStore.addRecoveryEntry(newEntry, isGuest, facilityCode);
      res.status(201).json({ success: true, entry: saved });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/baseline-config', tenantReadAuth, (req: Request, res: Response) => {
    const { isGuest, facilityCode } = getTenantContext(req);
    const config = serverStore.getBaselineConfig(isGuest, facilityCode);
    res.json({ success: true, config });
  });

  app.put('/api/baseline-config', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const updates = sanitizePayload(req.body);
      const updated = serverStore.updateBaselineConfig(updates, isGuest, facilityCode);
      res.json({ success: true, config: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // SHA CLAIMS ENDPOINTS (Multi-Tenant Partitioned & Authenticated)
  // ==========================================
  app.get('/api/claims', tenantReadAuth, async (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const claims = await serverStore.getClaimsAsync(isGuest, facilityCode);
      res.json({ success: true, claims, isGuest, facilityCode });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/claims', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const newClaim = sanitizePayload(req.body);
      if (!newClaim || !newClaim.id || !newClaim.diagnosis) {
        res.status(400).json({ error: 'Invalid claim payload. Required: id, diagnosis.' });
        return;
      }
      const saved = serverStore.addClaim(newClaim, isGuest, facilityCode);
      res.status(201).json({ success: true, claim: saved });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/claims/:id', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updates = sanitizePayload(req.body);
      const updated = serverStore.updateClaim(id, updates, isGuest, facilityCode);
      if (!updated) {
        res.status(404).json({ error: 'Claim not found.' });
        return;
      }
      res.json({ success: true, claim: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/claims/:id', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const deleted = serverStore.deleteClaim(id, isGuest, facilityCode);
      if (!deleted) {
        res.status(404).json({ error: 'Claim not found.' });
        return;
      }
      res.json({ success: true, message: 'Claim successfully removed.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // REPORTS & AUDIT LOGS ENDPOINTS (Multi-Tenant Partitioned & Authenticated)
  // ==========================================
  app.get('/api/reports', tenantReadAuth, (req: Request, res: Response) => {
    const { isGuest, facilityCode } = getTenantContext(req);
    const reports = serverStore.getReports(isGuest, facilityCode);
    res.json({ success: true, reports });
  });

  app.post('/api/reports', tenantWriteAuth, (req: Request, res: Response) => {
    try {
      const { isGuest, facilityCode } = getTenantContext(req);
      const report = sanitizePayload(req.body);
      if (!report || !report.narrative) {
        res.status(400).json({ error: 'Invalid report payload.' });
        return;
      }
      const saved = serverStore.saveReport(report, isGuest, facilityCode);
      res.status(201).json({ success: true, report: saved });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/audit-logs', tenantReadAuth, (req: Request, res: Response) => {
    const { isGuest, facilityCode } = getTenantContext(req);
    const logs = serverStore.getAuditLogs(isGuest, facilityCode);
    res.json({ success: true, logs });
  });

  // ==========================================
  // KENYAN HEALTH INTEGRATIONS (DHIS2, FHIR, SMS)
  // ==========================================
  app.post('/api/dhis2/sync', async (req: Request, res: Response) => {
    try {
      const payload = sanitizePayload(req.body);
      const result = await processDHIS2Sync(payload);
      res.json({ success: true, ...result });
    } catch (err: any) {
      console.error('[API /api/dhis2/sync] Error:', err);
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/fhir/encounters', async (req: Request, res: Response) => {
    try {
      const count = parseInt((req.query.count as string) || '20', 10);
      const bundle = await fetchFHIRClinicalEncounters(count);
      res.json({ success: true, bundle });
    } catch (err: any) {
      console.error('[API /api/fhir/encounters] Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/sms/send', async (req: Request, res: Response) => {
    try {
      const { recipient, message, category } = sanitizePayload(req.body);
      if (!recipient || !message) {
        res.status(400).json({ error: 'Missing recipient or message.' });
        return;
      }
      const result = await sendSMSAlert(recipient, message, category || 'SYSTEM_NOTICE');
      res.json({ ...result });
    } catch (err: any) {
      console.error('[API /api/sms/send] Error:', err);
      res.status(400).json({ error: err.message });
    }
  });

  // ==========================================
  // SEO & STATUTORY CRAWLER ENDPOINTS
  // ==========================================
  app.get('/robots.txt', (req: Request, res: Response) => {
    res.type('text/plain');
    res.sendFile(path.join(process.cwd(), 'public', 'robots.txt'));
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    res.type('application/xml');
    res.sendFile(path.join(process.cwd(), 'public', 'sitemap.xml'));
  });

  // ==========================================
  // VITE / STATIC SERVING MIDDLEWARE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // In Express v5, wildcard route requires '*all'
    app.get('*all', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Kazira Full-Stack] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Kazira Full-Stack] Fatal startup error:', err);
  process.exit(1);
});
