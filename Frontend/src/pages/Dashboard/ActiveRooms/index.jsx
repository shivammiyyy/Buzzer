import React from "react";
import ActiveRoomButton from "./ActiveRoomButton";
import { useAppSelector } from "../../../store";

const ActiveRooms = () => {
  const {
    room: { activeRooms, isUserInRoom },
    auth: { userDetails },
    videoChat: { localStream },
  } = useAppSelector((state) => state);

  return (
    <div className="flex flex-wrap gap-3 w-full my-5">
      {activeRooms.map((room) => (
        <ActiveRoomButton
          creatorUsername={
            userDetails?._id === room.roomCreator.userId
              ? "ME"
              : room.roomCreator.username
          }
          key={room.roomId}
          isUserInRoom={isUserInRoom}
          room={room}
          alreadyInDirectCall={!!localStream}
        />
      ))}
    </div>
  );
};

export default ActiveRooms;
