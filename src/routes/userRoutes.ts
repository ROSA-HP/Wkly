import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../db/models/User.js';

export const router = express.Router();

// In-memory fallback users for development when MongoDB service is offline
interface FallbackUser {
  id: string;
  email: string;
  password: string;
}
const fallbackUsers: FallbackUser[] = [];

// A secret key used to lock and unlock the login tokens. 
// (In a real app, you would put this in your .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key';

export const initDemoUser = async () => {
  const demoEmail = 'rosa.athlete@stanford.edu';
  const demoPass = 'password123';
  const hashedPassword = await bcrypt.hash(demoPass, 10);

  if (mongoose.connection.readyState === 1) {
    try {
      const existing = await User.findOne({ email: demoEmail });
      if (!existing) {
        await User.create({ email: demoEmail, password: hashedPassword });
        console.log('Demo user seeded into MongoDB:', demoEmail);
      }
    } catch (e) {
      console.warn('Could not seed demo user to Mongo:', e);
    }
  }

  if (!fallbackUsers.some(u => u.email.toLowerCase() === demoEmail.toLowerCase())) {
    fallbackUsers.push({
      id: 'demo-athlete-1',
      email: demoEmail,
      password: hashedPassword
    });
  }
};

/**
 * POST /api/users/register
 * Handles creating a brand new account.
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Email and password are required'));
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400);
        return next(new Error('Email already in use'));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ 
        email: email, 
        password: hashedPassword 
      });
      await newUser.save();
    } else {
      const existing = fallbackUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        res.status(400);
        return next(new Error('Email already in use'));
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      fallbackUsers.push({
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword
      });
    }

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/users/login
 * Handles logging into an existing account.
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Email and password are required'));
    }

    let userId: string;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400);
        return next(new Error('Invalid email or password'));
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400);
        return next(new Error('Invalid email or password'));
      }
      userId = user._id.toString();
    } else {
      const user = fallbackUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        res.status(400);
        return next(new Error('Invalid email or password'));
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400);
        return next(new Error('Invalid email or password'));
      }
      userId = user.id;
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, message: 'Logged in successfully!' });
  } catch (error) {
    next(error);
  }
});
