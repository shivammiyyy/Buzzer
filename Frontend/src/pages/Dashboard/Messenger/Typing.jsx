import React from "react";
import gif from "./dots.gif";
import { useAppSelector } from "../../../store";
import Avatar from "../../../components/Avatar";

const Typing = () => {
  const { chosenChatDetails, typing } = useAppSelector((state) => state.chat);

  const isTyping = typing.find(
    (item) => item.userId === chosenChatDetails?.userId
  );

  return (
    <div className="flex items-center h-[82px] w-[82px] ml-[10px]">
      {isTyping?.typing && (
        <>
          <Avatar username={chosenChatDetails?.username} />
          <img
            src={gif}
            alt="typing..."
            className="h-[50%] w-[50%] ml-[3px]"
          />
        </>
      )}
    </div>
  );
};

export default Typing;
