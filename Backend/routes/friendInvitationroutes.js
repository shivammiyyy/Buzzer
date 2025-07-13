import express from 'express';
import Joi from 'joi';
import JoiObjectId from 'joi-objectid';
import { createValidator } from 'express-joi-validation';
import { inviteFriend, acceptInvitation, rejectInvitation, removeFriend } from '../controllers/friendController.js';
import requireAuth from '../middlewares/requireAuth.js';
import { friendRequestLimiter } from '../middlewares/rateLimiting.js';

Joi.objectId = JoiObjectId(Joi);
const router = express.Router();
const validator = createValidator({ passError: true });

const invitationSchema = Joi.object({
  email: Joi.string().email().required(),
});

const approveInvitationSchema = Joi.object({
  invitationId: Joi.objectId().required(),
});

const removeFriendSchema = Joi.object({
  friendId: Joi.objectId().required(),
});

router.post('/invitations', requireAuth, friendRequestLimiter, validator.body(invitationSchema), inviteFriend);
router.post('/invitations/accept', requireAuth, validator.body(approveInvitationSchema), acceptInvitation);
router.post('/invitations/reject', requireAuth, validator.body(approveInvitationSchema), rejectInvitation);
router.post('/friends/remove', requireAuth, validator.body(removeFriendSchema), removeFriend);

router.use((err, req, res, next) => {
  if (err.error?.isJoi) {
    return res.status(400).json({ success: false, message: err.error.details[0].message });
  }
  next(err);
});

export default router;