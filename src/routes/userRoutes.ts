import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  User,
  DEFAULT_DAILY_TOKEN_LIMIT,
  DEFAULT_MAX_TOKENS_PER_REQUEST,
  DEFAULT_DAILY_AI_REQUEST_LIMIT,
} from '../db/models/User.js';
import { requireAuth, signAuthToken, AuthRequest } from '../middleware/auth.js';
import {
  authRateLimiter,
  fail2BanGuard,
  recordFailedLoginAttempt,
  clearFailedLoginAttempts,
} from '../middleware/securityMiddleware.js';
import { getUserTokenQuota, attachTokenQuotaHeaders } from '../middleware/tokenQuota.js';

export const router = express.Router();

export interface FallbackUser {
  id: string;
  email: string;
  password: string;
  dailyTokenLimit: number;
  tokensUsedToday: number;
  maxTokensPerRequest: number;
  aiRequestsToday: number;
  dailyAiRequestLimit: number;
  createdAt: string;
}

const fallbackUsers: FallbackUser[] = [];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Strips the password hash from any user object before sending in an API response.
 * Mirrors Mongoose's `.select('-password')` behavior for the fallback memory store.
 */
export function sanitizeUserForResponse(user: Record<string, any>) {
  const { password: _password, __v: _v, ...safeUser } = user;
  return safeUser;
}

export const initDemoUser = async () => {
  const demoEmail = 'rosa.athlete@stanford.edu';
  const demoInitialKey = process.env.DEMO_USER_INITIAL_KEY || 'password123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(demoInitialKey, salt);

  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await User.findOne({ email: demoEmail }).select('-password');
      if (!existing) {
        await User.create({
          email: demoEmail,
          password: hashedPassword,
          dailyTokenLimit: DEFAULT_DAILY_TOKEN_LIMIT,
          tokensUsedToday: 0,
          maxTokensPerRequest: DEFAULT_MAX_TOKENS_PER_REQUEST,
        });
      }
    } catch (e) {
      console.warn('Could not seed demo user to Mongo:', e);
    }
  }

  if (!fallbackUsers.some((u) => u.email.toLowerCase() === demoEmail.toLowerCase())) {
    fallbackUsers.push({
      id: 'demo-athlete-1',
      email: demoEmail,
      password: hashedPassword,
      dailyTokenLimit: DEFAULT_DAILY_TOKEN_LIMIT,
      tokensUsedToday: 0,
      maxTokensPerRequest: DEFAULT_MAX_TOKENS_PER_REQUEST,
      aiRequestsToday: 0,
      dailyAiRequestLimit: DEFAULT_DAILY_AI_REQUEST_LIMIT,
      createdAt: new Date().toISOString(),
    });
  }
};

/**
 * POST /api/users/register
 * Protected by authRateLimiter against registration spam & brute-force.
 */
router.post(
  '/register',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawEmail = req.body?.email;
      const rawPassword = req.body?.password;

      if (typeof rawEmail !== 'string' || typeof rawPassword !== 'string') {
        res.status(400);
        return next(new Error('Email and password must be valid strings'));
      }

      const email = rawEmail.trim().toLowerCase();
      const password = rawPassword;

      if (!email || !password) {
        res.status(400);
        return next(new Error('Email and password are required'));
      }

      if (!EMAIL_REGEX.test(email) || email.length > 254) {
        res.status(400);
        return next(new Error('Please provide a valid email address'));
      }

      if (password.length < 8 || password.length > 128) {
        res.status(400);
        return next(new Error('Password must be between 8 and 128 characters'));
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      if (mongoose.connection.readyState === 1) {
        const existingUser = await User.findOne({ email }).select('-password');
        if (existingUser) {
          res.status(400);
          return next(new Error('Email already in use'));
        }

        const newUser = new User({
          email,
          password: hashedPassword,
          dailyTokenLimit: DEFAULT_DAILY_TOKEN_LIMIT,
          tokensUsedToday: 0,
          maxTokensPerRequest: DEFAULT_MAX_TOKENS_PER_REQUEST,
        });
        await newUser.save();

        const safeUser = await User.findById(newUser._id).select('-password').lean();
        return res.status(201).json({
          message: 'User registered successfully!',
          user: sanitizeUserForResponse(safeUser || newUser.toJSON()),
        });
      } else {
        const existing = fallbackUsers.find((u) => u.email.toLowerCase() === email);
        if (existing) {
          res.status(400);
          return next(new Error('Email already in use'));
        }
        const createdUser: FallbackUser = {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          email,
          password: hashedPassword,
          dailyTokenLimit: DEFAULT_DAILY_TOKEN_LIMIT,
          tokensUsedToday: 0,
          maxTokensPerRequest: DEFAULT_MAX_TOKENS_PER_REQUEST,
          aiRequestsToday: 0,
          dailyAiRequestLimit: DEFAULT_DAILY_AI_REQUEST_LIMIT,
          createdAt: new Date().toISOString(),
        };
        fallbackUsers.push(createdUser);

        return res.status(201).json({
          message: 'User registered successfully!',
          user: sanitizeUserForResponse(createdUser),
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/users/login
 * Protected by fail2BanGuard and authRateLimiter.
 */
router.post(
  '/login',
  fail2BanGuard,
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawEmail = req.body?.email;
      const rawPassword = req.body?.password;

      if (typeof rawEmail !== 'string' || typeof rawPassword !== 'string') {
        recordFailedLoginAttempt(req);
        res.status(400);
        return next(new Error('Email and password are required'));
      }

      const email = rawEmail.trim().toLowerCase();
      const password = rawPassword;

      if (!email || !password) {
        recordFailedLoginAttempt(req);
        res.status(400);
        return next(new Error('Email and password are required'));
      }

      let userId: string;
      let safeUserPayload: Record<string, any>;

      if (mongoose.connection.readyState === 1) {
        // Explicitly select '+password' only for bcrypt verification, then strip it
        const userWithPass = await User.findOne({ email }).select('+password');
        if (!userWithPass) {
          recordFailedLoginAttempt(req);
          res.status(400);
          return next(new Error('Invalid email or password'));
        }

        const isMatch = await bcrypt.compare(password, userWithPass.password);
        if (!isMatch) {
          recordFailedLoginAttempt(req);
          res.status(400);
          return next(new Error('Invalid email or password'));
        }
        userId = userWithPass._id.toString();
        const userWithoutPass = await User.findById(userId).select('-password').lean();
        safeUserPayload = sanitizeUserForResponse(userWithoutPass || userWithPass.toJSON());
      } else {
        const user = fallbackUsers.find((u) => u.email.toLowerCase() === email);
        if (!user) {
          recordFailedLoginAttempt(req);
          res.status(400);
          return next(new Error('Invalid email or password'));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          recordFailedLoginAttempt(req);
          res.status(400);
          return next(new Error('Invalid email or password'));
        }
        userId = user.id;
        safeUserPayload = sanitizeUserForResponse(user);
      }

      clearFailedLoginAttempts(req);
      const token = signAuthToken(userId, '30d');
      const tokenUsage = await getUserTokenQuota(userId);
      attachTokenQuotaHeaders(res, tokenUsage);

      res.json({
        token,
        message: 'Logged in successfully!',
        user: safeUserPayload,
        tokenUsage,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/users/demo-session
 * Automatically provisions an active session for Rosa without manual login prompts.
 */
router.post('/demo-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const demoEmail = 'rosa.athlete@stanford.edu';
    await initDemoUser();
    let userId = 'demo-athlete-1';

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: demoEmail }).select('-password').lean();
      if (user) {
        userId = user._id.toString();
      }
    }

    const token = signAuthToken(userId, '30d');
    const tokenUsage = await getUserTokenQuota(userId);
    attachTokenQuotaHeaders(res, tokenUsage);

    res.json({
      token,
      message: 'Demo session active',
      tokenUsage,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/me
 * Returns the authenticated user's profile with password strictly excluded (select: '-password')
 * and their current AI token quota status.
 */
router.get('/me', requireAuth, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const tokenUsage = await getUserTokenQuota(userId);
    attachTokenQuotaHeaders(res, tokenUsage);

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId).select('-password').lean();
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({
        user: sanitizeUserForResponse(user),
        tokenUsage,
      });
    } else {
      const user = fallbackUsers.find((u) => u.id === userId);
      if (!user) {
        return res.json({
          user: { id: userId, email: 'authenticated.user@wkly.app' },
          tokenUsage,
        });
      }
      return res.json({
        user: sanitizeUserForResponse(user),
        tokenUsage,
      });
    }
  } catch (error) {
    next(error);
  }
});
