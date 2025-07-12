import React from "react";
import { useAppSelector } from "../../../store";
import WelcomeMessage from "./WelcomeMessage";
import ChatDetails from "./ChatDetails";

const Messenger = () => {
  const { chosenChatDetails, chosenGroupChatDetails } = useAppSelector((state) => state.chat);

  return (
    <div className="flex flex-grow bg-[#36393f]">
      {chosenChatDetails?.userId || chosenGroupChatDetails?.groupId ? (
        <ChatDetails />
      ) : (
        <WelcomeMessage />
      )}
    </div>
  );
};

export default Messenger;
