import express from 'express';
import Joi from 'joi';
import JoiObjectId from 'joi-objectid';
import { createValidator } from 'express-joi-validation';
import { createGroupChat, addMemberToGroup, leaveGroup, deleteGroup } from '../controllers/groupChatController.js';
import requireAuth from '../middlewares/requireAuth.js';
import { friendRequestLimiter } from '../middlewares/rateLimiting.js';

Joi.objectId = JoiObjectId(Joi);
const router = express.Router();
const validator = createValidator({ passError: true });

const createGroupSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
});

const addMemberSchema = Joi.object({
  friendIds: Joi.array().items(Joi.objectId()).min(1).required(),
  groupChatId: Joi.objectId().required(),
});

const groupActionSchema = Joi.object({
  groupChatId: Joi.objectId().required(),
});

router.post('/create', requireAuth, validator.body(createGroupSchema), createGroupChat);
router.post('/add-members', requireAuth, friendRequestLimiter, validator.body(addMemberSchema), addMemberToGroup);
router.post('/leave', requireAuth, validator.body(groupActionSchema), leaveGroup);
router.post('/delete', requireAuth, validator.body(groupActionSchema), deleteGroup);

router.use((err, req, res, next) => {
  if (err.error?.isJoi) {
    return res.status(400).json({ success: false, message: err.error.details[0].message });
  }
  next(err);
});

export default router;