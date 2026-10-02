import mongoose from 'mongoose';

/**
 * Redacts credentials from a MongoDB URI before logging to prevent secret exposure in logs.
 */
export function redactMongoUri(uri: string): string {
  return uri.replace(/\/\/([^:/?#]+):([^@/?#]+)@/, '//***:***@');
}

/**
 * Connects to the MongoDB database using Mongoose.
 * Defaults to mongodb://localhost:27017/wkly if MONGODB_URI is not set.
 */
export const connectDB = async (): Promise<boolean> => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wkly';
  const safeUri = redactMongoUri(MONGODB_URI);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`Successfully connected to MongoDB at: ${safeUri}`);
    return true;
  } catch (err: any) {
    console.warn(
      `MongoDB not available at ${safeUri} (${err.message || 'connection failed'}). Using resilient memory store.`
    );
    return false;
  }
};
