import React from "react";
import { FaInbox, FaEnvelope, FaUsers } from "react-icons/fa";

const FriendsTitle = ({ title }) => {
  const renderIcon = () => {
    if (title === "Private Messages") return <FaEnvelope />;
    if (title === "Group Chats" || title === "Active Rooms") return <FaUsers />;
    return <FaInbox />;
  };

  return (
    <div className="uppercase text-[#8e9297] text-sm mt-5 flex items-center gap-2">
      {renderIcon()}
      {title}
    </div>
  );
};

export default FriendsTitle;
