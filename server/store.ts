import fs from 'fs';
import path from 'path';
import { DebtItem, RecoveryLogEntry, BaselineConfig, ReportOutput, ShaClaim, INITIAL_SHA_CLAIMS, UserProfile } from '../types';
import { INITIAL_DEBT_ITEMS, INITIAL_RECOVERY_ENTRIES, DEFAULT_BASELINE_CONFIG } from '../constants/sampleDebts';
import { adminDb, isFirestoreAdminAvailable } from './firebaseAdmin';

export interface SyncAuditLog {
  id: string;
  type: 'DHIS2' | 'FHIR' | 'SMS' | 'AI_REPORT';
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  summary: string;
  referenceId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ServerDataStore {
  debts: DebtItem[];
  recoveryEntries: RecoveryLogEntry[];
  claims: ShaClaim[];
  baselineConfig: BaselineConfig;
  reports: ReportOutput[];
  auditLogs: SyncAuditLog[];
}

interface RootPersistence {
  guest: ServerDataStore;
  facilities: Record<string, ServerDataStore>;
  registeredProfiles?: UserProfile[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'kazira_store.json');

class Store {
  private guestData: ServerDataStore;
  private facilityData: Record<string, ServerDataStore>;
  private registeredProfiles: UserProfile[];

  constructor() {
    this.guestData = {
      debts: [...INITIAL_DEBT_ITEMS],
      recoveryEntries: [...INITIAL_RECOVERY_ENTRIES],
      claims: [...INITIAL_SHA_CLAIMS],
      baselineConfig: { ...DEFAULT_BASELINE_CONFIG },
      reports: [],
      auditLogs: []
    };
    this.facilityData = {};
    this.registeredProfiles = [];
    this.loadFromDisk();
  }

  private getStore(isGuest: boolean = true, facilityId: string = 'MFL #14920'): ServerDataStore {
    if (isGuest) {
      return this.guestData;
    }
    const cleanKey = (facilityId || 'MFL #14920').trim();
    if (!this.facilityData[cleanKey]) {
      this.facilityData[cleanKey] = {
        debts: [], // Real users start with zero mock/dummy data
        recoveryEntries: [],
        claims: [], // Real users start with zero mock claims
        baselineConfig: {
          ...DEFAULT_BASELINE_CONFIG,
          hospitalName: cleanKey
        },
        reports: [],
        auditLogs: []
      };
    }
    return this.facilityData[cleanKey];
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.guest) {
          if (Array.isArray(parsed.guest.debts)) this.guestData.debts = parsed.guest.debts;
          if (Array.isArray(parsed.guest.recoveryEntries)) this.guestData.recoveryEntries = parsed.guest.recoveryEntries;
          if (Array.isArray(parsed.guest.claims)) this.guestData.claims = parsed.guest.claims;
          if (parsed.guest.baselineConfig) this.guestData.baselineConfig = parsed.guest.baselineConfig;
          if (Array.isArray(parsed.guest.reports)) this.guestData.reports = parsed.guest.reports;
          if (Array.isArray(parsed.guest.auditLogs)) this.guestData.auditLogs = parsed.guest.auditLogs;
        } else if (parsed.debts) {
          // Backward compatibility
          this.guestData.debts = parsed.debts;
        }
        if (parsed.facilities && typeof parsed.facilities === 'object') {
          this.facilityData = parsed.facilities;
        }
        if (Array.isArray(parsed.registeredProfiles)) {
          this.registeredProfiles = parsed.registeredProfiles;
        }
      }
    } catch (e) {
      console.warn('[Store] Could not load stored state from disk, using defaults:', e);
    }
  }

  private saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const payload: RootPersistence = {
        guest: this.guestData,
        facilities: this.facilityData,
        registeredProfiles: this.registeredProfiles
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e: any) {
      console.warn('[Store] Ephemeral filesystem detected (e.g. serverless environment). Local disk write bypassed. Production state persists via Cloud Firestore / PostgreSQL:', e?.message || e);
    }
  }

  // Debts
  public async getDebtsAsync(isGuest: boolean = true, facilityId?: string): Promise<DebtItem[]> {
    const store = this.getStore(isGuest, facilityId);
    if (isGuest || !facilityId) {
      return [...store.debts];
    }

    if (isFirestoreAdminAvailable) {
      try {
        const cleanFac = facilityId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const snap = await adminDb.collection('facilities').doc(cleanFac).collection('debts').limit(150).get();
        if (!snap.empty) {
          const firestoreItems: DebtItem[] = [];
          snap.forEach(docSnap => {
            firestoreItems.push({ id: docSnap.id, ...docSnap.data() } as DebtItem);
          });
          store.debts = firestoreItems;
          this.saveToDisk();
          return firestoreItems;
        }
      } catch (e: any) {
        // Fallback silently if permissions are insufficient in container
      }
    }

    return [...store.debts];
  }

  public getDebts(isGuest: boolean = true, facilityId?: string): DebtItem[] {
    const store = this.getStore(isGuest, facilityId);
    return [...store.debts];
  }

  public addDebt(item: DebtItem, isGuest: boolean = true, facilityId?: string): DebtItem {
    const store = this.getStore(isGuest, facilityId);
    store.debts = [item, ...store.debts];
    this.saveToDisk();

    // Async write to authoritative Firestore database
    if (!isGuest && facilityId && isFirestoreAdminAvailable) {
      const cleanFac = facilityId.replace(/[^a-zA-Z0-9_-]/g, '_');
      adminDb.collection('facilities').doc(cleanFac).collection('debts').doc(item.id)
        .set(item, { merge: true })
        .catch(() => {});
    }

    return item;
  }

  public addDebtsBatch(items: DebtItem[], isGuest: boolean = true, facilityId?: string): DebtItem[] {
    const store = this.getStore(isGuest, facilityId);
    store.debts = [...items, ...store.debts];
    this.saveToDisk();

    if (!isGuest && facilityId && items.length > 0 && isFirestoreAdminAvailable) {
      const cleanFac = facilityId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const batch = adminDb.batch();
      for (const item of items) {
        const docRef = adminDb.collection('facilities').doc(cleanFac).collection('debts').doc(item.id);
        batch.set(docRef, item, { merge: true });
      }
      batch.commit().catch(() => {});
    }

    return items;
  }

  public updateDebt(id: string, updates: Partial<DebtItem>, isGuest: boolean = true, facilityId?: string): DebtItem | null {
    const store = this.getStore(isGuest, facilityId);
    const index = store.debts.findIndex(d => d.id === id);
    if (index === -1) return null;
    const updated = { ...store.debts[index], ...updates };
    store.debts[index] = updated;

    // Synchronize to recovery log if collected, dismissed, or escalated
    if (updated.status === 'collected' || updated.status === 'dismissed' || updated.status === 'escalated') {
      const existingLogIdx = store.recoveryEntries.findIndex(r => r.debtItemId === updated.id);
      const logEntry: RecoveryLogEntry = {
        id: existingLogIdx >= 0 ? store.recoveryEntries[existingLogIdx].id : `REC-${Date.now()}-${updated.id}`,
        debtItemId: updated.id,
        patientRef: updated.patientRef,
        procedureName: updated.procedureName,
        detectedKes: updated.estimatedKes,
        actionedKes: updated.estimatedKes,
        collectedKes: updated.status === 'collected' ? (updated.amountCollectedKes || updated.estimatedKes) : 0,
        attribution: updated.attribution,
        date: updated.resolvedAt || new Date().toISOString().split('T')[0],
        status: updated.status,
        invoiceRef: updated.invoiceRef,
        resolutionNote: updated.resolutionNote || (updated.status === 'collected' ? 'Verified invoice payment' : '')
      };

      if (existingLogIdx >= 0) {
        store.recoveryEntries[existingLogIdx] = logEntry;
      } else {
        store.recoveryEntries = [logEntry, ...store.recoveryEntries];
      }
    }

    this.saveToDisk();

    // Async write to authoritative Firestore database
    if (!isGuest && facilityId && isFirestoreAdminAvailable) {
      const cleanFac = facilityId.replace(/[^a-zA-Z0-9_-]/g, '_');
      adminDb.collection('facilities').doc(cleanFac).collection('debts').doc(id)
        .set(updated, { merge: true })
        .catch(() => {});
    }

    return updated;
  }

  public deleteDebt(id: string, isGuest: boolean = true, facilityId?: string): boolean {
    const store = this.getStore(isGuest, facilityId);
    const beforeLen = store.debts.length;
    store.debts = store.debts.filter(d => d.id !== id);
    if (store.debts.length !== beforeLen) {
      this.saveToDisk();

      if (!isGuest && facilityId && isFirestoreAdminAvailable) {
        const cleanFac = facilityId.replace(/[^a-zA-Z0-9_-]/g, '_');
        adminDb.collection('facilities').doc(cleanFac).collection('debts').doc(id)
          .delete()
          .catch(() => {});
      }

      return true;
    }
    return false;
  }

  // SHA Claims (Multi-Tenant Partitioned via Firestore System of Record)
  public async getClaimsAsync(isGuest: boolean = true, facilityId?: string): Promise<ShaClaim[]> {
    const store = this.getStore(isGuest, facilityId);
    if (isGuest || !facilityId) {
      return [...(store.claims || [])];
    }

    if (isFirestoreAdminAvailable) {
      try {
        const cleanFac = facilityId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const snap = await adminDb.collection('facilities').doc(cleanFac).collection('claims').limit(150).get();
        if (!snap.empty) {
          const firestoreClaims: ShaClaim[] = [];
          snap.forEach(docSnap => {
            firestoreClaims.push({ id: docSnap.id, ...docSnap.data() } as ShaClaim);
          });
          store.claims = firestoreClaims;
          this.saveToDisk();
          return firestoreClaims;
        }
      } catch (e: any) {
        // Fallback silently if permissions are insufficient in container
      }
    }

    return [...(store.claims || [])];
  }

  // Recovery Log
  public getRecoveryEntries(isGuest: boolean = true, facilityId?: string): RecoveryLogEntry[] {
    const store = this.getStore(isGuest, facilityId);
    return [...store.recoveryEntries];
  }

  public addRecoveryEntry(entry: RecoveryLogEntry, isGuest: boolean = true, facilityId?: string): RecoveryLogEntry {
    const store = this.getStore(isGuest, facilityId);
    store.recoveryEntries = [entry, ...store.recoveryEntries];
    this.saveToDisk();
    return entry;
  }

  // Baseline Config
  public getBaselineConfig(isGuest: boolean = true, facilityId?: string): BaselineConfig {
    const store = this.getStore(isGuest, facilityId);
    return { ...store.baselineConfig };
  }

  public updateBaselineConfig(config: Partial<BaselineConfig>, isGuest: boolean = true, facilityId?: string): BaselineConfig {
    const store = this.getStore(isGuest, facilityId);
    store.baselineConfig = { ...store.baselineConfig, ...config };
    this.saveToDisk();
    return store.baselineConfig;
  }

  // Reports
  public getReports(isGuest: boolean = true, facilityId?: string): ReportOutput[] {
    const store = this.getStore(isGuest, facilityId);
    return [...store.reports];
  }

  public saveReport(report: ReportOutput, isGuest: boolean = true, facilityId?: string): ReportOutput {
    const store = this.getStore(isGuest, facilityId);
    store.reports = [report, ...store.reports.slice(0, 19)];
    this.logAudit({
      id: `AUDIT-${Date.now()}`,
      type: 'AI_REPORT',
      status: 'SUCCESS',
      summary: `Generated weekly narrative & audited metrics (${report.metrics?.revenueThisWeek ? `KES ${report.metrics.revenueThisWeek.toLocaleString()}` : 'N/A'})`,
      timestamp: new Date().toISOString()
    }, isGuest, facilityId);
    this.saveToDisk();
    return report;
  }

  // Audit Logs
  public getAuditLogs(isGuest: boolean = true, facilityId?: string): SyncAuditLog[] {
    const store = this.getStore(isGuest, facilityId);
    return [...store.auditLogs];
  }

  public logAudit(log: SyncAuditLog, isGuest: boolean = true, facilityId?: string) {
    const store = this.getStore(isGuest, facilityId);
    store.auditLogs = [log, ...store.auditLogs.slice(0, 49)];
    this.saveToDisk();
  }

  // SHA Claims (Multi-Tenant Partitioned)
  public getClaims(isGuest: boolean = true, facilityId?: string): ShaClaim[] {
    const store = this.getStore(isGuest, facilityId);
    return [...(store.claims || [])];
  }

  public addClaim(claim: ShaClaim, isGuest: boolean = true, facilityId?: string): ShaClaim {
    const store = this.getStore(isGuest, facilityId);
    store.claims = [claim, ...(store.claims || [])];
    this.saveToDisk();

    if (!isGuest && facilityId && isFirestoreAdminAvailable) {
      const cleanFac = facilityId.replace(/[^a-zA-Z0-9_-]/g, '_');
      adminDb.collection('facilities').doc(cleanFac).collection('claims').doc(claim.id)
        .set(claim, { merge: true })
        .catch(() => {});
    }

    return claim;
  }

  public updateClaim(id: string, updates: Partial<ShaClaim>, isGuest: boolean = true, facilityId?: string): ShaClaim | null {
    const store = this.getStore(isGuest, facilityId);
    if (!store.claims) store.claims = [];
    const index = store.claims.findIndex(c => c.id === id);
    if (index === -1) return null;
    const updated = { ...store.claims[index], ...updates };
    store.claims[index] = updated;
    this.saveToDisk();

    if (!isGuest && facilityId && isFirestoreAdminAvailable) {
      const cleanFac = facilityId.replace(/[^a-zA-Z0-9_-]/g, '_');
      adminDb.collection('facilities').doc(cleanFac).collection('claims').doc(id)
        .set(updated, { merge: true })
        .catch(() => {});
    }

    return updated;
  }

  public deleteClaim(id: string, isGuest: boolean = true, facilityId?: string): boolean {
    const store = this.getStore(isGuest, facilityId);
    if (!store.claims) return false;
    const beforeLen = store.claims.length;
    store.claims = store.claims.filter(c => c.id !== id);
    if (store.claims.length !== beforeLen) {
      this.saveToDisk();

      if (!isGuest && facilityId && isFirestoreAdminAvailable) {
        const cleanFac = facilityId.replace(/[^a-zA-Z0-9_-]/g, '_');
        adminDb.collection('facilities').doc(cleanFac).collection('claims').doc(id)
          .delete()
          .catch(() => {});
      }

      return true;
    }
    return false;
  }

  // Registered Facility Profiles (Persistent Server-Side Accounts)
  public getRegisteredProfiles(): UserProfile[] {
    return [...this.registeredProfiles];
  }

  public addRegisteredProfile(profile: UserProfile): UserProfile {
    const filtered = this.registeredProfiles.filter(p => p.id !== profile.id && p.facilityCode !== profile.facilityCode);
    this.registeredProfiles = [...filtered, profile];
    // Also ensure their tenant store is initialized cleanly
    this.getStore(false, profile.facilityCode);
    this.saveToDisk();

    // Async sync to Firestore users collection
    if (profile.id && isFirestoreAdminAvailable) {
      const cleanFac = profile.facilityCode ? profile.facilityCode.replace(/[^a-zA-Z0-9_-]/g, '_') : '';
      adminDb.collection('users').doc(profile.id).set({
        ...profile,
        facilityId: cleanFac,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }

    return profile;
  }

  public updateRegisteredProfile(profile: UserProfile): UserProfile {
    const idx = this.registeredProfiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      this.registeredProfiles[idx] = profile;
    } else {
      this.registeredProfiles.push(profile);
    }
    this.saveToDisk();
    return profile;
  }
}

export const serverStore = new Store();
