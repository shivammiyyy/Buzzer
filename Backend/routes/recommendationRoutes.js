import express from 'express';
import Joi from 'joi';
import { createValidator } from 'express-joi-validation';
import { getRecommendedFriends } from '../controllers/recommendationController.js';
import requireAuth from '../middlewares/requireAuth.js';

const router = express.Router();
const validator = createValidator({ passError: true });

const recommendationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10),
});

router.get('/', requireAuth, validator.query(recommendationSchema), getRecommendedFriends);

router.use((err, req, res, next) => {
  if (err.error?.isJoi) {
    return res.status(400).json({ success: false, message: err.error.details[0].message });
  }
  next(err);
});

export default router;