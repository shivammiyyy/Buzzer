import express from 'express';
import { body } from 'express-validator';
import { createValidator } from 'express-joi-validation';
import Joi from 'joi';

import {
  login,
  register,
  logout,
  subscribe,
  unsubscribe,
} from '../controllers/authController.js';

import requireAuth from '../middlewares/requireAuth.js';
import { authLimiter } from '../middlewares/rateLimiting.js';
import { handleValidationErrors, asyncHandler } from '../middlewares/validation.js';

const router = express.Router();
const validator = createValidator({});

// Joi schemas
const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    }),
  email: Joi.string().email().required(),
});

const loginSchema = Joi.object({
  password: Joi.string().min(6).required(),
  email: Joi.string().email().required(),
});

const subscriptionSchema = Joi.object({
  endpoint: Joi.string().uri().required(),
  keys: Joi.object({
    auth: Joi.string().required(),
    p256dh: Joi.string().required(),
  }).required(),
  deviceInfo: Joi.object({
    userAgent: Joi.string().optional(),
    platform: Joi.string().optional(),
  }).optional(),
});

// Routes
router.post(
  '/register', 
  authLimiter, 
  validator.body(registerSchema), 
  asyncHandler(register)
);

router.post(
  '/login', 
  authLimiter, 
  validator.body(loginSchema), 
  asyncHandler(login)
);

router.post(
  '/logout', 
  requireAuth, 
  asyncHandler(logout)
);

router.post(
  '/subscribe', 
  requireAuth, 
  validator.body(subscriptionSchema), 
  asyncHandler(subscribe)
);

router.post(
  '/unsubscribe', 
  requireAuth,
  body('endpoint').isURL().withMessage('Valid endpoint URL is required'),
  handleValidationErrors,
  asyncHandler(unsubscribe)
);

// Test route
router.get('/test', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Hello, ${req.user.username}!`,
    user: req.user,
  });
});

export default router;