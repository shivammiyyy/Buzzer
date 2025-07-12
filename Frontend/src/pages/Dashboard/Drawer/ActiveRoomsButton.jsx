import React from "react";
import { Users2 } from "lucide-react"; // Replace with preferred icon lib

const ActiveRoomsButton = () => {
  return (
    <button
      className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition duration-200"
    >
      <Users2 size={24} />
    </button>
  );
};

export default ActiveRoomsButton;
