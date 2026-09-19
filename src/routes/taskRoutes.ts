import express, { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Task } from '../db/models/Task.js';
import { initialTasks } from '../data.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

export const router = express.Router();
interface FallbackTask {
  id: string;
  userId?: string;
  title: string;
  category: string;
  day: string;
  time?: string;
  duration?: string;
  colorTint?: string;
  subtitle?: string;
  completed?: boolean;
  details?: any;
}
let fallbackTasks: FallbackTask[] = [...initialTasks];

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
      let tasks = await Task.find({ userId: req.userId });
      if (tasks.length === 0 && initialTasks.length > 0) {
        const seedData = initialTasks.map(t => {
          const { id, ...rest } = t;
          return { ...rest, userId: req.userId };
        });
        const created = await Task.insertMany(seedData);
        tasks = created as any;
      }
      res.json(tasks.map(t => ({ ...t.toObject(), id: t._id.toString() })));
    } catch (e) {
      next(e);
    }
  } else {
    let userTasks = fallbackTasks.filter(t => t.userId === req.userId);
    if (userTasks.length === 0 && initialTasks.length > 0) {
      const seeded: FallbackTask[] = initialTasks.map(t => ({
        ...t,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: req.userId
      }));
      fallbackTasks.push(...seeded);
      userTasks = seeded;
    }
    res.json(userTasks);
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
    const newTask: FallbackTask = { 
      ...req.body, 
      id: `task-${Date.now()}`,
      userId: req.userId 
    };
    fallbackTasks.push(newTask);
    res.json(newTask);
  }
});

/**
 * PUT /api/tasks/:id
 * Updates an existing task (title, details, completed status, etc.)
 */
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState === 1) {
    try {
      const updatedTask = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { $set: req.body },
        { new: true }
      );

      if (!updatedTask) {
        res.status(404);
        return next(new Error('Task not found or unauthorized to edit'));
      }

      res.json({ ...updatedTask.toObject(), id: updatedTask._id.toString() });
    } catch (e) {
      next(e);
    }
  } else {
    const index = fallbackTasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      res.status(404);
      return next(new Error('Task not found'));
    }
    fallbackTasks[index] = { ...fallbackTasks[index], ...req.body };
    res.json(fallbackTasks[index]);
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
