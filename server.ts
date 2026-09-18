import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Import our database and route modules
import { connectDB } from './src/db/connection.js';
import { router as taskRoutes } from './src/routes/taskRoutes.js';
import { router as userRoutes } from './src/routes/userRoutes.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Connect to MongoDB
  await connectDB();

  // API Routes:
  // We tell Express: "Any URL that starts with /api/tasks should be handled by taskRoutes"
  app.use('/api/tasks', taskRoutes);
  
  // "Any URL that starts with /api/users should be handled by userRoutes"
  app.use('/api/users', userRoutes);

  // If a request starts with /api/ but doesn't match the two routes above, it's a 404!
  app.use('/api', notFound);

  // Global Error Handler MUST be placed after all routes
  app.use(errorHandler);

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
