import React from "react";
import FriendsListItem from "./FriendsListItem";
import { useAppSelector } from "../../../../store";

const FriendsList = () => {
  const { friends, onlineUsers } = useAppSelector((state) => state.friends);

  const modifiedFriends = friends.map((friend) => {
    const isOnline = onlineUsers.find((user) => user.userId === friend.id);
    return { ...friend, isOnline: !!isOnline };
  });

  return (
    <div className="w-full flex-grow my-5">
      {modifiedFriends.map((f) => (
        <FriendsListItem
          username={f.username}
          id={f.id}
          key={f.id}
          isOnline={f.isOnline}
          email={f.email}
        />
      ))}
    </div>
  );
};

export default FriendsList;
