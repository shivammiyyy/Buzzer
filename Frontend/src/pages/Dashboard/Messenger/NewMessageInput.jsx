import React, { useState, useEffect } from "react";
import { useAppSelector } from "../../../store";
import {
  notifyTyping,
  sendDirectMessage,
  sendGroupMessage,
} from "../../../socket/socketConnection";

const NewMessageInput = () => {
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);

  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);

  const { chosenChatDetails, chosenGroupChatDetails } = useAppSelector(
    (state) => state.chat
  );

  const handleSendMessage = (e) => {
    if (e.key === "Enter") {
      if (chosenChatDetails) {
        sendDirectMessage({
          message,
          receiverUserId: chosenChatDetails.userId,
        });
      }

      if (chosenGroupChatDetails) {
        sendGroupMessage({
          message,
          groupChatId: chosenGroupChatDetails.groupId,
        });
      }

      setMessage("");
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    if (chosenChatDetails?.userId) {
      notifyTyping({
        receiverUserId: chosenChatDetails.userId,
        typing: focused,
      });
    }
  }, [focused, chosenChatDetails?.userId]);

  return (
    <div className="h-[60px] w-full flex items-center justify-center">
      <input
        type="text"
        placeholder={
          chosenChatDetails
            ? `Write message to ${chosenChatDetails.username}`
            : "Your message..."
        }
        value={message}
        onChange={handleChange}
        onKeyDown={handleSendMessage}
        onFocus={onFocus}
        onBlur={onBlur}
        className="bg-[#2f3136] w-[98%] h-[44px] text-white border-none rounded-lg text-sm px-3 outline-none"
      />
    </div>
  );
};

export default NewMessageInput;
