import winston from 'winston';
import mongoose from 'mongoose';
import { getActiveRoom, joinRoom } from '../../socket/activeRooms.js';
import { updateRooms } from './notifyConnectedSockets.js';
import Message from '../../models/messageModel.js';
import Conversation from '../../models/conversationModel.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle joining a WebRTC call room
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} data - Data containing roomId
 */
const roomJoinHandler = async (socket, data) => {
  try {
    const { roomId } = data;
    const { userId, username } = socket.user;

    if (!roomId || !mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn(`Invalid input for room join: roomId=${roomId}, userId=${userId}`);
      socket.emit('room-error', { success: false, message: 'Invalid room or user ID' });
      return;
    }

    const roomDetails = await getActiveRoom(roomId);
    if (!roomDetails) {
      logger.warn(`Room not found: ${roomId}`);
      socket.emit('room-error', { success: false, message: 'Room not found' });
      return;
    }

    const participantDetails = { userId, username, socketId: socket.id };
    await joinRoom(roomId, participantDetails);

    // Log join event in conversation
    const conversation = await Conversation.findOne({
      participants: userId,
      type: 'DIRECT',
    });
    if (conversation) {
      await Message.create({
        author: userId,
        content: `${username} joined the call`,
        type: 'DIRECT',
        messageType: 'call',
        conversation: conversation._id,
      });
    }

    roomDetails.participants.forEach((participant) => {
      if (participant.socketId !== socket.id) {
        socket.to(participant.socketId).emit('conn-prepare', {
          success: true,
          connUserSocketId: socket.id,
        });
      }
    });

    await updateRooms();
    logger.info(`User ${userId} joined room: ${roomId}`);
  } catch (err) {
    logger.error(`Room join error for user ${socket.user.userId}:`, err);
    socket.emit('room-error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default roomJoinHandler;