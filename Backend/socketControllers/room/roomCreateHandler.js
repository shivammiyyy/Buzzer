import winston from 'winston';
import { createNewRoom } from '../../socket/activeRooms.js';
import { updateRooms } from './notifyConnectedSockets.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

/**
 * Handle room creation for WebRTC call
 * @param {Object} socket - Socket.IO socket instance
 */
const roomCreateHandler = async (socket) => {
  try {
    const { userId, username } = socket.user;
    const socketId = socket.id;

    if (!userId || !username || !socketId) {
      logger.warn(`Invalid user data for room creation: ${JSON.stringify(socket.user)}, IP: ${socket.handshake.address}`);
      socket.emit('room-error', { success: false, message: 'Invalid user data' });
      return;
    }

    const roomId = createNewRoom({ userId, socketId });
    if (!roomId) {
      logger.error(`Failed to create room for user: ${userId}`);
      socket.emit('room-error', { success: false, message: 'Failed to create room' });
      return;
    }

    const roomDetails = {
      roomId,
      roomCreator: { userId, username },
      participants: [{ userId, username }],
    };

    socket.emit('room-create', { success: true, roomDetails });
    await updateRooms();
    logger.info(`Room created: ${roomId} by user: ${userId}, IP: ${socket.handshake.address}`);
  } catch (err) {
    logger.error(`Room creation error for user ${socket.user?.userId}: ${err.message}`);
    socket.emit('room-error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default roomCreateHandler;