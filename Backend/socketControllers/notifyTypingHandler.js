import winston from 'winston';
import mongoose from 'mongoose';
import { getActiveConnections } from '../socket/connectedUsers.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle typing notification
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} io - Socket.IO server instance
 * @param {Object} data - Data containing receiverUserId, typing
 */
const notifyTypingHandler = async (socket, io, data) => {
  try {
    const { receiverUserId, typing } = data;

    if (!mongoose.Types.ObjectId.isValid(receiverUserId) || typeof typing !== 'boolean') {
      logger.warn(`Invalid typing data: receiverUserId=${receiverUserId}, typing=${typing}`);
      socket.emit('error', { success: false, message: 'Invalid typing data' });
      return;
    }

    const activeConnections = await getActiveConnections(receiverUserId.toString());
    activeConnections.forEach((socketId) => {
      io.to(socketId).emit('notify-typing', {
        success: true,
        senderUserId: socket.user.userId,
        typing,
      });
    });

    logger.info(`Typing notification sent to ${receiverUserId} by ${socket.user.userId}`);
  } catch (err) {
    logger.error(`Typing notification error for user ${socket.user.userId}:`, err);
    socket.emit('error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default notifyTypingHandler;