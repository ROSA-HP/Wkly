import express, { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Task } from '../db/models/Task.js';
import { initialTasks } from '../data.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const router = express.Router();
let fallbackTasks = [...initialTasks];

// --- SECURITY GUARD ---
// By putting requireAuth here, we force EVERY route in this file to pass the security check first.
router.use(requireAuth);

/**
 * GET /api/tasks
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState === 1) {
    try {
      // SECURITY UPGRADE: Only find tasks that belong to the logged-in user!
      const tasks = await Task.find({ userId: req.userId });
      res.json(tasks.map(t => ({ ...t.toObject(), id: t._id.toString() })));
    } catch (e) {
      next(e);
    }
  } else {
    res.json(fallbackTasks);
  }
});

/**
 * POST /api/tasks
 */
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState === 1) {
    try {
      // BAD REQUEST VALIDATION
      if (!req.body.title || !req.body.category || !req.body.day) {
        res.status(400);
        return next(new Error('Title, category, and day are required'));
      }

      // SECURITY UPGRADE: Attach the logged-in user's ID to the new task before saving it.
      const taskData = {
        ...req.body,
        userId: req.userId 
      };
      const newTask = new Task(taskData);
      await newTask.save();
      
      res.json({ ...newTask.toObject(), id: newTask._id.toString() });
    } catch (e) {
      next(e);
    }
  } else {
    const newTask = { ...req.body, id: `task-${Date.now()}` };
    fallbackTasks.push(newTask);
    res.json(newTask);
  }
});

/**
 * DELETE /api/tasks/:id
 */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState === 1) {
    try {
      // SECURITY UPGRADE: Only allow deleting if the task belongs to the user!
      const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
      
      if (!task) {
        res.status(404);
        return next(new Error('Task not found or unauthorized'));
      }
      
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  } else {
    fallbackTasks = fallbackTasks.filter(t => t.id !== req.params.id);
    res.json({ success: true });
  }
});
