import React, { useState } from "react";
import { MicrophoneIcon} from "@heroicons/react/24/outline";

const Microphone = ({ localStream }) => {
  const [micEnabled, setMicEnabled] = useState(true);

  const handleToggleMic = () => {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMicEnabled((prev) => !prev);
  };

  return (
    <button
      onClick={handleToggleMic}
      className="p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
    >
      {micEnabled ? (
        <MicrophoneIcon className="h-6 w-6 text-white" />
      ) : (
        <MicrophoneIcon className="h-6 w-6 text-white" />
      )}
    </button>
  );
};

export default Microphone;
