import React, { useState } from "react";
import VideoChat from "../../../components/VideoChat";
import IncomingCall from "../../../components/IncomingCall";
import Messenger from "../Messenger/Messenger";
import AddFriendButton from "../FriendsSideBar/AddFriendButton";
import FriendsList from "../FriendsSideBar/FriendsList/FriendsList";
import FriendsTitle from "../FriendsSideBar/FriendsTitle";
import PendingInvitationsList from "../FriendsSideBar/PendingInvitationsList/PendingInvitationsList";
import DropDownMenu from "./DropdownMenu";
import CreateRoomButton from "./CreateRoomButton";
import CreateGroupChatButton from "./CreateGroupChatButton";
import GroupChatList from "../FriendsSideBar/GroupChatList";
import ActiveRooms from "../ActiveRooms";
import { HiMenu } from "react-icons/hi";

const drawerWidth = 240;

export default function ResponsiveDrawer({ localStream, isUserInRoom }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div className="bg-[#2F3136] h-full overflow-y-auto px-4 py-3 w-full">
      <div className="flex items-center justify-between mb-3">
        <AddFriendButton />
        <DropDownMenu />
      </div>
      <hr className="border-gray-600" />

      <div className="flex items-center justify-around my-3">
        <CreateGroupChatButton />
        <CreateRoomButton isUserInRoom={isUserInRoom} />
      </div>

      <FriendsTitle title="Active Rooms" />
      <ActiveRooms />
      <hr className="border-gray-600" />

      <FriendsTitle title="Private Messages" />
      <FriendsList />
      <hr className="border-gray-600" />

      <FriendsTitle title="Group Chats" />
      <GroupChatList />
      <hr className="border-gray-600" />

      <FriendsTitle title="Invitations" />
      <PendingInvitationsList />
      <hr className="border-gray-600" />
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Menu Icon (for mobile) */}
      <button
        onClick={handleDrawerToggle}
        className="fixed top-2.5 left-4 z-[1000] sm:hidden text-white"
      >
        <HiMenu size={28} />
      </button>

      {/* Sidebar (Mobile) */}
      <div
        className={`fixed z-50 bg-[#2F3136] w-[240px] h-full transition-transform duration-300 ease-in-out sm:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {drawer}
      </div>

      {/* Sidebar (Desktop) */}
      <div className="hidden sm:block w-[240px] shrink-0 bg-[#2F3136]">
        {drawer}
      </div>

      {/* Main Content */}
      <main
        className="flex-grow flex bg-red-500"
        style={{
          width: `calc(100vw - ${drawerWidth}px)`,
        }}
      >
        <Messenger />
        {localStream && <VideoChat />}
        <IncomingCall />
      </main>
    </div>
  );
}
