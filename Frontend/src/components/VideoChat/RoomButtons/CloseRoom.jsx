import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { clearVideoChat } from "../../../actions/videoChatActions";
import { notifyChatLeft } from "../../../socket/socketConnection";
import { leaveRoom } from "../../../socket/roomHandler";

const CloseRoom = ({ type }) => {
  const dispatch = useDispatch();

  const otherUserId = useSelector(
    (state) => state?.videoChat?.otherUserId
  );

  const handleLeaveRoom = () => {
    if (type === "DIRECT CALL") {
      if (otherUserId) {
        notifyChatLeft(otherUserId);
      }
      dispatch(clearVideoChat("You left the chat"));
    }

    if (type === "ROOM") {
      leaveRoom();
    }
  };

  return (
    <button
      onClick={handleLeaveRoom}
      className="p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
      title="Leave Room"
    >
      <XMarkIcon className="h-6 w-6 text-white" />
    </button>
  );
};

export default CloseRoom;
