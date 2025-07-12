import express from 'express';
import { body, query } from 'express-validator';
import { 
  getFriendRecommendations, 
  searchUsers, 
  getTrendingUsers 
} from '../controllers/recommendationController.js';
import requireAuth from '../middlewares/requireAuth.js';
import { handleValidationErrors, asyncHandler } from '../middlewares/validation.js';

const router = express.Router();

// Get friend recommendations
router.get(
  '/friends',
  requireAuth,
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('page').optional().isInt({ min: 1 }),
  handleValidationErrors,
  asyncHandler(getFriendRecommendations)
);

// Search users
router.get(
  '/search',
  requireAuth,
  query('query').notEmpty().isLength({ min: 2, max: 50 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('page').optional().isInt({ min: 1 }),
  handleValidationErrors,
  asyncHandler(searchUsers)
);

// Get trending users
router.get(
  '/trending',
  requireAuth,
  query('limit').optional().isInt({ min: 1, max: 50 }),
  handleValidationErrors,
  asyncHandler(getTrendingUsers)
);

export default router;