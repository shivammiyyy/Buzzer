import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  PresentationChartBarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { setScreenSharingStream } from "../../../actions/videoChatActions";
import { currentPeerConnection } from "../../../socket/socketConnection";
import { switchOutgoingTracks } from "../../../socket/webRTC";
import { setScreenSharingStreamRoom } from "../../../actions/roomActions";

const ScreenShare = ({ videoChat, room, type }) => {
  const dispatch = useDispatch();
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);

  const handleScreenShareToggle = async () => {
    if (type === "DIRECT CALL") {
      handleDirectCall();
    } else if (type === "ROOM") {
      handleRoomCall();
    }
  };

  const handleDirectCall = async () => {
    if (!videoChat) return;

    if (screenShareEnabled) {
      try {
        currentPeerConnection?.replaceTrack(
          videoChat.screenSharingStream?.getVideoTracks()[0],
          currentPeerConnection.streams[0].getVideoTracks()[0],
          videoChat.localStream
        );
      } catch (err) {
        console.log(err);
      }

      videoChat.screenSharingStream?.getTracks().forEach((track) => track.stop());
      dispatch(setScreenSharingStream(null));
      setScreenShareEnabled(false);
    } else {
      const mediaDevices = navigator.mediaDevices;
      const screenShareStream = await mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      dispatch(setScreenSharingStream(screenShareStream));
      setScreenShareEnabled(true);

      currentPeerConnection?.replaceTrack(
        currentPeerConnection.streams[0].getVideoTracks()[0],
        screenShareStream.getTracks()[0],
        currentPeerConnection.streams[0]
      );
    }
  };

  const handleRoomCall = async () => {
    if (!room || !room.localStreamRoom) return;

    if (!screenShareEnabled) {
      let stream = null;
      try {
        const mediaDevices = navigator.mediaDevices;
        stream = await mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
      } catch (err) {
        console.log("Error accessing screen share stream", err);
      }

      if (stream) {
        dispatch(setScreenSharingStreamRoom(stream));
        switchOutgoingTracks(stream);
        setScreenShareEnabled(true);
      }
    } else {
      switchOutgoingTracks(room.localStreamRoom);
      room.screenSharingStream?.getTracks().forEach((t) => t.stop());
      dispatch(setScreenSharingStreamRoom(null));
      setScreenShareEnabled(false);
    }
  };

  return (
    <button
      onClick={handleScreenShareToggle}
      className="p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
    >
      {screenShareEnabled ? (
        <XCircleIcon className="h-6 w-6 text-white" />
      ) : (
        <PresentationChartBarIcon className="h-6 w-6 text-white" />
      )}
    </button>
  );
};

export default ScreenShare;
