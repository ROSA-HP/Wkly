import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import {
  User,
  DEFAULT_DAILY_TOKEN_LIMIT,
  DEFAULT_MAX_TOKENS_PER_REQUEST,
  DEFAULT_DAILY_AI_REQUEST_LIMIT,
} from '../db/models/User.js';
import { AuthRequest } from './auth.js';

export const MAX_PROMPT_CHARS = 1000;

export interface UserTokenQuotaState {
  userId: string;
  dailyTokenLimit: number;
  tokensUsedToday: number;
  remainingTokens: number;
  maxTokensPerRequest: number;
  aiRequestsToday: number;
  dailyAiRequestLimit: number;
  lastTokenResetDate: string;
  resetAtIso: string;
}

interface InternalLedgerEntry {
  dailyTokenLimit: number;
  tokensUsedToday: number;
  maxTokensPerRequest: number;
  aiRequestsToday: number;
  dailyAiRequestLimit: number;
  lastTokenResetDate: string;
}

const memoryTokenLedger = new Map<string, InternalLedgerEntry>();

function getTodayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function getNextUtcMidnightIso(): string {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );
  return tomorrow.toISOString();
}

/**
 * Estimates the token count for a string (~4 characters per token, plus safety floor).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const cleaned = String(text).trim();
  if (!cleaned) return 0;
  return Math.max(1, Math.ceil(cleaned.length / 4));
}

function getOrInitMemoryQuota(userId: string): InternalLedgerEntry {
  const today = getTodayUtcDateString();
  let entry = memoryTokenLedger.get(userId);
  if (!entry) {
    entry = {
      dailyTokenLimit: DEFAULT_DAILY_TOKEN_LIMIT,
      tokensUsedToday: 0,
      maxTokensPerRequest: DEFAULT_MAX_TOKENS_PER_REQUEST,
      aiRequestsToday: 0,
      dailyAiRequestLimit: DEFAULT_DAILY_AI_REQUEST_LIMIT,
      lastTokenResetDate: today,
    };
    memoryTokenLedger.set(userId, entry);
  } else if (entry.lastTokenResetDate !== today) {
    entry.tokensUsedToday = 0;
    entry.aiRequestsToday = 0;
    entry.lastTokenResetDate = today;
  }
  return entry;
}

/**
 * Retrieves the current token quota state for a user, syncing with MongoDB if connected.
 */
export async function getUserTokenQuota(userId: string): Promise<UserTokenQuotaState> {
  const today = getTodayUtcDateString();
  const mem = getOrInitMemoryQuota(userId);

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const userDoc = await User.findById(userId).select('-password');
      if (userDoc) {
        if (userDoc.lastTokenResetDate !== today) {
          userDoc.tokensUsedToday = 0;
          userDoc.aiRequestsToday = 0;
          userDoc.lastTokenResetDate = today;
          await userDoc.save();
        }
        mem.dailyTokenLimit = userDoc.dailyTokenLimit ?? DEFAULT_DAILY_TOKEN_LIMIT;
        mem.tokensUsedToday = userDoc.tokensUsedToday ?? 0;
        mem.maxTokensPerRequest = userDoc.maxTokensPerRequest ?? DEFAULT_MAX_TOKENS_PER_REQUEST;
        mem.aiRequestsToday = userDoc.aiRequestsToday ?? 0;
        mem.dailyAiRequestLimit = userDoc.dailyAiRequestLimit ?? DEFAULT_DAILY_AI_REQUEST_LIMIT;
        mem.lastTokenResetDate = userDoc.lastTokenResetDate || today;
      }
    } catch {
      // Fallback to memory ledger if DB query fails
    }
  }

  const remainingTokens = Math.max(0, mem.dailyTokenLimit - mem.tokensUsedToday);
  return {
    userId,
    dailyTokenLimit: mem.dailyTokenLimit,
    tokensUsedToday: mem.tokensUsedToday,
    remainingTokens,
    maxTokensPerRequest: mem.maxTokensPerRequest,
    aiRequestsToday: mem.aiRequestsToday,
    dailyAiRequestLimit: mem.dailyAiRequestLimit,
    lastTokenResetDate: mem.lastTokenResetDate,
    resetAtIso: getNextUtcMidnightIso(),
  };
}

/**
 * Records actual tokens consumed by an AI request for a user.
 */
export async function recordUserTokenConsumption(
  userId: string,
  tokensConsumed: number
): Promise<UserTokenQuotaState> {
  const sanitizedDelta = Math.max(1, Math.round(Number(tokensConsumed) || 1));
  const today = getTodayUtcDateString();
  const mem = getOrInitMemoryQuota(userId);

  mem.tokensUsedToday += sanitizedDelta;
  mem.aiRequestsToday += 1;

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { tokensUsedToday: sanitizedDelta, aiRequestsToday: 1 },
        $set: { lastTokenResetDate: today },
      });
    } catch {
      // Memory ledger already updated
    }
  }

  return getUserTokenQuota(userId);
}

/**
 * Allows configuring a user's token quota (used by admin controls and automated security tests).
 */
export async function configureUserTokenQuota(
  userId: string,
  patch: Partial<{
    dailyTokenLimit: number;
    tokensUsedToday: number;
    maxTokensPerRequest: number;
    aiRequestsToday: number;
    dailyAiRequestLimit: number;
  }>
): Promise<UserTokenQuotaState> {
  const mem = getOrInitMemoryQuota(userId);
  if (typeof patch.dailyTokenLimit === 'number') mem.dailyTokenLimit = patch.dailyTokenLimit;
  if (typeof patch.tokensUsedToday === 'number') mem.tokensUsedToday = patch.tokensUsedToday;
  if (typeof patch.maxTokensPerRequest === 'number')
    mem.maxTokensPerRequest = patch.maxTokensPerRequest;
  if (typeof patch.aiRequestsToday === 'number') mem.aiRequestsToday = patch.aiRequestsToday;
  if (typeof patch.dailyAiRequestLimit === 'number')
    mem.dailyAiRequestLimit = patch.dailyAiRequestLimit;

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      await User.findByIdAndUpdate(userId, { $set: patch });
    } catch {
      // Ignore DB update error in fallback mode
    }
  }

  return getUserTokenQuota(userId);
}

export function attachTokenQuotaHeaders(res: Response, quota: UserTokenQuotaState) {
  res.setHeader('X-RateLimit-Limit-Tokens', String(quota.dailyTokenLimit));
  res.setHeader('X-RateLimit-Remaining-Tokens', String(quota.remainingTokens));
  res.setHeader('X-RateLimit-Used-Tokens', String(quota.tokensUsedToday));
  res.setHeader('X-RateLimit-Reset', quota.resetAtIso);
}

/**
 * Express Middleware that enforces per-user AI token limits before allowing AI parsing.
 */
export const enforceUserTokenQuota = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User identity required for token quota' });
    }

    const rawPrompt = typeof req.body?.prompt === 'string' ? req.body.prompt : '';
    if (rawPrompt.length > MAX_PROMPT_CHARS) {
      return res.status(400).json({
        error: `Prompt exceeds maximum allowed length of ${MAX_PROMPT_CHARS} characters`,
        code: 'PROMPT_TOO_LONG',
      });
    }

    const quota = await getUserTokenQuota(userId);
    attachTokenQuotaHeaders(res, quota);

    // Estimate input + expected output tokens (~180 tokens base schema output)
    const estimatedInputTokens = estimateTokens(rawPrompt);
    const estimatedTotalTokens = estimatedInputTokens + 140;

    if (estimatedTotalTokens > quota.maxTokensPerRequest) {
      return res.status(400).json({
        error: `Request exceeds maximum per-request token limit (${quota.maxTokensPerRequest} tokens)`,
        code: 'MAX_REQUEST_TOKENS_EXCEEDED',
        tokenUsage: quota,
      });
    }

    if (quota.aiRequestsToday >= quota.dailyAiRequestLimit) {
      res.setHeader('Retry-After', '3600');
      return res.status(429).json({
        error: `Daily AI request limit reached (${quota.dailyAiRequestLimit} requests/day). Please try again tomorrow.`,
        code: 'DAILY_AI_REQUEST_LIMIT_EXCEEDED',
        tokenUsage: quota,
      });
    }

    if (quota.remainingTokens < estimatedInputTokens || quota.tokensUsedToday >= quota.dailyTokenLimit) {
      res.setHeader('Retry-After', '3600');
      return res.status(429).json({
        error: `Daily token limit exhausted (${quota.tokensUsedToday}/${quota.dailyTokenLimit} tokens used). Quota resets at ${quota.resetAtIso}.`,
        code: 'USER_TOKEN_LIMIT_EXCEEDED',
        tokenUsage: quota,
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};
