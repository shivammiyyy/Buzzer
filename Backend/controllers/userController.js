import { body, query, validationResult } from 'express-validator';
import winston from 'winston';
import xss from 'xss';
import User from '../models/userModel.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = [
  // Input validation
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('status').optional().isLength({ max: 100 }).withMessage('Status cannot exceed 100 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { username, status, avatar } = req.body;
      const userId = req.user.userId; // From requireAuth middleware

      // Sanitize inputs
      const sanitizedData = {
        username: username ? xss(username) : undefined,
        status: status ? xss(status) : undefined,
        avatar: avatar ? xss(avatar) : undefined,
      };

      // Update user
      const updateData = {};
      if (sanitizedData.username) updateData.username = sanitizedData.username;
      if (sanitizedData.status) updateData.status = sanitizedData.status;
      if (sanitizedData.avatar) updateData.avatar = sanitizedData.avatar;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password -pushSubscription');

      if (!user) {
        logger.warn(`User not found for profile update: ${userId}`);
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      logger.info(`Profile updated for user: ${userId}`);
      // Emit friend-recommendations-update to trigger frontend refresh
      const io = req.app.get('socketio'); // Assuming socket instance is set in index.js
      if (io) io.to(userId).emit('friend-recommendations-update');

      res.status(200).json({ success: true, data: user });
    } catch (err) {
      logger.error(`Profile update error for user ${req.user.userId}: ${err.message}`);
      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      });
    }
  },
];

/**
 * Save Web Push subscription
 * POST /api/users/push-subscription
 */
export const savePushSubscription = [
  // Input validation
  body('subscription').exists().withMessage('Subscription object is required'),
  body('subscription.endpoint').isURL().withMessage('Invalid subscription endpoint'),
  body('subscription.keys.p256dh').exists().withMessage('p256dh key is required'),
  body('subscription.keys.auth').exists().withMessage('auth key is required'),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { subscription } = req.body;
      const userId = req.user.userId;

      // Sanitize subscription (minimal risk, but ensure endpoint is clean)
      const sanitizedSubscription = {
        endpoint: xss(subscription.endpoint),
        keys: {
          p256dh: xss(subscription.keys.p256dh),
          auth: xss(subscription.keys.auth),
        },
      };

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { pushSubscription: sanitizedSubscription } },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        logger.warn(`User not found for push subscription: ${userId}`);
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      logger.info(`Push subscription saved for user: ${userId}`);
      res.status(200).json({ success: true, message: 'Subscription saved' });
    } catch (err) {
      logger.error(`Push subscription error for user ${req.user.userId}: ${err.message}`);
      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      });
    }
  },
];

/**
 * Search users (e.g., for friend requests)
 * GET /api/users?search=query
 */
export const searchUsers = [
  // Input validation
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be between 1 and 50 characters'),
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { search } = req.query;
      const userId = req.user.userId;

      const query = search
        ? {
            $and: [
              { _id: { $ne: userId } }, // Exclude current user
              {
                $or: [
                  { username: { $regex: xss(search), $options: 'i' } },
                  { email: { $regex: xss(search), $options: 'i' } },
                ],
              },
            ],
          }
        : { _id: { $ne: userId } };

      const users = await User.find(query)
        .select('username email avatar status')
        .limit(20);

      logger.info(`User search executed by ${userId}, found ${users.length} results`);
      res.status(200).json({ success: true, data: users });
    } catch (err) {
      logger.error(`User search error for user ${req.user.userId}: ${err.message}`);
      res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      });
    }
  },
];