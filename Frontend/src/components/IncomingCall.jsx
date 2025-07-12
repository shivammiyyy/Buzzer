import React from "react";
import { useAppSelector } from "../store";
import { callResponse } from "../socket/socketConnection";
import { FaVideo, FaPhone, FaPhoneSlash } from "react-icons/fa";

const IncomingCall = () => {
  const callRequest = useAppSelector((state) => state.videoChat.callRequest);

  const handleCall = (accepted, audioOnly) => {
    callResponse({
      receiverUserId: callRequest?.callerUserId,
      accepted,
      audioOnly,
    });
  };

  if (!callRequest?.callerUserId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center">
      <div className="bg-white p-6 rounded-3xl flex flex-col items-center shadow-xl w-[90%] max-w-md text-center">
        <h2 className="text-black font-semibold text-lg mb-2">
          Incoming {callRequest.audioOnly ? "audio" : "video"} call from{" "}
          {callRequest.callerName}
        </h2>

        <div className="flex gap-4 mt-4">
          {!callRequest.audioOnly && (
            <button
              className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition"
              onClick={() => handleCall(true, false)}
              aria-label="Accept Video Call"
            >
              <FaVideo size={20} />
            </button>
          )}

          <button
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition"
            onClick={() => handleCall(true, true)}
            aria-label="Accept Audio Call"
          >
            <FaPhone size={18} />
          </button>

          <button
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition"
            onClick={() => handleCall(false, true)}
            aria-label="Reject Call"
          >
            <FaPhoneSlash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
