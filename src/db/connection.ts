import mongoose from 'mongoose';

/**
 * Connects to the MongoDB database using Mongoose.
 * Defaults to mongodb://localhost:27017/wkly if MONGODB_URI is not set.
 */
export const connectDB = async (): Promise<boolean> => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wkly';

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`Successfully connected to MongoDB at: ${MONGODB_URI}`);
    return true;
  } catch (err: any) {
    console.warn(`MongoDB not available at ${MONGODB_URI} (${err.message || 'connection failed'}). Using resilient memory store.`);
    return false;
  }
};
