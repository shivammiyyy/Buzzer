import winston from 'winston';
import mongoose from 'mongoose';
import { getServerSocketInstance, getActiveConnections } from '../socket/connectedUsers.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Notify user that a chat was left
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} data - Data containing receiverUserId
 */
const notifyChatLeft = async (socket, data) => {
  try {
    const { receiverUserId } = data;

    if (!mongoose.Types.ObjectId.isValid(receiverUserId)) {
      logger.warn(`Invalid receiverUserId for notify-chat-left: ${receiverUserId}`);
      socket.emit('error', { success: false, message: 'Invalid receiver ID' });
      return;
    }

    const activeConnections = await getActiveConnections(receiverUserId);
    const io = getServerSocketInstance();

    activeConnections.forEach((socketId) => {
      io.to(socketId).emit('notify-chat-left', { success: true });
    });

    logger.info(`Chat left notification sent to ${receiverUserId}`);
  } catch (err) {
    logger.error(`Notify chat left error for user ${socket.user.userId}:`, err);
    socket.emit('error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default notifyChatLeft;