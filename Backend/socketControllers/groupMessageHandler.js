import GroupChat from '../models/groupChatModel.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import sendPushNotification from './notification.js';
import {
  updateChatHistory,
  sendNewGroupMessage,
} from './notifyConnectedSockets.js';

const groupMessageHandler = async (socket, data) => {
  try {
    const { groupChatId, message } = data;
    const senderUserId = socket.user.userId;

    const newMessage = await Message.create({
      author: senderUserId,
      content: message,
      type: 'GROUP',
    });

    const groupChat = await GroupChat.findOne({ _id: groupChatId });

    if (!groupChat) {
      return;
    }

    groupChat.messages = [...groupChat.messages, newMessage._id];
    await groupChat.save();

    sendNewGroupMessage(groupChat._id.toString(), newMessage);

    for (const participantId of groupChat.participants) {
      if (participantId.toString() !== senderUserId) {
        const receiver = await User.findById(participantId);
        const sender = await User.findById(senderUserId);

        sendPushNotification({
          sender,
          receiver,
          message: newMessage,
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

export default groupMessageHandler;
