import React from "react";
import { useAppSelector } from "../../../../store";
import GroupChatListItem from "./GroupChatListItem";

const GroupChatList = () => {
  const { groupChatList } = useAppSelector((state) => state.friends);

  return (
    <div className="flex-grow w-full my-5">
      {groupChatList.map((chat) => (
        <GroupChatListItem chat={chat} key={chat.groupId} />
      ))}
    </div>
  );
};

export default GroupChatList;
