import express from 'express';
import mongoose from 'mongoose';
import { Task } from '../db/models/Task.js';
import { initialTasks } from '../data.js';

// express.Router() creates a mini-application just for handling these specific URLs.
export const router = express.Router();

// We keep our fallback data here just in case you haven't connected MongoDB yet.
let fallbackTasks = [...initialTasks];

/**
 * GET /api/tasks
 * 'req' (Request): Contains data sent FROM the frontend (like headers or URL parameters).
 * 'res' (Response): The tool we use to send data BACK to the frontend.
 */
router.get('/', async (req, res) => {
  // Check if MongoDB is connected (1 means connected)
  if (mongoose.connection.readyState === 1) {
    try {
      // Find all tasks in the database
      const tasks = await Task.find();
      // Send them back as JSON
      res.json(tasks.map(t => ({ ...t.toObject(), id: t._id.toString() })));
    } catch (e) {
      // If something goes wrong, send a 500 (Internal Server Error) status
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    // Fallback if no database is connected
    res.json(fallbackTasks);
  }
});

/**
 * POST /api/tasks
 * Used to create a new task.
 */
router.post('/', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      // req.body contains the form data sent from React
      const newTask = new Task(req.body);
      // .save() physically writes it to the MongoDB database
      await newTask.save();
      // Send the newly saved task back to React so it can update the UI
      res.json({ ...newTask.toObject(), id: newTask._id.toString() });
    } catch (e) {
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    // Fallback logic
    const newTask = { ...req.body, id: `task-${Date.now()}` };
    fallbackTasks.push(newTask);
    res.json(newTask);
  }
});

/**
 * DELETE /api/tasks/:id
 * The ':id' is a dynamic URL parameter (e.g. /api/tasks/12345)
 */
router.delete('/:id', async (req, res) => {
  if (mongoose.connection.readyState === 1) {
    try {
      // Extract the ID from the URL using req.params
      await Task.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    // Fallback logic
    fallbackTasks = fallbackTasks.filter(t => t.id !== req.params.id);
    res.json({ success: true });
  }
});
