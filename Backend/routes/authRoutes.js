import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe, logout } from '../controllers/authController.js';
import requireAuth from '../middlewares/requireAuth.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 20,
  message: { success: false, message: 'Too many auth requests, please try again later' },
});

router.post(
  '/signup',
  authLimiter,
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  ],
  signup
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', requireAuth, getMe);

router.post('/logout', requireAuth, logout);

export default router;