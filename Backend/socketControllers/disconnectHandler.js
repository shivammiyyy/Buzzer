import { leaveAllRooms } from "../socket/activeRooms.js";
import {
  removeConnectedUser,
  getOnlineUsers,
} from "../socket/connectedUsers.js";
import { updateRooms } from "./notifyConnectedSockets.js";

const disconnectHandler = (socket, io) => {
  removeConnectedUser({ socketId: socket.id });

  // emit online users to all connected users
  io.emit("online-users", getOnlineUsers());

  leaveAllRooms(socket.id);
  updateRooms();
};

export default disconnectHandler;
