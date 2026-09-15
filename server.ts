import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import { initialTasks } from './src/data.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;
  let dbConnected = false;
  let fallbackTasks = [...initialTasks];

  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      dbConnected = true;
    } catch (err) {
      console.error('MongoDB connection error. Falling back to in-memory.', err);
    }
  } else {
    console.warn('MONGODB_URI not found. Falling back to in-memory storage.');
  }

  const taskSchema = new mongoose.Schema({
    title: String,
    category: String,
    day: String,
    time: String,
    duration: String,
    colorTint: String,
    subtitle: String,
    details: mongoose.Schema.Types.Mixed,
  }, { timestamps: true });

  const Task = mongoose.model('Task', taskSchema);

  // API Routes
  app.get('/api/tasks', async (req, res) => {
    if (dbConnected) {
      try {
        const tasks = await Task.find();
        res.json(tasks.map(t => ({ ...t.toObject(), id: t._id.toString() })));
      } catch (e) {
        res.status(500).json({ error: 'Database error' });
      }
    } else {
      res.json(fallbackTasks);
    }
  });

  app.post('/api/tasks', async (req, res) => {
    if (dbConnected) {
      try {
        const newTask = new Task(req.body);
        await newTask.save();
        res.json({ ...newTask.toObject(), id: newTask._id.toString() });
      } catch (e) {
        res.status(500).json({ error: 'Database error' });
      }
    } else {
      const newTask = { ...req.body, id: `task-${Date.now()}` };
      fallbackTasks.push(newTask);
      res.json(newTask);
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    if (dbConnected) {
      try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true });
      } catch (e) {
        res.status(500).json({ error: 'Database error' });
      }
    } else {
      fallbackTasks = fallbackTasks.filter(t => t.id !== req.params.id);
      res.json({ success: true });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Note: express ^4.21.2 uses * for catchall
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
