import winston from 'winston';
import { leaveAllRooms } from '../socket/activeRooms.js';
import { removeConnectedUser, getOnlineUsers } from '../socket/connectedUsers.js';
import { updateRooms } from './room/notifyConnectedSockets.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle socket disconnection
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} io - Socket.IO server instance
 */
const disconnectHandler = async (socket, io) => {
  try {
    const socketId = socket.id;
    if (!socketId) {
      logger.warn('Invalid socket ID on disconnect');
      return;
    }

    await removeConnectedUser({ socketId });
    await leaveAllRooms(socketId);

    const onlineUsers = await getOnlineUsers();
    io.emit('online-users', { success: true, onlineUsers });

    await updateRooms();
    logger.info(`User disconnected: socketId=${socketId}, userId=${socket.user.userId}`);
  } catch (err) {
    logger.error(`Disconnect error for socket ${socket.id}:`, err);
  }
};

export default disconnectHandler;