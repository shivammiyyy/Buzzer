import winston from 'winston';
import mongoose from 'mongoose';
import Conversation from '../models/conversationModel.js';
import { updateChatHistory } from './notifyConnectedSockets.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle direct chat history request
 * @param {Object} socket - Socket.IO socket instance
 * @param {string} receiverUserId - ID of the receiver user
 */
const directChatHistoryHandler = async (socket, receiverUserId) => {
  try {
    const senderUserId = socket.user.userId;

    if (!mongoose.Types.ObjectId.isValid(receiverUserId)) {
      logger.warn(`Invalid receiverUserId: ${receiverUserId}`);
      socket.emit('error', { success: false, message: 'Invalid receiver ID' });
      return;
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [receiverUserId, senderUserId] },
      type: 'DIRECT',
    }).populate({
      path: 'messages',
      populate: { path: 'author', select: 'username _id' },
    });

    if (!conversation) {
      socket.emit('direct-chat-history', { success: true, messages: [], participants: [] });
      return;
    }

    await updateChatHistory(conversation._id.toString(), socket.id);
    logger.info(`Chat history sent for conversation ${conversation._id} to user ${senderUserId}`);
  } catch (err) {
    logger.error(`Direct chat history error for user ${socket.user.userId}:`, err);
    socket.emit('error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default directChatHistoryHandler;