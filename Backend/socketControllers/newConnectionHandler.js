import winston from 'winston';
import mongoose from 'mongoose';
import { addNewConnectedUser, getOnlineUsers } from '../socket/connectedUsers.js';
import {
  updateUsersInvitations,
  updateUsersFriendsList,
  updateUsersGroupChatList,
  initialRoomsUpdate,
} from './notifyConnectedSockets.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle new socket connection
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} io - Socket.IO server instance
 */
const newConnectionHandler = async (socket, io) => {
  try {
    const userId = socket.user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn(`Invalid userId on connection: ${userId}`);
      socket.emit('error', { success: false, message: 'Invalid user ID' });
      return;
    }

    await addNewConnectedUser({ socketId: socket.id, userId });

    const onlineUsers = await getOnlineUsers();
    io.emit('online-users', { success: true, onlineUsers });

    await Promise.all([
      updateUsersInvitations(userId),
      updateUsersFriendsList(userId),
      updateUsersGroupChatList(userId),
      initialRoomsUpdate(userId, socket.id),
    ]);

    logger.info(`New connection for user ${userId}, socketId=${socket.id}`);
  } catch (err) {
    logger.error(`New connection error for socket ${socket.id}:`, err);
    socket.emit('error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default newConnectionHandler;