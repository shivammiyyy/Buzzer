import mongoose from 'mongoose';
import Joi from 'joi';
import JoiObjectId from 'joi-objectid';
import FriendInvitation from '../models/friendInviteModel.js';
import User from '../models/userModel.js';
import sanitizeHtml from 'sanitize-html';
import winston from 'winston';
import sendPushNotification from '../socketControllers/notification.js';
import {
  updateUsersInvitations,
  updateUsersFriendsList,
} from '../socketControllers/notifyConnectedSockets.js';
import { getServerSocketInstance } from '../socket/connectedUsers.js';

Joi.objectId = JoiObjectId(Joi);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

// Validation schemas
const inviteSchema = Joi.object({
  email: Joi.string().email().required(),
});

const invitationActionSchema = Joi.object({
  invitationId: Joi.objectId().required(),
});

const removeFriendSchema = Joi.object({
  friendId: Joi.objectId().required(),
});

/**
 * Send a friend invitation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const inviteFriend = async (req, res) => {
  try {
    const { error, value } = inviteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email: senderEmailAddress, userId } = req.user;
    const { email: receiverEmailAddress } = value;
    const normalizedReceiverEmail = receiverEmailAddress.toLowerCase().trim();

    if (senderEmailAddress === normalizedReceiverEmail) {
      logger.warn(`User ${userId} attempted to invite themselves`);
      return res.status(400).json({ success: false, message: "You can't invite yourself" });
    }

    const targetUser = await User.findOne({ email: normalizedReceiverEmail }).lean();
    if (!targetUser) {
      logger.warn(`User not found for email: ${normalizedReceiverEmail}`);
      return res.status(404).json({ success: false, message: 'User not found with given email address' });
    }

    const invitationExists = await FriendInvitation.findOne({
      senderId: userId,
      receiverId: targetUser._id,
    }).lean();
    if (invitationExists) {
      logger.warn(`Invitation already exists from ${userId} to ${targetUser._id}`);
      return res.status(409).json({ success: false, message: 'Friend request already sent' });
    }

    const isAlreadyFriend = targetUser.friends.some(
      (friend) => friend.toString() === userId.toString()
    );
    if (isAlreadyFriend) {
      logger.warn(`User ${userId} is already friends with ${targetUser._id}`);
      return res.status(409).json({ success: false, message: 'You are already friends' });
    }

    await FriendInvitation.create({ senderId: userId, receiverId: targetUser._id });
    updateUsersInvitations(targetUser._id.toString(), 'new');

    const sender = await User.findById(userId).lean();
    sendPushNotification({
      sender,
      receiver: targetUser,
      message: {
        content: sanitizeHtml(`${sender.username} sent you a friend request`, { allowedTags: [] }),
        _id: `${userId}-${targetUser._id}-invitation`,
      },
    });

    logger.info(`Friend invitation sent from ${userId} to ${targetUser._id}`);
    return res.status(201).json({ success: true, message: 'Friend request sent' });
  } catch (err) {
    logger.error(`Invite friend error for user ${req.user.userId}:`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

/**
 * Accept a friend invitation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const acceptInvitation = async (req, res) => {
  try {
    const { error, value } = invitationActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { invitationId } = value;
    const invitation = await FriendInvitation.findById(invitationId).lean();
    if (!invitation) {
      logger.warn(`Invitation not found: ${invitationId}`);
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.receiverId.toString() !== req.user.userId) {
      logger.warn(`User ${req.user.userId} not authorized to accept invitation ${invitationId}`);
      return res.status(403).json({ success: false, message: 'Not authorized to accept this invitation' });
    }

    await User.updateMany(
      { _id: { $in: [invitation.senderId, req.user.userId] } },
      { $push: { friends: { $each: [invitation.receiverId, invitation.senderId] } } }
    );

    await FriendInvitation.deleteOne({ _id: invitationId });

    updateUsersInvitations(req.user.userId);
    updateUsersFriendsList(invitation.senderId.toString());
    updateUsersFriendsList(req.user.userId);

    const sender = await User.findById(invitation.senderId).lean();
    const receiver = await User.findById(req.user.userId).lean();
    sendPushNotification({
      sender: receiver,
      receiver: sender,
      message: {
        content: sanitizeHtml(`${receiver.username} accepted your friend request`, { allowedTags: [] }),
        _id: `${req.user.userId}-${invitation.senderId}-accepted`,
      },
    });

    // Emit friend recommendations update
    const io = getServerSocketInstance();
    if (io) {
      io.to(req.user.userId).emit('friend-recommendations-update');
      io.to(invitation.senderId.toString()).emit('friend-recommendations-update');
    }

    logger.info(`Friend invitation accepted: ${invitationId}`);
    return res.status(200).json({ success: true, message: 'Friend request accepted' });
  } catch (err) {
    logger.error(`Accept invitation error for user ${req.user.userId}:`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

/**
 * Reject a friend invitation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const rejectInvitation = async (req, res) => {
  try {
    const { error, value } = invitationActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { invitationId } = value;
    const invitation = await FriendInvitation.findById(invitationId).lean();
    if (!invitation) {
      logger.warn(`Invitation not found: ${invitationId}`);
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    if (invitation.receiverId.toString() !== req.user.userId) {
      logger.warn(`User ${req.user.userId} not authorized to reject invitation ${invitationId}`);
      return res.status(403).json({ success: false, message: 'Not authorized to reject this invitation' });
    }

    await FriendInvitation.deleteOne({ _id: invitationId });
    updateUsersInvitations(req.user.userId);

    logger.info(`Friend invitation rejected: ${invitationId}`);
    return res.status(200).json({ success: true, message: 'Friend request rejected' });
  } catch (err) {
    logger.error(`Reject invitation error for user ${req.user.userId}:`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

/**
 * Remove a friend
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const removeFriend = async (req, res) => {
  try {
    const { error, value } = removeFriendSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { userId } = req.user;
    const { friendId } = value;

    const currentUser = await User.findById(userId).lean();
    const friend = await User.findById(friendId).lean();

    if (!friend) {
      logger.warn(`Friend not found: ${friendId}`);
      return res.status(404).json({ success: false, message: 'Friend not found' });
    }

    if (!currentUser.friends.some((f) => f.toString() === friendId)) {
      logger.warn(`User ${userId} is not friends with ${friendId}`);
      return res.status(400).json({ success: false, message: 'User is not in your friends list' });
    }

    await User.updateMany(
      { _id: { $in: [userId, friendId] } },
      { $pull: { friends: { $in: [friendId, userId] } } }
    );

    updateUsersFriendsList(userId);
    updateUsersFriendsList(friendId);

    sendPushNotification({
      sender: currentUser,
      receiver: friend,
      message: {
        content: sanitizeHtml(`${currentUser.username} removed you from their friends list`, { allowedTags: [] }),
        _id: `${userId}-${friendId}-removed`,
      },
    });

    // Emit friend recommendations update
    const io = getServerSocketInstance();
    if (io) {
      io.to(userId).emit('friend-recommendations-update');
      io.to(friendId).emit('friend-recommendations-update');
    }

    logger.info(`Friend removed: ${userId} removed ${friendId}`);
    return res.status(200).json({ success: true, message: 'Friend removed' });
  } catch (err) {
    logger.error(`Remove friend error for user ${req.user.userId}:`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};