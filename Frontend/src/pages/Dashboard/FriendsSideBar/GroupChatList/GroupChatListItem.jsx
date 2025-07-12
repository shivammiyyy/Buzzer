import React from "react";
import { useDispatch } from "react-redux";
import { setChosenGroupChatDetails } from "../../../../actions/chatActions";
import { useAppSelector } from "../../../../store";



const GroupChatListItem = ({ chat }) => {
  const dispatch = useDispatch();
  const { chosenGroupChatDetails } = useAppSelector((state) => state.chat);
  const isChatActive = chosenGroupChatDetails?.groupId === chat.groupId;

  const handleSelectChat = () => {
    dispatch(setChosenGroupChatDetails(chat));
  };

  return (
    <div className="w-full mt-4 group">
      <button
        onClick={handleSelectChat}
        className={`w-full h-[42px] flex items-center justify-start px-3 rounded 
          text-black relative transition-all duration-200 ${
            isChatActive ? "bg-[#36393f]" : "hover:bg-[#2f3136]"
          }`}
      >
        <div className="flex flex-col items-start justify-center">
          <p className="ml-2 font-bold text-[#8e9297] text-sm truncate max-w-[220px]">
            {chat.groupName}
          </p>
        </div>
      </button>
    </div>
  );
};

export default GroupChatListItem;
