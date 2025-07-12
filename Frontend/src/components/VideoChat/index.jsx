import React, { useState, useEffect } from "react";
import ResizeRoomButton from "./ResizeRoomButton";
import VideosContainer from "./VideosContainer";
import RoomButtons from "./RoomButtons";

const drawerWidth = 240;

const VideoChat = () => {
  const [isRoomMinimized, setIsRoomMinimized] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 800);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const minimizedStyles = `z-[200] absolute top-0 right-0 bg-[#202225] rounded-lg transition-all duration-500 flex ${
    isMobileView ? "w-[70%] h-[40vh] flex-row" : "w-[30%] h-[40vh] flex-col"
  } items-center justify-center`;

  const fullScreenStyles = `z-[200] absolute top-0 left-0 bg-[#202225] rounded-lg w-full h-screen transition-all duration-500 flex flex-col items-center justify-center ${
    !isMobileView ? `sm:w-[calc(100vw-${drawerWidth}px)]` : ""
  }`;

  return (
    <div className={isRoomMinimized ? minimizedStyles : fullScreenStyles}>
      <VideosContainer isRoomMinimized={isRoomMinimized} />
      <RoomButtons
        isRoomMinimized={isRoomMinimized}
        handleRoomResize={() => setIsRoomMinimized(!isRoomMinimized)}
      />
    </div>
  );
};

export default VideoChat;
