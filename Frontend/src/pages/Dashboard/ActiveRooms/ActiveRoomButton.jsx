import React from "react";
import { joinRoom } from "../../../socket/roomHandler";
import Avatar from "../../../components/Avatar";

const ActiveRoomButton = ({
  creatorUsername,
  isUserInRoom,
  room,
  alreadyInDirectCall,
}) => {
  const handleJoinActiveRoom = () => {
    joinRoom(room);
  };

  const amountOfParticipants = room.participants.length;
  const activeRoomButtonDisabled = alreadyInDirectCall;
  const roomTitle = `Creator: ${creatorUsername}. Connected: ${amountOfParticipants}`;

  return (
    <div className="group relative mt-2">
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 text-xs text-white bg-gray-800 px-2 py-1 rounded shadow-lg">
        {roomTitle}
      </div>

      {/* Button */}
      <button
        onClick={handleJoinActiveRoom}
        disabled={activeRoomButtonDisabled || isUserInRoom}
        className={`w-12 h-12 rounded-2xl bg-[#5865F2] flex items-center justify-center transition-all 
          ${activeRoomButtonDisabled || isUserInRoom ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
      >
        <Avatar username={creatorUsername} />
      </button>
    </div>
  );
};

export default ActiveRoomButton;
