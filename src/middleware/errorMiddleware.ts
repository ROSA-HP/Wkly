import { Request, Response, NextFunction } from 'express';

/**
 * Global Error Handler Middleware
 * Express knows this is an error handler because it has 4 arguments (err, req, res, next).
 * Any time you call `next(new Error("Something broke!"))` in your routes, it lands here.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If a route hasn't set a specific error status code (like 400 or 404), default to 500 (Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    // We only send the messy stack trace to the frontend if we are in development mode!
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

/**
 * 404 Not Found Middleware (Specific to API routes)
 * If the frontend asks for an API route that doesn't exist (like /api/profile), 
 * it triggers this middleware to send a 404 status.
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass this error down to the errorHandler above!
};
