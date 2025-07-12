import express from 'express';
import { body, param } from 'express-validator';
import {
  createGroupChat,
  addMemberToGroup,
  removeMemberFromGroup,
  leaveGroup,
  updateGroupDetails,
  deleteGroup,
  getGroupChatDetails,
  getUserGroupChats,
  transferAdmin,
} from '../controllers/groupChatController.js';
import requireAuth from '../middlewares/requireAuth.js';
import { handleValidationErrors, asyncHandler } from '../middlewares/validation.js';

const router = express.Router();

// Create a group chat
router.post(
  '/',
  requireAuth,
  body('name')
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ max: 50 })
    .withMessage('Group name must be less than 50 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim(),
  body('participants')
    .optional()
    .isArray()
    .withMessage('Participants must be an array'),
  body('participants.*')
    .optional()
    .isMongoId()
    .withMessage('Each participant must be a valid user ID'),
  handleValidationErrors,
  asyncHandler(createGroupChat)
);

// Add members to group
router.post(
  '/add-member',
  requireAuth,
  body('groupChatId').isMongoId().withMessage('Valid group chat ID is required'),
  body('friendIds')
    .isArray({ min: 1 })
    .withMessage('At least one friend ID is required'),
  body('friendIds.*')
    .isMongoId()
    .withMessage('Each friend ID must be valid'),
  handleValidationErrors,
  asyncHandler(addMemberToGroup)
);

// Remove member from group
router.post(
  '/remove-member',
  requireAuth,
  body('groupChatId').isMongoId().withMessage('Valid group chat ID is required'),
  body('memberId').isMongoId().withMessage('Valid member ID is required'),
  handleValidationErrors,
  asyncHandler(removeMemberFromGroup)
);

// Leave group
router.post(
  '/leave',
  requireAuth,
  body('groupChatId').isMongoId().withMessage('Valid group chat ID is required'),
  handleValidationErrors,
  asyncHandler(leaveGroup)
);

// Update group details
router.patch(
  '/update',
  requireAuth,
  body('groupChatId').isMongoId().withMessage('Valid group chat ID is required'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Group name must be 1-50 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim(),
  handleValidationErrors,
  asyncHandler(updateGroupDetails)
);

// Delete group
router.delete(
  '/delete',
  requireAuth,
  body('groupChatId').isMongoId().withMessage('Valid group chat ID is required'),
  handleValidationErrors,
  asyncHandler(deleteGroup)
);

// Transfer admin
router.post(
  '/transfer-admin',
  requireAuth,
  body('groupChatId').isMongoId().withMessage('Valid group chat ID is required'),
  body('newAdminId').isMongoId().withMessage('Valid new admin ID is required'),
  handleValidationErrors,
  asyncHandler(transferAdmin)
);

// Get group chat details
router.get(
  '/:groupChatId',
  requireAuth,
  param('groupChatId').isMongoId().withMessage('Valid group chat ID is required'),
  handleValidationErrors,
  asyncHandler(getGroupChatDetails)
);

// Get user's group chats
router.get('/', requireAuth, asyncHandler(getUserGroupChats));

export default router;