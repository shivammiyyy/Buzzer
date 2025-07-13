import winston from 'winston';
import mongoose from 'mongoose';
import GroupChat from '../models/groupChatModel.js';
import { getServerSocketInstance } from '../socket/connectedUsers.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle group chat history request
 * @param {Object} socket - Socket.IO socket instance
 * @param {string} groupChatId - ID of the group chat
 */
const groupChatHistoryHandler = async (socket, groupChatId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(groupChatId)) {
      logger.warn(`Invalid groupChatId: ${groupChatId}`);
      socket.emit('error', { success: false, message: 'Invalid group chat ID' });
      return;
    }

    const groupChat = await GroupChat.findById(groupChatId).populate({
      path: 'messages',
      populate: { path: 'author', select: 'username _id' },
    });

    if (!groupChat) {
      socket.emit('group-chat-history', { success: true, messages: [], groupChatId });
      return;
    }

    const io = getServerSocketInstance();
    io.to(socket.id).emit('group-chat-history', {
      success: true,
      messages: groupChat.messages,
      groupChatId: groupChat._id.toString(),
    });

    logger.info(`Group chat history sent for ${groupChatId} to user ${socket.user.userId}`);
  } catch (err) {
    logger.error(`Group chat history error for user ${socket.user.userId}:`, err);
    socket.emit('error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default groupChatHistoryHandler;