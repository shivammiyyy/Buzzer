import React, { useRef } from "react";
import { useAppSelector } from "../../../../store";
import { callRequest } from "../../../../socket/socketConnection";
import ChatDropDown from "./ChatDropDown";
import Avatar from "../../../../components/Avatar";
import { PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";

const MessagesHeader = ({ scrollPosition }) => {
  const navRef = useRef(null);
  const navPosition = navRef.current?.getBoundingClientRect().top;

  const {
    auth: { userDetails },
    chat: { chosenChatDetails },
    room: { isUserInRoom },
  } = useAppSelector((state) => state);

  const navActiveStyle =
    scrollPosition >= navPosition
      ? "bg-[#202225]"
      : "bg-transparent";

  return (
    <div
      ref={navRef}
      className={`w-full sticky top-0 right-0 px-4 py-3 rounded-b-[30px] z-20 transition-all duration-300 flex justify-end items-center ${navActiveStyle}`}
    >
      {chosenChatDetails && (
        <div className="flex items-center gap-4 mr-2">
          <button
            disabled={isUserInRoom}
            className={`p-2 rounded-full hover:bg-[#3ba55d]/20 disabled:opacity-50 transition`}
            onClick={() =>
              callRequest({
                audioOnly: true,
                callerName: userDetails ? userDetails.username : "",
                receiverUserId: chosenChatDetails?.userId,
              })
            }
          >
            <PhoneIcon className="h-5 w-5 text-white" />
          </button>

          <button
            disabled={isUserInRoom}
            className={`p-2 rounded-full hover:bg-[#3ba55d]/20 disabled:opacity-50 transition`}
            onClick={() =>
              callRequest({
                audioOnly: false,
                callerName: userDetails ? userDetails.username : "",
                receiverUserId: chosenChatDetails?.userId,
              })
            }
          >
            <VideoCameraIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      )}

      <ChatDropDown />
    </div>
  );
};

export default MessagesHeader;
