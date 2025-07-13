import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import winston from 'winston';
import User from '../models/userModel.js';
import { blacklistToken } from '../middlewares/requireSocketAuth.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

/**
 * User signup
 * POST /api/auth/signup
 */
export const signup = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password, username } = req.body;

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email or username already exists' });
      }

      const user = new User({ email, password, username });
      await user.save();

      const token = jwt.sign(
        { userId: user._id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      logger.info(`User signed up: ${user._id}`);
      res.status(201).json({ success: true, data: { token, userId: user._id, username } });
    } catch (err) {
      logger.error(`Signup error: ${err.message}`);
      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      });
    }
  },
];

/**
 * User login
 * POST /api/auth/login
 */
export const login = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      logger.info(`User logged in: ${user._id}`);
      res.status(200).json({ success: true, data: { token, userId: user._id, username: user.username } });
    } catch (err) {
      logger.error(`Login error: ${err.message}`);
      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      });
    }
  },
];

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -pushSubscription');
    if (!user) {
      logger.warn(`User not found: ${req.user.userId}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    logger.info(`Fetched profile for user: ${req.user.userId}`);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    logger.error(`GetMe error for user ${req.user.userId}: ${err.message}`);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

/**
 * User logout
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    blacklistToken(token);
    logger.info(`User logged out: ${req.user.userId}`);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    logger.error(`Logout error for user ${req.user?.userId}: ${err.message}`);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};