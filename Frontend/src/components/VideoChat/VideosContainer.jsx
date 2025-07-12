import React, { useEffect, useState } from "react";
import Video from "./Video";
import { useAppSelector } from "../../store";
import useVideoSize from "../../utils/hooks/useVideoSize";

const AR = 4 / 3;

const VideosContainer = ({ isRoomMinimized }) => {
  const {
    videoChat: {
      localStream,
      callStatus,
      remoteStream,
      screenSharingStream,
    },
    room: {
      localStreamRoom,
      remoteStreams,
      screenSharingStream: screenSharingStreamRoom,
    },
  } = useAppSelector((state) => state);

  const { x, y } = useVideoSize(remoteStreams.length + 1, AR);
  const { x: xDirectCall, y: yDirectCall } = useVideoSize(2, AR);

  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 800);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`overflow-y-scroll flex flex-wrap justify-center items-center gap-2 p-2 w-full ${
        isMobileView && isRoomMinimized ? "h-full w-[85%] flex-row" : "h-[85%]"
      }`}
    >
      {localStream && (
        <Video
          stream={screenSharingStream || localStream}
          isLocalStream={true}
          dimensions={{ x: xDirectCall, y: yDirectCall }}
        />
      )}

      {localStreamRoom && (
        <Video
          stream={screenSharingStreamRoom || localStreamRoom}
          isLocalStream={true}
          dimensions={{ x, y }}
        />
      )}

      {callStatus !== "accepted" && (
        <p className="text-sm font-semibold text-[#b9bbbe] w-full text-center">
          {callStatus === "ringing"
            ? "Ringing...."
            : callStatus === "rejected"
            ? "Call Rejected"
            : ""}
        </p>
      )}

      {remoteStream && (
        <Video
          stream={remoteStream}
          isLocalStream={false}
          dimensions={{ x: xDirectCall, y: yDirectCall }}
        />
      )}

      {remoteStreams.map((stream) => (
        <Video
          stream={stream}
          key={stream.id}
          isLocalStream={false}
          dimensions={{ x, y }}
        />
      ))}
    </div>
  );
};

export default VideosContainer;
