import mongoose from 'mongoose';

export const DEFAULT_DAILY_TOKEN_LIMIT = Number(process.env.DAILY_TOKEN_LIMIT) || 15000;
export const DEFAULT_MAX_TOKENS_PER_REQUEST = Number(process.env.MAX_TOKENS_PER_REQUEST) || 1500;
export const DEFAULT_DAILY_AI_REQUEST_LIMIT = Number(process.env.DAILY_AI_REQUEST_LIMIT) || 30;

/**
 * User Schema: Defines the shape of a user in the database, including
 * strict password exclusion and per-user AI token limits.
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      select: false, // Excluded by default from queries (select: '-password')
    },
    dailyTokenLimit: {
      type: Number,
      default: DEFAULT_DAILY_TOKEN_LIMIT,
      min: 0,
    },
    tokensUsedToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxTokensPerRequest: {
      type: Number,
      default: DEFAULT_MAX_TOKENS_PER_REQUEST,
      min: 100,
    },
    aiRequestsToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyAiRequestLimit: {
      type: Number,
      default: DEFAULT_DAILY_AI_REQUEST_LIMIT,
      min: 1,
    },
    lastTokenResetDate: {
      type: String,
      default: () => new Date().toISOString().slice(0, 10),
    },
  },
  {
    timestamps: true,
    strict: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model('User', userSchema);
