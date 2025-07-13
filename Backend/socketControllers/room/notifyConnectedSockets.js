import winston from 'winston';
import mongoose from 'mongoose';
import User from '../../models/userModel.js';
import { getActiveRooms, getActiveRoom } from '../../socket/activeRooms.js';
import { getServerSocketInstance } from '../../socket/connectedUsers.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

/**
 * Notify connected sockets about active rooms
 * @param {string} [toSpecifiedSocketId] - Optional socket ID to notify
 */
export const updateRooms = async (toSpecifiedSocketId = null) => {
  try {
    const io = getServerSocketInstance();
    const activeRooms = getActiveRooms();

    if (toSpecifiedSocketId) {
      io.to(toSpecifiedSocketId).emit('active-rooms', { success: true, activeRooms });
      logger.info(`Active rooms sent to socket ${toSpecifiedSocketId}`);
    } else {
      io.emit('active-rooms', { success: true, activeRooms });
      logger.info('Active rooms broadcast to all sockets');
    }
  } catch (err) {
    logger.error(`Update rooms error:`, err);
  }
};

/**
 * Notify specific room participants
 * @param {string} roomId - Room ID
 */
export const updateRoomParticipants = async (roomId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      logger.warn(`Invalid roomId: ${roomId}`);
      return;
    }

    const room = getActiveRoom(roomId);
    if (!room) {
      logger.warn(`Room not found: ${roomId}`);
      return;
    }

    const io = getServerSocketInstance();
    room.participants.forEach((participant) => {
      io.to(participant.socketId).emit('room-participants', {
        success: true,
        roomId,
        participants: room.participants,
      });
    });

    logger.info(`Room participants updated for room ${roomId}`);
  } catch (err) {
    logger.error(`Update room participants error for room ${roomId}:`, err);
  }
};