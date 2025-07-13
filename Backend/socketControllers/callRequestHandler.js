import winston from 'winston';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
import { getServerSocketInstance, getActiveConnections } from '../socket/connectedUsers.js';
import sendPushNotification from './notification.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [new winston.transports.Console()],
});

/**
 * Handle WebRTC call request
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} data - Data containing receiverUserId, callerName, audioOnly, signal
 */
const callRequestHandler = async (socket, data) => {
  try {
    const { receiverUserId, callerName, audioOnly, signal } = data;
    const callerUserId = socket.user.userId;

    if (!mongoose.Types.ObjectId.isValid(receiverUserId) || !callerName || typeof audioOnly !== 'boolean') {
      logger.warn(`Invalid call request data: ${JSON.stringify(data)}`);
      socket.emit('call-error', { success: false, message: 'Invalid call request data' });
      return;
    }

    const [sender, receiver, conversation] = await Promise.all([
      User.findById(callerUserId).select('username pushSubscription'),
      User.findById(receiverUserId).select('pushSubscription blockedUsers'),
      Conversation.findOne({ participants: { $all: [callerUserId, receiverUserId] }, type: 'DIRECT' }),
    ]);

    if (!sender || !receiver) {
      logger.warn(`User not found: sender=${callerUserId}, receiver=${receiverUserId}`);
      socket.emit('call-error', { success: false, message: 'User not found' });
      return;
    }

    if (receiver.blockedUsers?.includes(callerUserId)) {
      socket.emit('call-error', { success: false, message: 'Cannot call this user' });
      return;
    }

    if (conversation) {
      await Message.create({
        author: callerUserId,
        content: `${sender.username} requested a ${audioOnly ? 'voice' : 'video'} call`,
        type: 'DIRECT',
        messageType: 'call',
        conversation: conversation._id,
        callMetadata: { callType: audioOnly ? 'voice' : 'video' },
      });
    }

    const activeConnections = await getActiveConnections(receiverUserId);
    const io = getServerSocketInstance();

    activeConnections.forEach((socketId) => {
      io.to(socketId).emit('call-request', {
        success: true,
        callerName,
        callerUserId,
        audioOnly,
        signal,
      });
    });

    await sendPushNotification({
      sender,
      receiver,
      message: {
        _id: `${callerUserId}-${receiverUserId}-call`,
        content: `${sender.username} is calling you!`,
        type: 'DIRECT',
        messageType: 'call',
      },
      conversationId: conversation?._id,
    });

    logger.info(`Call request from ${callerUserId} to ${receiverUserId}`);
    socket.emit('friend-recommendations-update');
  } catch (err) {
    logger.error(`Call request error for user ${socket.user.userId}:`, err);
    socket.emit('call-error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default callRequestHandler;