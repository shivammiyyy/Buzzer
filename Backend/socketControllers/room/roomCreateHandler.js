import { addNewActiveRoom } from "../../socket/activeRooms.js";
import { updateRooms } from "../notifyConnectedSockets.js";

const roomCreateHandler = (socket) => {
  console.log("handling room create event");
  const socketId = socket.id;
  const { userId, username } = socket.user;

  const roomDetails = addNewActiveRoom(userId, username, socketId);

  socket.emit("room-create", {
    roomDetails,
  });

  updateRooms();
};

export default roomCreateHandler;
