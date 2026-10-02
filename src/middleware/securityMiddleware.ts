import { Request, Response, NextFunction } from 'express';

export const MAX_JSON_DEPTH = 6;
export const MAX_ARRAY_ITEMS = 50;
export const MAX_STRING_LENGTH = 4000;

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Strips dangerous XSS vectors (<script> tags, javascript: URIs, inline event handlers)
 * from user-supplied strings while preserving legitimate planner text.
 */
export function sanitizeStringValue(input: string): string {
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*script[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/\bon(?:error|load|click|mouseover|focus|blur)\s*=/gi, '')
    .slice(0, MAX_STRING_LENGTH);
}

/**
 * Recursively inspects and sanitizes an object/array for:
 * 1. Excessive nesting depth (DoS via deeply nested JSON)
 * 2. Oversized arrays
 * 3. NoSQL operator injection (keys starting with '$')
 * 4. Prototype pollution ('__proto__', 'constructor', 'prototype')
 * 5. XSS script injection in string values
 */
export function inspectAndSanitizePayload(
  value: unknown,
  currentDepth = 0
): { sanitized: any; violation?: string } {
  if (currentDepth > MAX_JSON_DEPTH) {
    return {
      sanitized: null,
      violation: `Payload exceeds maximum allowed nesting depth of ${MAX_JSON_DEPTH}`,
    };
  }

  if (value === null || value === undefined) {
    return { sanitized: value };
  }

  if (typeof value === 'string') {
    return { sanitized: sanitizeStringValue(value) };
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return { sanitized: value };
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_ITEMS) {
      return {
        sanitized: null,
        violation: `Array exceeds maximum allowed length of ${MAX_ARRAY_ITEMS} items`,
      };
    }
    const sanitizedArr: any[] = [];
    for (const item of value) {
      const res = inspectAndSanitizePayload(item, currentDepth + 1);
      if (res.violation) return res;
      sanitizedArr.push(res.sanitized);
    }
    return { sanitized: sanitizedArr };
  }

  if (typeof value === 'object') {
    const rawKeys = Object.keys(value as Record<string, unknown>);
    if (rawKeys.length > 60) {
      return {
        sanitized: null,
        violation: 'Object contains too many keys (maximum 60 keys allowed)',
      };
    }

    // Explicitly check if __proto__ was set as an own property in JSON parse
    if (Object.prototype.hasOwnProperty.call(value, '__proto__')) {
      return {
        sanitized: null,
        violation: 'Prototype pollution key (__proto__) is prohibited',
      };
    }

    const cleanObj: Record<string, any> = {};
    for (const key of rawKeys) {
      if (DANGEROUS_KEYS.has(key)) {
        return {
          sanitized: null,
          violation: `Forbidden prototype key "${key}" detected in payload`,
        };
      }
      if (key.startsWith('$') || key.includes('.')) {
        return {
          sanitized: null,
          violation: `NoSQL operator or dotted key "${key}" is prohibited`,
        };
      }
      const propVal = (value as Record<string, unknown>)[key];
      const res = inspectAndSanitizePayload(propVal, currentDepth + 1);
      if (res.violation) return res;
      cleanObj[key] = res.sanitized;
    }
    return { sanitized: cleanObj };
  }

  return { sanitized: undefined };
}

/**
 * DAST & TLS/HSTS Security Headers Middleware (OWASP ZAP & SSL Labs Best Practices)
 */
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. HSTS (HTTP Strict Transport Security - TLS 1.3 / HTTPS enforcement)
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // 2. Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 3. Clickjacking protection (SAMEORIGIN allows AI Studio preview iframe on same origin)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // 4. Modern XSS Header (0 in favor of strong Content-Security-Policy per OWASP)
  res.setHeader('X-XSS-Protection', '0');

  // 5. Content Security Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: ws: wss:; frame-ancestors 'self' https://*.run.app https://aistudio.google.com; object-src 'none'; base-uri 'self';"
  );

  // 6. Referrer & Permissions Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // 7. Prevent caching of sensitive API responses
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * Strict CORS Middleware
 */
export const corsPolicyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOriginPattern =
    /^https?:\/\/(localhost(:\d+)?|127\.0\.0\.1(:\d+)?|[a-z0-9-]+\.europe-west2\.run\.app)$/;

  if (origin) {
    if (allowedOriginPattern.test(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '600');
    } else if (req.path.startsWith('/api')) {
      // Do not grant CORS headers to untrusted origins; reject preflight immediately
      if (req.method === 'OPTIONS') {
        return res.status(403).json({ error: 'CORS Error: Origin not allowed' });
      }
    }
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};

/**
 * Deep Payload Sanitizer Middleware for all API routes
 */
export const payloadSanitizerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    const bodyCheck = inspectAndSanitizePayload(req.body, 0);
    if (bodyCheck.violation) {
      return res.status(400).json({
        error: `Security Validation Failed: ${bodyCheck.violation}`,
        code: 'PAYLOAD_SECURITY_VIOLATION',
      });
    }
    req.body = bodyCheck.sanitized;
  }

  if (req.query && typeof req.query === 'object') {
    const queryCheck = inspectAndSanitizePayload(req.query, 0);
    if (queryCheck.violation) {
      return res.status(400).json({
        error: `Security Validation Failed in query: ${queryCheck.violation}`,
        code: 'QUERY_SECURITY_VIOLATION',
      });
    }
  }

  next();
};

/**
 * Rate Limiter & Fail2Ban State
 */
interface RateBucket {
  count: number;
  resetAt: number;
}

interface Fail2BanRecord {
  failures: number;
  blockedUntil: number;
}

const rateBuckets = new Map<string, RateBucket>();
const fail2BanStore = new Map<string, Fail2BanRecord>();

export function getClientKey(req: Request): string {
  const testClientIp = req.headers['x-test-client-ip'];
  if (typeof testClientIp === 'string' && testClientIp.trim()) {
    return testClientIp.trim();
  }
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown-ip';
}

export function createRateLimiter(options: {
  name: string;
  windowMs: number;
  maxRequests: number;
  message: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${options.name}:${getClientKey(req)}`;
    let bucket = rateBuckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = {
        count: 0,
        resetAt: now + options.windowMs,
      };
      rateBuckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, options.maxRequests - bucket.count);
    const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

    res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', new Date(bucket.resetAt).toISOString());

    if (bucket.count > options.maxRequests) {
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: options.message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: retryAfterSec,
      });
    }

    next();
  };
}

/**
 * Auth Rate Limiter: Max 10 burst login/registration requests per 15-minute window per IP.
 */
export const authRateLimiter = createRateLimiter({
  name: 'auth',
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
});

/**
 * General API Rate Limiter: Max 120 requests per minute per IP.
 */
export const apiRateLimiter = createRateLimiter({
  name: 'api',
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'Too many API requests. Please slow down.',
});

/**
 * Fail2Ban Brute-Force IP Lockout Guard:
 * Blocks an IP for 15 minutes after 5 consecutive failed login attempts.
 */
export const FAIL2BAN_MAX_FAILURES = 5;
export const FAIL2BAN_BAN_DURATION_MS = 15 * 60 * 1000;

export const fail2BanGuard = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = getClientKey(req);
  const record = fail2BanStore.get(clientIp);
  const now = Date.now();

  if (record && record.blockedUntil > now) {
    const retrySec = Math.ceil((record.blockedUntil - now) / 1000);
    res.setHeader('Retry-After', String(retrySec));
    return res.status(429).json({
      error: `Fail2Ban Protection: IP (${clientIp}) is temporarily blocked due to repeated failed login attempts.`,
      code: 'FAIL2BAN_IP_BLOCKED',
      retryAfterSeconds: retrySec,
    });
  }

  next();
};

export function recordFailedLoginAttempt(req: Request): void {
  const clientIp = getClientKey(req);
  const now = Date.now();
  const record = fail2BanStore.get(clientIp) || { failures: 0, blockedUntil: 0 };
  record.failures += 1;
  if (record.failures >= FAIL2BAN_MAX_FAILURES) {
    record.blockedUntil = now + FAIL2BAN_BAN_DURATION_MS;
  }
  fail2BanStore.set(clientIp, record);
}

export function clearFailedLoginAttempts(req: Request): void {
  const clientIp = getClientKey(req);
  fail2BanStore.delete(clientIp);
}

export function resetSecurityStoresForTesting(): void {
  rateBuckets.clear();
  fail2BanStore.clear();
}
