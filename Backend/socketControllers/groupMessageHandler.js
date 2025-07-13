import winston from 'winston';
import mongoose from 'mongoose';
import xss from 'xss';
import GroupChat from '../models/groupChatModel.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import { sendNewGroupMessage } from './notifyConnectedSockets.js';
import sendPushNotification from './notification.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

/**
 * Handle group message
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} data - Data containing groupChatId, message
 */
const groupMessageHandler = async (socket, data) => {
  try {
    const { groupChatId, message } = data;
    const senderUserId = socket.user.userId;

    if (!mongoose.Types.ObjectId.isValid(groupChatId) || !message || typeof message !== 'string' || message.trim().length === 0 || message.length > 1000) {
      socket.emit('error', { success: false, message: 'Invalid message or group chat ID' });
      return;
    }

    const groupChat = await GroupChat.findOne({ _id: groupChatId, participants: senderUserId });
    if (!groupChat) {
      socket.emit('error', { success: false, message: 'Group chat not found or user not a participant' });
      return;
    }

    const sender = await User.findById(senderUserId).select('username');
    if (!sender) {
      socket.emit('error', { success: false, message: 'Sender not found' });
      return;
    }

    const sanitizedMessage = xss(message.trim());
    const newMessage = await Message.create({
      author: senderUserId,
      content: sanitizedMessage,
      type: 'GROUP',
    });

    groupChat.messages.push(newMessage._id);
    await groupChat.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('author', 'username _id');

    await sendNewGroupMessage(groupChat._id.toString(), populatedMessage);

    for (const participantId of groupChat.participants) {
      if (participantId.toString() !== senderUserId) {
        const receiver = await User.findById(participantId).select('pushSubscription blockedUsers');
        if (receiver && !receiver.blockedUsers?.includes(senderUserId)) {
          await sendPushNotification({
            sender,
            receiver,
            message: populatedMessage,
            groupChatId: groupChat._id,
          });
        }
      }
    }

    socket.emit('message-sent', {
      success: true,
      messageId: newMessage._id,
      groupChatId,
      timestamp: newMessage.createdAt,
    });

    socket.emit('friend-recommendations-update');
    logger.info(`Group message sent in ${groupChatId} by ${senderUserId}`);
  } catch (err) {
    logger.error(`Group message error for user ${socket.user.userId}:`, err);
    socket.emit('error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default groupMessageHandler;