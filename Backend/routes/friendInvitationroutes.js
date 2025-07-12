import express from 'express';
import { body } from 'express-validator';
import {
  inviteFriend,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
  removeFriend,
  blockUser,
  unblockUser,
  getFriendInvitations,
  getSentInvitations,
  getFriendsList,
  getBlockedUsers,
} from '../controllers/friendController.js';
import requireAuth from '../middlewares/requireAuth.js';
import { friendRequestLimiter } from '../middlewares/rateLimiting.js';
import { handleValidationErrors, asyncHandler } from '../middlewares/validation.js';

const router = express.Router();

// Send friend invitation
router.post(
  '/invite',
  requireAuth,
  friendRequestLimiter,
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors,
  asyncHandler(inviteFriend)
);

// Accept friend invitation
router.post(
  '/accept',
  requireAuth,
  body('invitationId').isMongoId().withMessage('Valid invitation ID is required'),
  handleValidationErrors,
  asyncHandler(acceptInvitation)
);

// Reject friend invitation
router.post(
  '/reject',
  requireAuth,
  body('invitationId').isMongoId().withMessage('Valid invitation ID is required'),
  handleValidationErrors,
  asyncHandler(rejectInvitation)
);

// Cancel sent invitation
router.post(
  '/cancel',
  requireAuth,
  body('invitationId').isMongoId().withMessage('Valid invitation ID is required'),
  handleValidationErrors,
  asyncHandler(cancelInvitation)
);

// Remove friend
router.post(
  '/remove',
  requireAuth,
  body('friendId').isMongoId().withMessage('Valid friend ID is required'),
  handleValidationErrors,
  asyncHandler(removeFriend)
);

// Block user
router.post(
  '/block',
  requireAuth,
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  handleValidationErrors,
  asyncHandler(blockUser)
);

// Unblock user
router.post(
  '/unblock',
  requireAuth,
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  handleValidationErrors,
  asyncHandler(unblockUser)
);

// Get received friend invitations
router.get('/invitations', requireAuth, asyncHandler(getFriendInvitations));

// Get sent friend invitations
router.get('/sent', requireAuth, asyncHandler(getSentInvitations));

// Get friends list
router.get('/friends', requireAuth, asyncHandler(getFriendsList));

// Get blocked users
router.get('/blocked', requireAuth, asyncHandler(getBlockedUsers));

export default router;