import express from 'express';
import { updateProfile, savePushSubscription, searchUsers } from '../controllers/userController.js';
import requireAuth from '../middlewares/requireAuth.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

const userLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});

router.put('/profile', requireAuth, userLimiter, updateProfile);
router.post('/push-subscription', requireAuth, userLimiter, savePushSubscription);
router.get('/', requireAuth, userLimiter, searchUsers);

export default router;