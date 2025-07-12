import { getActiveRoom, joinActiveRoom } from "../../socket/activeRooms.js";
import { updateRooms } from "../notifyConnectedSockets.js";
// import { updateRooms } from "../notifyConnectedSockets.js";

const roomJoinHandler = (socket, data) => {
  const { roomId } = data;

  const participantDetails = {
    userId: socket.user.userId,
    socketId: socket.id,
    username: socket.user.username,
  };

  const roomDetails = getActiveRoom(roomId);
  joinActiveRoom(roomId, participantDetails);

  // send information to users in room that they should prepare for incoming connection
  roomDetails.participants.forEach((participant) => {
    if (participant.socketId !== participantDetails.socketId) {
      socket.to(participant.socketId).emit("conn-prepare", {
        connUserSocketId: participantDetails.socketId,
      });
    }
  });

  updateRooms();
};

export default roomJoinHandler;
