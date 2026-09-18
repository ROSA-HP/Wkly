import mongoose from 'mongoose';

/**
 * Task Schema: Defines the shape of a task (Training, Studying, Other) in the database.
 */
const taskSchema = new mongoose.Schema({
  // This is the relation! It links the task to the User who created it.
  // We use mongoose.Schema.Types.ObjectId to store the exact MongoDB ID of the user.
  // We set required: false temporarily so the app still works if you haven't logged in yet.
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false 
  },
  title: { type: String, required: true },
  category: { type: String, required: true },
  day: { type: String, required: true },
  time: { type: String },
  duration: { type: String },
  colorTint: { type: String },
  subtitle: { type: String },
  
  // Mixed allows us to store different sets of details depending on if 
  // it is a Training form (exercises, RPE) or a Study form (focus items)
  details: { type: mongoose.Schema.Types.Mixed },
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt dates
});

// Export the Task model to be used by the Express server
export const Task = mongoose.model('Task', taskSchema);
