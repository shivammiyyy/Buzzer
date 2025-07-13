import winston from 'winston';
import mongoose from 'mongoose';
import xss from 'xss';
import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import { sendNewDirectMessage } from './notifyConnectedSockets.js';
import sendPushNotification from './notification.js';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

/**
 * Handle direct message
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} data - Data containing receiverUserId, message, messageType, replyTo
 */
const directMessageHandler = async (socket, data) => {
  try {
    const { receiverUserId, message, messageType = 'text', replyTo } = data;
    const senderUserId = socket.user.userId;

    if (!mongoose.Types.ObjectId.isValid(receiverUserId) || !message || typeof message !== 'string' || message.trim().length === 0 || message.length > 1000) {
      socket.emit('error', { success: false, message: 'Invalid message or receiver ID' });
      return;
    }

    if (senderUserId === receiverUserId) {
      socket.emit('error', { success: false, message: 'Cannot send message to yourself' });
      return;
    }

    const [receiver, sender] = await Promise.all([
      User.findById(receiverUserId).select('friends blockedUsers pushSubscription'),
      User.findById(senderUserId).select('username friends avatar'),
    ]);

    if (!receiver || !sender) {
      socket.emit('error', { success: false, message: 'User not found' });
      return;
    }

    if (!sender.friends.includes(receiverUserId)) {
      socket.emit('error', { success: false, message: 'Can only message friends' });
      return;
    }

    if (receiver.blockedUsers?.includes(senderUserId)) {
      socket.emit('error', { success: false, message: 'Cannot send message to this user' });
      return;
    }

    const sanitizedMessage = xss(message.trim());
    let replyToMessage = null;
    if (replyTo && mongoose.Types.ObjectId.isValid(replyTo)) {
      replyToMessage = await Message.findById(replyTo);
      if (!replyToMessage) {
        socket.emit('error', { success: false, message: 'Reply message not found' });
        return;
      }
    }

    const messageData = {
      author: senderUserId,
      content: sanitizedMessage,
      type: 'DIRECT',
      messageType,
      ...(replyToMessage && { replyTo: replyToMessage._id }),
    };

    const conversation = await Conversation.findOne({
      participants: { $all: [receiverUserId, senderUserId] },
      type: 'DIRECT',
    });

    const newMessage = await Message.create(messageData);

    if (conversation) {
      conversation.messages.push(newMessage._id);
      conversation.lastMessage = newMessage._id;
      conversation.lastActivity = new Date();
      await conversation.save();
    } else {
      const newConversation = await Conversation.create({
        participants: [senderUserId, receiverUserId],
        messages: [newMessage._id],
        type: 'DIRECT',
        lastMessage: newMessage._id,
        lastActivity: new Date(),
      });
      newMessage.conversation = newConversation._id;
      await newMessage.save();
    }

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('author', 'username avatar')
      .populate({ path: 'replyTo', populate: { path: 'author', select: 'username' } });

    await sendNewDirectMessage(newMessage.conversation.toString(), populatedMessage);

    await sendPushNotification({
      sender,
      receiver,
      message: populatedMessage,
      conversationId: newMessage.conversation,
    });

    socket.emit('message-sent', {
      success: true,
      messageId: newMessage._id,
      conversationId: newMessage.conversation,
      timestamp: newMessage.createdAt,
    });

    socket.emit('friend-recommendations-update');
    logger.info(`Direct message sent from ${senderUserId} to ${receiverUserId}`);
  } catch (err) {
    logger.error(`Direct message error for user ${socket.user.userId}:`, err);
    socket.emit('error', {
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  }
};

export default directMessageHandler;