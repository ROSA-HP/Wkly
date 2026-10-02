import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Import our database, security middlewares, and route modules
import { connectDB } from './src/db/connection.js';
import { router as taskRoutes } from './src/routes/taskRoutes.js';
import { router as userRoutes, initDemoUser } from './src/routes/userRoutes.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';
import {
  securityHeadersMiddleware,
  corsPolicyMiddleware,
  payloadSanitizerMiddleware,
  apiRateLimiter,
} from './src/middleware/securityMiddleware.js';

export function createExpressApp() {
  const app = express();

  // Disable server fingerprinting header
  app.disable('x-powered-by');

  // 1. DAST & TLS/HSTS Security Headers + Strict CORS Policy
  app.use(securityHeadersMiddleware);
  app.use(corsPolicyMiddleware);

  // 2. Bounded JSON body parser (32KB max to prevent memory exhaustion / DoS)
  app.use(express.json({ limit: '32kb', strict: true }));

  // 3. Deep Payload Sanitizer (NoSQL Injection, Prototype Pollution, XSS, Depth Check)
  app.use('/api', payloadSanitizerMiddleware);

  // 4. General API Rate Limiter
  app.use('/api', apiRateLimiter);

  // 5. API Routes
  app.use('/api/tasks', taskRoutes);
  app.use('/api/users', userRoutes);

  // 6. 404 Not Found for unmatched /api routes
  app.use('/api', notFound);

  // 7. Global Error Handler
  app.use(errorHandler);

  return app;
}

async function startServer() {
  const app = createExpressApp();
  const PORT = 3000;

  // Connect to MongoDB & seed demo user
  await connectDB();
  await initDemoUser();

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
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

const isTestFile = process.argv.some((arg) => arg.includes('security.test'));
if (process.env.WKLY_TEST_MODE !== 'true' && !isTestFile) {
  startServer();
}
