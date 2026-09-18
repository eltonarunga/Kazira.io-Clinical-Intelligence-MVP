import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

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

  // Frame protection for clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // XSS Protection legacy header for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy - allowing fonts, scripts, and sovereign styling
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://dhis2.health.go.ke https://kenyaemr.health.go.ke; frame-ancestors 'self' https://ais-pre-*.run.app https://ai.studio https://*.google.com;"
  );

  // Block sensitive file traversal & hidden file discovery
  const lowerPath = req.path.toLowerCase();
  if (
    lowerPath.includes('.env') ||
    lowerPath.includes('.git') ||
    lowerPath.includes('/data/') ||
    lowerPath.endsWith('.json') && !req.path.startsWith('/api') && req.path !== '/manifest.json'
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
const AUTH_SECRET = process.env.AUTH_SECRET || 'kazira-kdpa-sovereign-salt-2026';

export function hashPassword(password: string, salt: string = AUTH_SECRET): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

export function verifyPassword(provided: string, expectedHash: string, salt: string = AUTH_SECRET): boolean {
  const providedHash = hashPassword(provided, salt);
  return crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash));
}

export function generateSessionToken(userId: string, role: string): string {
  const timestamp = Date.now();
  const raw = `${userId}:${role}:${timestamp}:${crypto.randomBytes(16).toString('hex')}`;
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(raw).digest('hex');
  return Buffer.from(`${raw}:${signature}`).toString('base64');
}

export function verifySessionToken(token: string): { valid: boolean; userId?: string; role?: string } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length < 5) return { valid: false };

    const [userId, role, timestamp, nonce, signature] = parts;
    const raw = `${userId}:${role}:${timestamp}:${nonce}`;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(raw).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return { valid: true, userId, role };
    }
  } catch {
    // Malformed token
  }
  return { valid: false };
}
