import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// =========================================================================
// 1. RATE LIMITING MIDDLEWARE (Sliding Window in Memory)
// =========================================================================
interface RateBucket {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateBucket>();

// Clean up stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now > bucket.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyPrefix?: string;
}) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.', keyPrefix = 'rl' } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let bucket = rateLimitStore.get(key);
    if (!bucket || now > bucket.resetTime) {
      bucket = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(key, bucket);
    } else {
      bucket.count += 1;
    }

    const remaining = Math.max(0, maxRequests - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (bucket.count > maxRequests) {
      res.status(429).json({
        error: message,
        retryAfterSeconds: resetSeconds
      });
      return;
    }

    next();
  };
}

// =========================================================================
// 2. SECURITY HEADERS & FILE ACCESS HARDENING
// =========================================================================
export function applySecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // XSS Protection legacy header for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy - allowing fonts, scripts, Firebase and Google Auth, and iFrame embedding in AI Studio
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://apis.google.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://dhis2.health.go.ke https://kenyaemr.health.go.ke https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.google.com https://accounts.google.com wss://*.firebaseio.com; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com; frame-ancestors 'self' https://*.google.com https://*.run.app https://aistudio.google.com https://ai.studio;"
  );

  // Block sensitive file traversal & hidden file discovery (.env, .git, etc.)
  const lowerPath = req.path.toLowerCase();
  if (
    lowerPath.includes('.env') ||
    lowerPath.includes('.git')
  ) {
    res.status(403).json({ error: 'Access forbidden: Protected statutory resource.' });
    return;
  }

  next();
}

// =========================================================================
// 3. INPUT SANITIZATION (Anti-XSS & Payload Stripping)
// =========================================================================
export function sanitizeString(val: string): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
    .trim();
}

export function sanitizePayload<T>(input: T): T {
  if (typeof input === 'string') {
    return sanitizeString(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map(item => sanitizePayload(item)) as unknown as T;
  }
  if (input !== null && typeof input === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizePayload(value);
    }
    return sanitizedObj as T;
  }
  return input;
}

// =========================================================================
// 4. PASSWORD & AUTHENTICATION CRYPTOGRAPHY (SHA-256 + Salt)
// =========================================================================
function resolveAuthSecret(): string {
  const envSecret = process.env.AUTH_SECRET;

  if (envSecret && envSecret.trim().length >= 16 && envSecret !== 'kazira-kdpa-sovereign-salt-2026') {
    return envSecret.trim();
  }

  // Resilient cryptographic fallback:
  // When AUTH_SECRET is not explicitly injected by the cloud deployment environment (e.g. Cloud Run, Vercel),
  // retrieve or generate an unguessable 256-bit cryptographic secret for this runtime instance.
  // This guarantees tokens cannot be forged by external callers using public strings from the repository,
  // while ensuring zero container crash on deployment startup.
  const globalKey = '__kazira_runtime_auth_secret';
  if ((global as any)[globalKey]) {
    return (global as any)[globalKey];
  }

  // Attempt to read previously generated secret from disk if data dir is available
  try {
    const keyFile = path.join(process.cwd(), 'data', '.session_secret');
    if (fs.existsSync(keyFile)) {
      const stored = fs.readFileSync(keyFile, 'utf-8').trim();
      if (stored.length >= 32) {
        (global as any)[globalKey] = stored;
        return stored;
      }
    }
  } catch {}

  // Generate a cryptographically secure random 256-bit key
  const generated = crypto.randomBytes(32).toString('hex');
  (global as any)[globalKey] = generated;

  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(path.join(dataDir, '.session_secret'), generated, 'utf-8');
  } catch {}

  return generated;
}

const AUTH_SECRET = resolveAuthSecret();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours validity

export function hashPassword(password: string, salt: string = AUTH_SECRET): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function verifyPassword(provided: string, expectedHash: string, salt: string = AUTH_SECRET): boolean {
  const providedHash = hashPassword(provided, salt);
  return crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash));
}

export function generateSessionToken(userId: string, role: string, facilityCode?: string): string {
  const timestamp = Date.now();
  const safeFacility = (facilityCode || '').replace(/:/g, '_');
  const raw = `${userId}:${role}:${safeFacility}:${timestamp}:${crypto.randomBytes(16).toString('hex')}`;
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(raw).digest('hex');
  return Buffer.from(`${raw}:${signature}`).toString('base64');
}

export function verifySessionToken(token: string): {
  valid: boolean;
  userId?: string;
  role?: string;
  facilityCode?: string;
  expired?: boolean;
} {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    
    // Support 6-part token (with facility) and legacy 5-part token (without facility)
    if (parts.length === 6) {
      const [userId, role, facilityCode, timestampStr, nonce, signature] = parts;
      const raw = `${userId}:${role}:${facilityCode}:${timestampStr}:${nonce}`;
      const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(raw).digest('hex');

      if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        const timestamp = parseInt(timestampStr, 10);
        if (Date.now() - timestamp > SESSION_TTL_MS) {
          return { valid: false, expired: true };
        }
        return { valid: true, userId, role, facilityCode: facilityCode || undefined };
      }
    } else if (parts.length === 5) {
      const [userId, role, timestampStr, nonce, signature] = parts;
      const raw = `${userId}:${role}:${timestampStr}:${nonce}`;
      const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(raw).digest('hex');

      if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        const timestamp = parseInt(timestampStr, 10);
        if (Date.now() - timestamp > SESSION_TTL_MS) {
          return { valid: false, expired: true };
        }
        return { valid: true, userId, role };
      }
    }
  } catch {
    // Malformed token
  }
  return { valid: false };
}

// =========================================================================
// 5. TENANT AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// =========================================================================
export interface AuthenticatedUser {
  userId: string;
  role: string;
  facilityCode?: string;
  isGuest: boolean;
}

export function requireAuth(options: { allowGuest?: boolean; requireRoles?: string[] } = { allowGuest: true }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    // Strict Rule: Every API caller MUST supply a cryptographically signed Bearer session token.
    // Client-controlled headers (like 'x-is-guest: true' or 'x-facility-code') CANNOT grant access without a valid token.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required. Missing Bearer session token.',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const verification = verifySessionToken(token);

    if (!verification.valid || !verification.userId || !verification.role) {
      if (verification.expired) {
        res.status(401).json({
          error: 'Session expired. Please log in again to continue.',
          code: 'SESSION_EXPIRED'
        });
        return;
      }
      res.status(401).json({
        error: 'Authentication failed. Invalid or tampered session token.',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    const isGuestToken = verification.role === 'guest' || verification.userId === 'guest-sandbox';

    // Verify role permissions if specified
    if (options.requireRoles && !options.requireRoles.includes(verification.role)) {
      res.status(403).json({
        error: 'Access denied: Insufficient privileges for this clinical resource.',
        code: 'FORBIDDEN'
      });
      return;
    }

    if (!options.allowGuest && isGuestToken) {
      res.status(403).json({
        error: 'Access denied: Guest accounts cannot modify live hospital records.',
        code: 'GUEST_FORBIDDEN'
      });
      return;
    }

    // Strict tenant boundary enforcement:
    // 1. Guest tokens are IMMUTABLY bound to the synthetic demo clinic partition ('MFL #DEMO-01').
    // 2. Regular clinic admins and staff are IMMUTABLY bound to the facilityCode inside their verified token.
    //    They CANNOT spoof another facility by passing an x-facility-code header.
    // 3. Only verified statutory oversight roles (county_health, moh) may pass a target facility query parameter.
    let tenantFacility = verification.facilityCode;

    if (isGuestToken) {
      tenantFacility = 'MFL #DEMO-01';
    } else if (verification.role === 'county_health' || verification.role === 'moh') {
      const requestedFacility = (req.query.targetFacility as string) || (req.headers['x-target-facility'] as string);
      if (requestedFacility && /^[a-zA-Z0-9_\-\s#]+$/.test(requestedFacility)) {
        tenantFacility = requestedFacility.trim();
      } else {
        tenantFacility = verification.facilityCode || 'MOH-OVERSIGHT';
      }
    } else {
      tenantFacility = verification.facilityCode || 'MFL #UNASSIGNED';
    }

    (req as any).user = {
      userId: verification.userId,
      role: verification.role,
      facilityCode: tenantFacility,
      isGuest: isGuestToken
    };

    next();
  };
}
