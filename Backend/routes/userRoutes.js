import express from 'express';
import { body } from 'express-validator';
import { 
  getMe, 
  updateProfile, 
  changePassword 
} from '../controllers/authController.js';
import requireAuth from '../middlewares/requireAuth.js';
import { handleValidationErrors, asyncHandler } from '../middlewares/validation.js';

const router = express.Router();

// Get current user profile
router.get('/me', requireAuth, asyncHandler(getMe));

// Update user profile
router.patch(
  '/profile',
  requireAuth,
  body('username').optional().isLength({ min: 3, max: 20 }).trim(),
  body('bio').optional().isLength({ max: 200 }).trim(),
  body('privacy.showLastSeen').optional().isBoolean(),
  body('privacy.showOnlineStatus').optional().isBoolean(),
  body('privacy.allowFriendRequests').optional().isBoolean(),
  handleValidationErrors,
  asyncHandler(updateProfile)
);

// Change password
router.patch(
  '/change-password',
  requireAuth,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors,
  asyncHandler(changePassword)
);

export default router;