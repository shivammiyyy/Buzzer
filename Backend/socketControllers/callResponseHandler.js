import winston from 'winston';
import mongoose from 'mongoose';
import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
import { getServerSocketInstance, getActiveConnections } from '../socket/connectedUsers.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle WebRTC call response
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} data - Data containing receiverUserId, accepted, signal
 */
const callResponseHandler = async (socket, data) => {
  try {
    const { receiverUserId, accepted, signal } = data;
    const { userId, username } = socket.user;

    if (!mongoose.Types.ObjectId.isValid(receiverUserId) || typeof accepted !== 'boolean') {
      logger.warn(`Invalid call response data: ${JSON.stringify(data)}`);
      socket.emit('call-error', { success: false, message: 'Invalid call response data' });
      return;
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, receiverUserId] },
      type: 'DIRECT',
    });

    if (conversation && accepted) {
      await Message.create({
        author: userId,
        content: `${username} ${accepted ? 'accepted' : 'rejected'} the call`,
        type: 'DIRECT',
        messageType: 'call',
        conversation: conversation._id,
      });
    }

    const activeConnections = await getActiveConnections(receiverUserId);
    const io = getServerSocketInstance();

    activeConnections.forEach((socketId) => {
      io.to(socketId).emit('call-response', {
        success: true,
        otherUserId: userId,
        accepted,
        signal,
      });
    });

    logger.info(`Call response from ${userId} to ${receiverUserId}: ${accepted}`);
    socket.emit('friend-recommendations-update');
  } catch (err) {
    logger.error(`Call response error for user ${socket.user.userId}:`, err);
    socket.emit('call-error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default callResponseHandler;