import mongoose from 'mongoose';

/**
 * User Schema: Defines the shape of a user in the database.
 */
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true // Ensures no two users can register with the same email
  },
  password: { 
    type: String, 
    required: true // In a production app, this password MUST be hashed before saving!
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt dates
});

// Export the User model to be used by the Express server
export const User = mongoose.model('User', userSchema);
