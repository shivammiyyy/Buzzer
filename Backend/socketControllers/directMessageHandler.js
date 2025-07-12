import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';
import xss from 'xss';
import {
  updateChatHistory,
  sendNewDirectMessage,
} from './notifyConnectedSockets.js';
import sendPushNotification from './notification.js';

const directMessageHandler = async (socket, data) => {
  try {
    // Input validation
    const { receiverUserId, message, messageType = 'text', replyTo } = data;
    
    if (!receiverUserId || !message) {
      socket.emit('error', { 
        type: 'VALIDATION_ERROR',
        message: 'Receiver ID and message are required' 
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(receiverUserId)) {
      socket.emit('error', { 
        type: 'VALIDATION_ERROR',
        message: 'Invalid receiver ID' 
      });
      return;
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      socket.emit('error', { 
        type: 'VALIDATION_ERROR',
        message: 'Message cannot be empty' 
      });
      return;
    }

    if (message.length > 1000) {
      socket.emit('error', { 
        type: 'VALIDATION_ERROR',
        message: 'Message too long (max 1000 characters)' 
      });
      return;
    }

    const senderUserId = socket.user.userId;
    
    // Prevent self-messaging
    if (senderUserId === receiverUserId) {
      socket.emit('error', { 
        type: 'VALIDATION_ERROR',
        message: 'Cannot send message to yourself' 
      });
      return;
    }

    // Check if receiver exists and is a friend
    const [receiver, sender] = await Promise.all([
      User.findById(receiverUserId),
      User.findById(senderUserId)
    ]);

    if (!receiver) {
      socket.emit('error', { 
        type: 'USER_NOT_FOUND',
        message: 'Receiver not found' 
      });
      return;
    }

    if (!sender) {
      socket.emit('error', { 
        type: 'USER_NOT_FOUND',
        message: 'Sender not found' 
      });
      return;
    }

    // Check if users are friends
    const isFriend = sender.friends.includes(receiverUserId);
    if (!isFriend) {
      socket.emit('error', { 
        type: 'PERMISSION_DENIED',
        message: 'Can only message friends' 
      });
      return;
    }

    // Check if sender is blocked
    const isBlocked = receiver.blockedUsers && receiver.blockedUsers.includes(senderUserId);
    if (isBlocked) {
      socket.emit('error', { 
        type: 'PERMISSION_DENIED',
        message: 'Cannot send message to this user' 
      });
      return;
    }

    // Sanitize message content
    const sanitizedMessage = xss(message.trim());

    // Validate reply message if provided
    let replyToMessage = null;
    if (replyTo && mongoose.Types.ObjectId.isValid(replyTo)) {
      replyToMessage = await Message.findById(replyTo);
      if (!replyToMessage) {
        socket.emit('error', { 
          type: 'VALIDATION_ERROR',
          message: 'Reply message not found' 
        });
        return;
      }
    }

    // Create message
    const messageData = {
      author: senderUserId,
      content: sanitizedMessage,
      type: 'DIRECT',
      messageType: messageType || 'text',
    };

    if (replyToMessage) {
      messageData.replyTo = replyToMessage._id;
    }

    const newMessage = await Message.create(messageData);

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [receiverUserId, senderUserId] },
      type: 'DIRECT',
    });

    if (conversation) {
      // Update existing conversation
      conversation.messages.push(newMessage._id);
      conversation.lastMessage = newMessage._id;
      conversation.lastActivity = new Date();
      await conversation.save();
    } else {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [senderUserId, receiverUserId],
        messages: [newMessage._id],
        type: 'DIRECT',
        lastMessage: newMessage._id,
        lastActivity: new Date(),
      });
    }

    // Update message with conversation reference
    newMessage.conversation = conversation._id;
    await newMessage.save();

    // Populate message for sending
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('author', 'username avatar')
      .populate('replyTo', 'content author')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'author',
          select: 'username'
        }
      });

    // Send message to participants
    await sendNewDirectMessage(conversation._id.toString(), populatedMessage);

    // Send push notification
    try {
      await sendPushNotification({
        sender,
        receiver,
        message: populatedMessage,
        conversationId: conversation._id,
      });
    } catch (notificationError) {
      console.error('Push notification error:', notificationError);
      // Don't fail the message sending if notification fails
    }

    // Confirm message sent
    socket.emit('message-sent', { 
      messageId: newMessage._id,
      conversationId: conversation._id,
      timestamp: newMessage.createdAt,
    });

  } catch (error) {
    console.error('Direct message error:', error);
    socket.emit('error', { 
      type: 'SERVER_ERROR',
      message: 'Failed to send message' 
    });
  }
};

export default directMessageHandler;