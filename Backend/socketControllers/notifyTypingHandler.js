import { getActiveConnections } from "../socket/connectedUsers.js";

const notifyTypingHandler = (socket, io, data) => {
  const { receiverUserId, typing } = data;

  const activeConnections = getActiveConnections(receiverUserId?.toString());

  activeConnections.forEach((socketId) => {
    io.to(socketId).emit("notify-typing", {
      senderUserId: socket.user.userId,
      typing,
    });
  });
};

export default notifyTypingHandler;
