import winston from 'winston';
import mongoose from 'mongoose';
import { getActiveRoom, leaveRoom } from '../../socket/activeRooms.js';
import { updateRooms } from './notifyConnectedSockets.js';
import Message from '../../models/messageModel.js';
import Conversation from '../../models/conversationModel.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle leaving a WebRTC call room
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} data - Data containing roomId
 */
const roomLeaveHandler = async (socket, data) => {
  try {
    const { roomId } = data;
    const { userId, username } = socket.user;

    if (!roomId) {
      logger.warn(`Invalid roomId for room leave: ${roomId}`);
      socket.emit('room-error', { success: false, message: 'Invalid room ID' });
      return;
    }

    const activeRoom = await getActiveRoom(roomId);
    if (!activeRoom) {
      logger.warn(`Room not found: ${roomId}`);
      socket.emit('room-error', { success: false, message: 'Room not found' });
      return;
    }

    await leaveRoom(roomId, socket.id);

    // Log leave event in conversation
    const conversation = await Conversation.findOne({
      participants: userId,
      type: 'DIRECT',
    });
    if (conversation) {
      await Message.create({
        author: userId,
        content: `${username} left the call`,
        type: 'DIRECT',
        messageType: 'call',
        conversation: conversation._id,
      });
    }

    const updatedActiveRoom = await getActiveRoom(roomId);
    if (updatedActiveRoom) {
      updatedActiveRoom.participants.forEach((participant) => {
        socket.to(participant.socketId).emit('room-participant-left', {
          success: true,
          connUserSocketId: socket.id,
        });
      });
    }

    await updateRooms();
    logger.info(`User ${userId} left room: ${roomId}`);
  } catch (err) {
    logger.error(`Room leave error for user ${socket.user.userId}:`, err);
    socket.emit('room-error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default roomLeaveHandler;