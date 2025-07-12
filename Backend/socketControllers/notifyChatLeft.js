import {
  getServerSocketInstance,
  getActiveConnections,
} from "../socket/connectedUsers.js";

const notifyChatLeft = (socket, data) => {
  const { receiverUserId } = data;

  const activeConnections = getActiveConnections(receiverUserId);
  const io = getServerSocketInstance();

  activeConnections.forEach((socketId) => {
    io.to(socketId).emit("notify-chat-left");
  });
};

export default notifyChatLeft;
