import {
  getServerSocketInstance,
  getActiveConnections,
} from "../socket/connectedUsers.js";

const callResponseHandler = (socket, data) => {
  const { receiverUserId, accepted, signal } = data;
  const { userId } = socket.user;

  const activeConnections = getActiveConnections(receiverUserId);
  const io = getServerSocketInstance();

  activeConnections.forEach((socketId) => {
    io.to(socketId).emit("call-response", {
      otherUserId: userId,
      accepted,
      signal,
    });
  });
};

export default callResponseHandler;
