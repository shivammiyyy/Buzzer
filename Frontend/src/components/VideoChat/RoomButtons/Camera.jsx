import React, { useState } from "react";
// Using Heroicons (you can install them or use your own SVGs)
import { VideoCameraIcon, VideoCameraSlashIcon } from "@heroicons/react/24/outline";

const Camera = ({ localStream }) => {
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const handleToggleCamera = () => {
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCameraEnabled((prev) => !prev);
  };

  return (
    <button
      onClick={handleToggleCamera}
      className="p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
    >
      {cameraEnabled ? (
        <VideoCameraIcon className="h-6 w-6 text-white" />
      ) : (
        <VideoCameraSlashIcon className="h-6 w-6 text-white" />
      )}
    </button>
  );
};

export default Camera;
