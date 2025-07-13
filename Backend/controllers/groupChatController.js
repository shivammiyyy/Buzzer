import mongoose from 'mongoose';
import Joi from 'joi';
import JoiObjectId from 'joi-objectid';
import User from '../models/userModel.js';
import GroupChat from '../models/groupChatModel.js';
import sanitizeHtml from 'sanitize-html';
import winston from 'winston';
import { updateUsersGroupChatList } from '../socketControllers/notifyConnectedSockets.js';
import sendPushNotification from '../socketControllers/notification.js';
import { getServerSocketInstance } from '../socket/connectedUsers.js';

Joi.objectId = JoiObjectId(Joi);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

// Validation schemas
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

/**
 * Create a new group chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createGroupChat = async (req, res) => {
  try {
    const { error, value } = createGroupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { userId } = req.user;
    const { name } = value;
    const sanitizedName = sanitizeHtml(name.trim(), { allowedTags: [] });

    const chat = await GroupChat.create({
      name: sanitizedName,
      participants: [userId],
      admin: userId,
    });

    await User.updateOne({ _id: userId }, { $push: { groupChats: chat._id } });
    updateUsersGroupChatList(userId.toString());

    // Emit friend recommendations update
    const io = getServerSocketInstance();
    if (io) {
      io.to(userId).emit('friend-recommendations-update');
    }

    logger.info(`Group chat created: ${chat._id} by user ${userId}`);
    return res.status(201).json({ success: true, message: 'Group created successfully', data: { groupChat: chat } });
  } catch (err) {
    logger.error(`Create group chat error for user ${req.user.userId}:`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

/**
 * Add members to a group chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addMemberToGroup = async (req, res) => {
  try {
    const { error, value } = addMemberSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { userId } = req.user;
    const { friendIds, groupChatId } = value;

    const groupChat = await GroupChat.findById(groupChatId).lean();
    if (!groupChat) {
      logger.warn(`Group chat not found: ${groupChatId}`);
      return res.status(404).json({ success: false, message: "Group chat doesn't exist" });
    }
    if (groupChat.admin.toString() !== userId) {
      logger.warn(`User ${userId} not authorized to add members to group ${groupChatId}`);
      return res.status(403).json({ success: false, message: 'Only admin can add members' });
    }

    const currentUser = await User.findById(userId).lean();
    const friendsToAdd = friendIds.filter(
      (id) => currentUser.friends.includes(id) && !groupChat.participants.includes(id)
    );
    if (friendsToAdd.length === 0) {
      logger.warn(`No valid friends to add to group ${groupChatId}`);
      return res.status(400).json({ success: false, message: 'No valid friends to add' });
    }

    await GroupChat.updateOne(
      { _id: groupChatId },
      { $addToSet: { participants: { $each: friendsToAdd } } }
    );

    await User.updateMany(
      { _id: { $in: friendsToAdd } },
      { $addToSet: { groupChats: groupChatId } }
    );

    const updatedGroupChat = await GroupChat.findById(groupChatId).lean();
    for (const friendId of friendsToAdd) {
      const participant = await User.findById(friendId).lean();
      if (participant) {
        updateUsersGroupChatList(friendId.toString());
        sendPushNotification({
          sender: currentUser,
          receiver: participant,
          message: {
            content: sanitizeHtml(
              `${currentUser.username} has added you to the group "${updatedGroupChat.name}"`,
              { allowedTags: [] }
            ),
            _id: `${userId}-${participant._id}-${groupChatId}-added`,
          },
        });

        // Emit friend recommendations update
        const io = getServerSocketInstance();
        if (io) {
          io.to(friendId).emit('friend-recommendations-update');
        }
      }
    }

    updateUsersGroupChatList(groupChat.admin.toString());
    logger.info(`Members added to group ${groupChatId} by user ${userId}`);
    return res.status(200).json({ success: true, message: 'Members added successfully', data: { groupChat: updatedGroupChat } });
  } catch (err) {
    logger.error(`Add member to group error for user ${req.user.userId}:`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

/**
 * Leave a group chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const leaveGroup = async (req, res) => {
  try {
    const { error, value } = groupActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { userId } = req.user;
    const { groupChatId } = value;

    const groupChat = await GroupChat.findById(groupChatId).lean();
    if (!groupChat) {
      logger.warn(`Group chat not found: ${groupChatId}`);
      return res.status(404).json({ success: false, message: "Group chat doesn't exist" });
    }

    if (!groupChat.participants.includes(userId)) {
      logger.warn(`User ${userId} not a participant in group ${groupChatId}`);
      return res.status(400).json({ success: false, message: 'You are not a participant in this group' });
    }

    if (groupChat.admin.toString() === userId) {
      logger.warn(`Admin ${userId} cannot leave group ${groupChatId}`);
      return res.status(403).json({ success: false, message: 'Admin cannot leave the group; delete it instead' });
    }

    await GroupChat.updateOne(
      { _id: groupChatId },
      { $pull: { participants: userId } }
    );

    await User.updateOne(
      { _id: userId },
      { $pull: { groupChats: groupChatId } }
    );

    const currentUser = await User.findById(userId).lean();
    updateUsersGroupChatList(userId.toString());

    const updatedGroupChat = await GroupChat.findById(groupChatId).lean();
    for (const participantId of updatedGroupChat.participants) {
      updateUsersGroupChatList(participantId.toString());
      const receiver = await User.findById(participantId).lean();
      sendPushNotification({
        sender: currentUser,
        receiver,
        message: {
          content: sanitizeHtml(
            `${currentUser.username} has left the group "${updatedGroupChat.name}"`,
            { allowedTags: [] }
          ),
          _id: `${userId}-${participantId}-${groupChatId}-left`,
        },
      });
    }

    // Emit friend recommendations update
    const io = getServerSocketInstance();
    if (io) {
      io.to(userId).emit('friend-recommendations-update');
      updatedGroupChat.participants.forEach((participantId) => {
        io.to(participantId.toString()).emit('friend-recommendations-update');
      });
    }

    logger.info(`User ${userId} left group ${groupChatId}`);
    return res.status(200).json({ success: true, message: 'You have left the group' });
  } catch (err) {
    logger.error(`Leave group error for user ${req.user.userId}:`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

/**
 * Delete a group chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteGroup = async (req, res) => {
  try {
    const { error, value } = groupActionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { userId } = req.user;
    const { groupChatId } = value;

    const groupChat = await GroupChat.findById(groupChatId).lean();
    if (!groupChat) {
      logger.warn(`Group chat not found: ${groupChatId}`);
      return res.status(404).json({ success: false, message: "Group chat doesn't exist" });
    }
    if (groupChat.admin.toString() !== userId) {
      logger.warn(`User ${userId} not authorized to delete group ${groupChatId}`);
      return res.status(403).json({ success: false, message: 'Only admins can delete the group' });
    }

    await User.updateMany(
      { _id: { $in: groupChat.participants } },
      { $pull: { groupChats: groupChatId } }
    );

    await GroupChat.deleteOne({ _id: groupChatId });

    groupChat.participants.forEach((participantId) => {
      updateUsersGroupChatList(participantId.toString());
      // Emit friend recommendations update
      const io = getServerSocketInstance();
      if (io) {
        io.to(participantId.toString()).emit('friend-recommendations-update');
      }
    });

    logger.info(`Group ${groupChatId} deleted by user ${userId}`);
    return res.status(200).json({ success: true, message: 'Group deleted successfully' });
  } catch (err) {
    logger.error(`Delete group error for user ${req.user.userId}:`, err);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};