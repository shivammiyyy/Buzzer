import React from "react";
import { createNewRoom } from "../../../socket/roomHandler";
import { IoAdd } from "react-icons/io5"; // Replace MUI AddIcon with react-icons

const CreateRoomButton = ({ isUserInRoom }) => {
  const createNewRoomHandler = () => {
    createNewRoom();
  };

  return (
    <button
      onClick={createNewRoomHandler}
      disabled={isUserInRoom}
      className={`w-12 h-12 mt-2 rounded-xl flex items-center justify-center text-white transition 
        ${isUserInRoom ? "bg-indigo-500 opacity-50 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"}`}
    >
      <IoAdd size={24} />
    </button>
  );
};

export default CreateRoomButton;
