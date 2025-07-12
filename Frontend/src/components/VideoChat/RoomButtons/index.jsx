import React, { useEffect, useState } from "react";
import Camera from "./Camera";
import Microphone from "./Microphone";
import CloseRoom from "./CloseRoom";
import ScreenShare from "./ScreenShare";
import ResizeRoomButton from "../ResizeRoomButton";
import { useSelector } from "react-redux";

const RoomButtons = ({ isRoomMinimized, handleRoomResize }) => {
  const { videoChat, room } = useSelector((state) => state);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 800);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerClass = `
    w-full h-[15%] bg-indigo-600 rounded-t-lg flex items-center justify-center
    ${isMobileView && isRoomMinimized ? "flex-col h-full w-[15%]" : ""}
  `;

  const renderDirectCallButtons = () => (
    <>
      {!videoChat.audioOnly && (
        <>
          <ScreenShare videoChat={videoChat} type="DIRECT CALL" />
          <Camera localStream={videoChat.localStream} />
        </>
      )}
      <Microphone localStream={videoChat.localStream} />
      <CloseRoom type="DIRECT CALL" />
      <ResizeRoomButton
        isRoomMinimized={isRoomMinimized}
        handleRoomResize={handleRoomResize}
      />
    </>
  );

  const renderRoomCallButtons = () => (
    <>
      {!room.isUserJoinedWithOnlyAudio && (
        <>
          <ScreenShare room={room} type="ROOM" />
          <Camera localStream={room.localStreamRoom} />
        </>
      )}
      <Microphone localStream={room.localStreamRoom} />
      <CloseRoom type="ROOM" />
      <ResizeRoomButton
        isRoomMinimized={isRoomMinimized}
        handleRoomResize={handleRoomResize}
      />
    </>
  );

  return (
    <>
      {videoChat?.localStream && (
        <div className={containerClass}>{renderDirectCallButtons()}</div>
      )}
      {!videoChat?.localStream && room?.localStreamRoom && (
        <div className={containerClass}>{renderRoomCallButtons()}</div>
      )}
    </>
  );
};

export default RoomButtons;
