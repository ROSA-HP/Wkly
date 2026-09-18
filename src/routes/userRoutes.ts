import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/User.js';

export const router = express.Router();

// A secret key used to lock and unlock the login tokens. 
// (In a real app, you would put this in your .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key';

/**
 * POST /api/users/register
 * Handles creating a brand new account.
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get the email and password the user typed into the React form
    const { email, password } = req.body;

    // BAD REQUEST VALIDATION: Check if they even sent an email and password!
    if (!email || !password) {
      res.status(400); // 400 means "Bad Request" - the user forgot something
      return next(new Error('Email and password are required'));
    }

    // 2. Check if a user with this email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      return next(new Error('Email already in use'));
    }

    // 3. Hash the password. 
    // We NEVER save plain text passwords (like "password123"). 
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the new user and save them to the database
    const newUser = new User({ 
      email: email, 
      password: hashedPassword 
    });
    await newUser.save();

    // 5. Send a success message back to React
    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    // Pass any unexpected database errors to the global Error Handler
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

    // BAD REQUEST VALIDATION
    if (!email || !password) {
      res.status(400);
      return next(new Error('Email and password are required'));
    }

    // 1. Find the user in the database by their email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400);
      return next(new Error('Invalid email or password'));
    }

    // 2. Compare the password they typed with the scrambled password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400);
      return next(new Error('Invalid email or password'));
    }

    // 3. Create an "Auth Token" (a temporary digital ID card). 
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

    // 4. Send the token back to React
    res.json({ token, message: 'Logged in successfully!' });

  } catch (error) {
    // Pass the error down the chain
    next(error);
  }
});
