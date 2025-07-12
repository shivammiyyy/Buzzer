import React, { useState, useEffect, useRef } from "react";
import MessagesHeader from "./Header";
import Message from "./Message";
import { useAppSelector } from "../../../../store";
import {
  fetchDirectChatHistory,
  fetchGroupChatHistory,
} from "../../../../socket/socketConnection";
import DateSeparator from "./DateSeparator";

const Messages = () => {
  const messagesEndRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const {
    chat,
    auth: { userDetails },
  } = useAppSelector((state) => state);

  const { chosenChatDetails, messages, chosenGroupChatDetails } = chat;

  const sameAuthor = (message, index) => {
    if (index === 0) return false;
    return message.author._id === messages[index - 1].author._id;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (e) => {
    setScrollPosition(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    if (chosenChatDetails) {
      fetchDirectChatHistory({
        receiverUserId: chosenChatDetails.userId,
      });
    }

    if (chosenGroupChatDetails) {
      fetchGroupChatHistory({
        groupChatId: chosenGroupChatDetails.groupId,
      });
    }
  }, [chosenChatDetails, chosenGroupChatDetails]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className="flex flex-col items-center h-[calc(100%-142px)] overflow-y-auto overflow-x-hidden"
      onScroll={handleScroll}
    >
      <MessagesHeader scrollPosition={scrollPosition} />

      <p className="text-[#b9bbbe] mt-4 text-sm">
        {chat.chosenChatDetails?.userId
          ? `This is the beginning of your conversation with ${chat.chosenChatDetails?.username}`
          : "This is the beginning of the conversation with your friends!"}
      </p>

      {messages.map((message, index) => {
        const thisMessageDate = new Date(message.createdAt).toDateString();
        const prevMessageDate =
          index > 0 && new Date(messages[index - 1]?.createdAt).toDateString();

        const isSameDay =
          index > 0 ? thisMessageDate === prevMessageDate : true;

        const incomingMessage = message.author._id !== userDetails._id;

        return (
          <div key={message._id} className="w-[97%]">
            {(!isSameDay || index === 0) && (
              <DateSeparator date={message.createdAt} />
            )}

            <Message
              content={message.content}
              username={message.author.username}
              sameAuthor={sameAuthor(message, index)}
              date={message.createdAt}
              incomingMessage={incomingMessage}
            />
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default Messages;
