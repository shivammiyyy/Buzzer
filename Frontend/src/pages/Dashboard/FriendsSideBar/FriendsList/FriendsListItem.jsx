import React from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../../store";
import { setChosenChatDetails } from "../../../../actions/chatActions";
import Avatar from "../../../../components/Avatar";
import OnlineIndicator from "./OnlineIndicator";



const FriendsListItem = ({
  id,
  username,
  email,
  isOnline,
}) => {
  const dispatch = useDispatch();
  const { chosenChatDetails, typing } = useAppSelector((state) => state.chat);

  const isTyping = typing.find((item) => item.userId === id);
  const isFriendTyping =
    isTyping && isTyping.typing && id !== chosenChatDetails?.userId;
  const isChatActive = chosenChatDetails?.userId === id;

  const handleClick = () => {
    dispatch(setChosenChatDetails({ userId: id, username }));
  };

  return (
    <div
      onClick={handleClick}
      className={`w-full h-[42px] mt-[15px] flex items-center justify-start px-2 cursor-pointer transition-all rounded-md relative ${
        isChatActive ? "bg-[#36393f]" : "hover:bg-[#2f3136]"
      }`}
      title={email}
    >
      <div className="hidden sm:block mr-2">
        <Avatar username={username} />
      </div>
      <div className="flex flex-col justify-center">
        <p className="ml-[7px] font-bold text-[#8e9297] text-sm">{username}</p>
        {isFriendTyping && (
          <p className="ml-[7px] text-[#3ba55d] font-medium text-[15px]">
            typing.....
          </p>
        )}
      </div>
      {isOnline && <OnlineIndicator />}
    </div>
  );
};

export default FriendsListItem;
