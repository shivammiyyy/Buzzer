import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import AddMembersToGroupDialog from "./AddMembersToGroupDialog";
import GroupParticipantsDialog from "./GroupParticipantsDialog";
import { useAppSelector } from "../../../../store";
import {
  deleteGroupAction,
  leaveGroupAction,
} from "../../../../actions/groupChatActions";
import { removeFriendAction } from "../../../../actions/friendActions";
import { HiDotsVertical } from "react-icons/hi";

const ChatDropDown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const dropdownRef = useRef();

  const {
    chat: { chosenGroupChatDetails, chosenChatDetails },
    auth: { userDetails },
  } = useAppSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleAddMembers = () => {
    setIsDialogOpen(true);
    setIsOpen(false);
  };

  const handleParticipantsOpenDialog = () => {
    setParticipantsDialogOpen(true);
    setIsOpen(false);
  };

  const handleLeaveGroup = () => {
    if (chosenGroupChatDetails) {
      dispatch(
        leaveGroupAction({ groupChatId: chosenGroupChatDetails.groupId })
      );
    }
    setIsOpen(false);
  };

  const handleDeleteGroup = () => {
    if (chosenGroupChatDetails) {
      dispatch(
        deleteGroupAction({
          groupChatId: chosenGroupChatDetails.groupId,
          groupChatName: chosenGroupChatDetails.groupName,
        })
      );
    }
    setIsOpen(false);
  };

  const handleRemoveFriend = () => {
    if (chosenChatDetails) {
      dispatch(
        removeFriendAction({
          friendId: chosenChatDetails.userId,
          friendName: chosenChatDetails.username,
        })
      );
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          className="text-white p-2 focus:outline-none"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <HiDotsVertical size={20} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-10 z-50 w-48 bg-white text-sm rounded-md shadow-lg overflow-hidden border border-gray-200">
            {chosenGroupChatDetails &&
              (chosenGroupChatDetails.admin._id === userDetails?._id ? (
                <>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleAddMembers}
                  >
                    Add Members
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleDeleteGroup}
                  >
                    Delete Group
                  </div>
                </>
              ) : (
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLeaveGroup}
                >
                  Leave Group
                </div>
              ))}

            {chosenGroupChatDetails && (
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleParticipantsOpenDialog}
              >
                View Participants ({chosenGroupChatDetails.participants.length})
              </div>
            )}

            {chosenChatDetails && (
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleRemoveFriend}
              >
                Remove Friend
              </div>
            )}
          </div>
        )}
      </div>

      {chosenGroupChatDetails && userDetails && (
        <>
          <AddMembersToGroupDialog
            isDialogOpen={isDialogOpen}
            closeDialogHandler={() => setIsDialogOpen(false)}
          />
          <GroupParticipantsDialog
            isDialogOpen={participantsDialogOpen}
            closeDialogHandler={() => setParticipantsDialogOpen(false)}
            groupDetails={chosenGroupChatDetails}
            currentUserId={userDetails._id}
          />
        </>
      )}
    </>
  );
};

export default ChatDropDown;
