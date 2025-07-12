import User from '../models/userModel.js';
import {
  getServerSocketInstance,
  getActiveConnections,
} from '../socket/connectedUsers.js';
import sendPushNotification from './notification.js';

const callRequestHandler = async (socket, data) => {
  const { receiverUserId, callerName, audioOnly, signal } = data;
  const callerUserId = socket.user.userId;

  const activeConnections = getActiveConnections(receiverUserId);
  const io = getServerSocketInstance();

  activeConnections.forEach((socketId) => {
    io.to(socketId).emit('call-request', {
      callerName,
      callerUserId,
      audioOnly,
      signal,
    });
  });

  const sender = await User.findById(callerUserId);
  const receiver = await User.findById(receiverUserId);

  try {
    sendPushNotification({
      sender,
      receiver,
      message: {
        content: `${sender.username} is calling you!`,
        _id: `${callerUserId}-${receiverUserId}-call`,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

export default callRequestHandler;
