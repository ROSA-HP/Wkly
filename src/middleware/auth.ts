import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key';

/**
 * We need to tell TypeScript that we are adding a custom 'userId' property 
 * to the standard Express Request object.
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Authentication Middleware
 * This acts as a security guard. Any request that tries to pass through here 
 * MUST have a valid JWT token.
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Look for the token in the headers sent by React
  // React usually sends it like this: "Authorization: Bearer <token_string>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  // 2. Extract just the token string (remove the "Bearer " part)
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token using our secret key
    // If the hacker made up a fake token, this will fail and throw an error.
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // 4. Attach the real user ID to the request object!
    // Now, any route that runs AFTER this middleware knows exactly who is logged in.
    req.userId = decoded.userId;

    // 5. Allow the request to continue to the actual route (like router.get('/tasks'))
    next();
  } catch (error) {
    // If the token is fake, expired, or corrupted
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
