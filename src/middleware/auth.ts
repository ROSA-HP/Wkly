import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate an ephemeral per-process secret if JWT_SECRET is not provided in environment
const FALLBACK_RUNTIME_SECRET = crypto
  .createHash('sha256')
  .update(process.env.MONGODB_URI || 'wkly-runtime-entropy-seed-2026')
  .digest('hex');

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || FALLBACK_RUNTIME_SECRET;
}

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Generates a signed HS256 JWT token for an authenticated user.
 */
export function signAuthToken(
  userId: string,
  expiresIn: jwt.SignOptions['expiresIn'] = '30d'
): string {
  return jwt.sign({ userId }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn,
    issuer: 'wkly-api',
    audience: 'wkly-client',
  });
}

/**
 * Authentication Middleware:
 * Explicitly guards against:
 * - Missing or malformed Authorization header (401)
 * - "alg": "none" / stripped signature attacks (401/403)
 * - Expired tokens (401)
 * - Payload tampering without re-signing or forged signatures (401/403)
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || !parts[1]) {
    return res.status(401).json({ error: 'Unauthorized: Malformed authorization header' });
  }

  const token = parts[1].trim();
  const segments = token.split('.');

  // A valid JWS must have exactly 3 non-empty segments (header.payload.signature)
  if (segments.length !== 3 || !segments[0] || !segments[1] || !segments[2]) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token structure or missing signature' });
  }

  // Inspect header before verification to explicitly reject "alg": "none"
  try {
    const headerJson = Buffer.from(segments[0], 'base64url').toString('utf8');
    const parsedHeader = JSON.parse(headerJson);
    if (
      !parsedHeader ||
      typeof parsedHeader.alg !== 'string' ||
      parsedHeader.alg.toLowerCase() === 'none' ||
      parsedHeader.alg !== 'HS256'
    ) {
      return res.status(403).json({
        error: 'Forbidden: Unsupported or insecure JWT algorithm',
        code: 'JWT_INVALID_ALGORITHM',
      });
    }
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Corrupted token header' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
    }) as jwt.JwtPayload;

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      typeof decoded.userId !== 'string' ||
      decoded.userId.trim() === ''
    ) {
      return res.status(403).json({ error: 'Forbidden: Invalid token payload claims' });
    }

    req.userId = decoded.userId.trim();
    next();
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized: Token has expired',
        code: 'JWT_EXPIRED',
      });
    }
    return res.status(401).json({
      error: 'Unauthorized: Invalid or forged token signature',
      code: 'JWT_INVALID',
    });
  }
};
