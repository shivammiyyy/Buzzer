import React, { useEffect, useRef } from "react";

const Video = ({ stream, isLocalStream, dimensions }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
        if (isLocalStream) {
          video.muted = true;
          video.volume = 0;
        }
      };
    }
  }, [stream, isLocalStream]);

  return (
    <div
      className="rounded-lg overflow-hidden w-full h-full"
      style={{ width: dimensions.x, height: dimensions.y }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted={isLocalStream}
        className="h-full w-full rounded-lg bg-transparent object-cover"
      />
    </div>
  );
};

export default Video;
