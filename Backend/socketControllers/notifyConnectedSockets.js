import winston from 'winston';
import mongoose from 'mongoose';
import Conversation from '../models/conversationModel.js';
import FriendInvitation from '../models/friendInviteModel.js';
import User from '../models/userModel.js';
import GroupChat from '../models/groupChatModel.js';
import { getActiveConnections, getServerSocketInstance } from '../socket/connectedUsers.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Update user's pending friend invitations
 * @param {string} userId - User ID
 * @param {string} [isNew] - Optional flag for new invitations
 */
export const updateUsersInvitations = async (userId, isNew) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn(`Invalid userId for invitations: ${userId}`);
      return;
    }

    const invitations = await FriendInvitation.find({
      receiverId: userId,
    }).populate('senderId', 'username email _id').lean();

    const activeConnections = await getActiveConnections(userId);
    const io = getServerSocketInstance();

    activeConnections.forEach((socketId) => {
      io.to(socketId).emit('friend-invitations', { success: true, invitations });
    });

    logger.info(`Friend invitations updated for user ${userId}${isNew ? ' (new)' : ''}`);
  } catch (err) {
    logger.error(`Update invitations error for user ${userId}:`, err);
  }
};

/**
 * Update user's group chat list
 * @param {string} userId - User ID
 */
export const updateUsersGroupChatList = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn(`Invalid userId for group chats: ${userId}`);
      return;
    }

    const user = await User.findById(userId).populate([
      { path: 'groupChats', populate: { path: 'participants', select: '_id email username' } },
      { path: 'groupChats', populate: { path: 'admin', select: '_id email username' } },
    ]).lean();

    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return;
    }

    const groupChats = user.groupChats.map((groupChat) => ({
      groupId: groupChat._id,
      groupName: groupChat.name,
      participants: groupChat.participants,
      admin: groupChat.admin,
    }));

    const activeConnections = await getActiveConnections(userId);
    const io = getServerSocketInstance();

    activeConnections.forEach((socketId) => {
      io.to(socketId).emit('groupChats-list', { success: true, groupChats });
    });

    logger.info(`Group chat list updated for user ${userId}`);
  } catch (err) {
    logger.error(`Update group chats error for user ${userId}:`, err);
  }
};

/**
 * Update user's friends list
 * @param {string} userId - User ID
 */
export const updateUsersFriendsList = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn(`Invalid userId for friends list: ${userId}`);
      return;
    }

    const user = await User.findById(userId).populate('friends', 'username email _id').lean();

    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return;
    }

    const friends = user.friends.map((friend) => ({
      id: friend._id,
      username: friend.username,
      email: friend.email,
    }));

    const activeConnections = await getActiveConnections(userId);
    const io = getServerSocketInstance();

    activeConnections.forEach((socketId) => {
      io.to(socketId).emit('friends-list', { success: true, friends });
    });

    logger.info(`Friends list updated for user ${userId}`);
  } catch (err) {
    logger.error(`Update friends list error for user ${userId}:`, err);
  }
};

/**
 * Update chat history for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} [toSpecificSocketId] - Optional socket ID
 */
export const updateChatHistory = async (conversationId, toSpecificSocketId = null) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      logger.warn(`Invalid conversationId: ${conversationId}`);
      return;
    }

    const conversation = await Conversation.findById(conversationId).populate({
      path: 'messages',
      populate: { path: 'author', select: 'username _id' },
    }).lean();

    if (!conversation) {
      logger.warn(`Conversation not found: ${conversationId}`);
      return;
    }

    const io = getServerSocketInstance();
    if (toSpecificSocketId) {
      io.to(toSpecificSocketId).emit('direct-chat-history', {
        success: true,
        messages: conversation.messages,
        participants: conversation.participants,
      });
      return;
    }

    for (const participantId of conversation.participants) {
      const activeConnections = await getActiveConnections(participantId.toString());
      activeConnections.forEach((socketId) => {
        io.to(socketId).emit('direct-chat-history', {
          success: true,
          messages: conversation.messages,
          participants: conversation.participants,
        });
      });
    }

    logger.info(`Chat history updated for conversation ${conversationId}`);
  } catch (err) {
    logger.error(`Update chat history error for conversation ${conversationId}:`, err);
  }
};

/**
 * Send new direct message to participants
 * @param {string} conversationId - Conversation ID
 * @param {Object} newMessage - New message document
 */
export const sendNewDirectMessage = async (conversationId, newMessage) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      logger.warn(`Invalid conversationId for new message: ${conversationId}`);
      return;
    }

    const conversation = await Conversation.findById(conversationId).lean();
    const messageAuthor = await User.findById(newMessage.author).select('username _id').lean();

    if (!messageAuthor || !conversation) {
      logger.warn(`Invalid author or conversation: ${newMessage.author}, ${conversationId}`);
      return;
    }

    const message = {
      __v: newMessage.__v,
      _id: newMessage._id,
      content: newMessage.content,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
      type: newMessage.type,
      author: { _id: messageAuthor._id, username: messageAuthor.username },
    };

    const io = getServerSocketInstance();
    for (const participantId of conversation.participants) {
      const activeConnections = await getActiveConnections(participantId.toString());
      activeConnections.forEach((socketId) => {
        io.to(socketId).emit('direct-message', {
          success: true,
          newMessage: message,
          participants: conversation.participants,
        });
      });
    }

    logger.info(`New direct message sent in conversation ${conversationId}`);
  } catch (err) {
    logger.error(`Send direct message error for conversation ${conversationId}:`, err);
  }
};

/**
 * Send new group message to participants
 * @param {string} groupChatId - Group chat ID
 * @param {Object} newMessage - New message document
 */
export const sendNewGroupMessage = async (groupChatId, newMessage) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(groupChatId)) {
      logger.warn(`Invalid groupChatId for new message: ${groupChatId}`);
      return;
    }

    const groupChat = await GroupChat.findById(groupChatId).lean();
    const messageAuthor = await User.findById(newMessage.author).select('username _id').lean();

    if (!messageAuthor || !groupChat) {
      logger.warn(`Invalid author or group chat: ${newMessage.author}, ${groupChatId}`);
      return;
    }

    const message = {
      __v: newMessage.__v,
      _id: newMessage._id,
      content: newMessage.content,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
      type: newMessage.type,
      author: { _id: messageAuthor._id, username: messageAuthor.username },
    };

    const io = getServerSocketInstance();
    for (const participantId of groupChat.participants) {
      const activeConnections = await getActiveConnections(participantId.toString());
      activeConnections.forEach((socketId) => {
        io.to(socketId).emit('group-message', {
          success: true,
          newMessage: message,
          groupChatId: groupChat._id.toString(),
        });
      });
    }

    logger.info(`New group message sent in group ${groupChatId}`);
  } catch (err) {
    logger.error(`Send group message error for group ${groupChatId}:`, err);
  }
};

/**
 * Update active rooms for a specific user
 * @param {string} userId - User ID
 * @param {string} socketId - Socket ID
 */
export const initialRoomsUpdate = async (userId, socketId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId) || !socketId) {
      logger.warn(`Invalid userId or socketId: ${userId}, ${socketId}`);
      return;
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      logger.warn(`User not found: ${userId}`);
      return;
    }

    const io = getServerSocketInstance();
    const activeRooms = await getActiveRooms();
    const rooms = activeRooms.filter(
      (room) =>
        room.roomCreator.userId === userId ||
        user.friends.some((f) => f.toString() === room.roomCreator.userId.toString())
    );

    io.to(socketId).emit('active-rooms-initial', { success: true, activeRooms: rooms });
    logger.info(`Initial rooms updated for user ${userId}`);
  } catch (err) {
    logger.error(`Initial rooms update error for user ${userId}:`, err);
  }
};