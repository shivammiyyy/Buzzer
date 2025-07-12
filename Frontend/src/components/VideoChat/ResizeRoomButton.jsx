import React from "react";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";

const ResizeRoomButton = ({ isRoomMinimized, handleRoomResize }) => {
  return (
    <div>
      <button
        onClick={handleRoomResize}
        className="p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
      >
        {isRoomMinimized ? (
          <ArrowsPointingOutIcon className="h-6 w-6 text-white" />
        ) : (
          <ArrowsPointingInIcon className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
};

export default ResizeRoomButton;
