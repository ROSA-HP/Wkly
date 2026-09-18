import mongoose from 'mongoose';

/**
 * Connects to the MongoDB database using Mongoose.
 */
export const connectDB = async (): Promise<boolean> => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not found in environment variables. Falling back to in-memory storage.');
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB');
    return true;
  } catch (err) {
    console.error('MongoDB connection error. Falling back to in-memory.', err);
    return false;
  }
};
