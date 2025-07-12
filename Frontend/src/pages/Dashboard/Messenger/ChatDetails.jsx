import React from "react";
import Messages from "./Messages";
import NewMessageInput from "./NewMessageInput";
import Typing from "./Typing";

const ChatDetails = () => {
  return (
    <div className="flex-grow flex flex-col">
      <Messages />
      <Typing />
      <NewMessageInput />
    </div>
  );
};

export default ChatDetails;
