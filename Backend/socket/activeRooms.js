import { v4 as uuidv4 } from "uuid";

let activeRooms = [];

export const addNewActiveRoom = (userId, username, socketId) => {
  const newActiveRoom = {
    roomCreator: {
      userId,
      socketId,
      username,
    },
    participants: [
      {
        userId,
        username,
        socketId,
      },
    ],
    roomId: uuidv4(),
  };

  activeRooms = [...activeRooms, newActiveRoom];

  console.log(activeRooms);

  return newActiveRoom;
};

export const getActiveRooms = () => {
  return [...activeRooms];
};

export const getActiveRoom = (roomId) => {
  const activeRoom = activeRooms.find(
    (activeRoom) => activeRoom.roomId === roomId
  );

  return activeRoom ? { ...activeRoom } : null;
};

export const joinActiveRoom = (roomId, newParticipant) => {
  const room = activeRooms.find((room) => room.roomId === roomId);
  console.log("room has been found");

  activeRooms = activeRooms.filter((room) => room.roomId !== roomId);
  console.log(activeRooms);

  const updatedRoom = {
    ...room,
    participants: [...room.participants, newParticipant],
  };

  activeRooms.push(updatedRoom);
  console.log("joining");
  console.log(activeRooms);
};

export const leaveActiveRoom = (roomId, participantSocketId) => {
  const activeRoom = activeRooms.find((room) => room.roomId === roomId);

  if (activeRoom) {
    const copyOfActiveRoom = { ...activeRoom };

    copyOfActiveRoom.participants = copyOfActiveRoom.participants.filter(
      (participant) => participant.socketId !== participantSocketId
    );

    activeRooms = activeRooms.filter((room) => room.roomId !== roomId);

    if (copyOfActiveRoom.participants.length > 0) {
      activeRooms.push(copyOfActiveRoom);
    }
  }

  console.log("leaving");
  console.log(activeRooms);
};

export const leaveAllRooms = (connectedSocketId) => {
  const updatedActiveRooms = activeRooms.map((room) => {
    return {
      ...room,
      participants: room.participants.filter(
        (participant) => participant.socketId !== connectedSocketId
      ),
    };
  });

  activeRooms = updatedActiveRooms;
};
