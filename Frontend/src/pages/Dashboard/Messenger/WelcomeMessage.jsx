import React from "react";
import Robot from "./robot.gif";

const WelcomeMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-grow h-full p-4 text-center">
      <img
        src={Robot}
        alt="robot greeting welcome"
        className="h-[15rem]"
      />
      <h2 className="text-white text-lg mt-4">
        To start chatting - select a friend for conversation
      </h2>
    </div>
  );
};

export default WelcomeMessage;
