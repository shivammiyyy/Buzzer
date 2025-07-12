import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../../store";
import { addMembersToGroupAction } from "../../../../actions/groupChatActions";

const AddMembersToGroupDialog = ({ isDialogOpen, closeDialogHandler }) => {
  const {
    friends: { friends },
    chat: { chosenGroupChatDetails },
  } = useAppSelector((state) => state);

  const currentGroupMembers = chosenGroupChatDetails?.participants.map(
    (p) => p._id.toString()
  );

  const [friendIds, setFriendIds] = useState(currentGroupMembers || []);

  const dispatch = useDispatch();

  const handleSelectChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFriendIds(selected);
  };

  const handleAddMembers = () => {
    dispatch(
      addMembersToGroupAction(
        {
          friendIds,
          groupChatId: chosenGroupChatDetails?.groupId,
        },
        closeDialogHandler
      )
    );
  };

  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-[#2f3136] w-[90%] max-w-md rounded-lg p-6 text-white shadow-xl">
        <h2 className="text-xl font-semibold mb-3">
          Add friends to "{chosenGroupChatDetails?.groupName}" group
        </h2>

        <p className="text-sm mb-4 text-gray-300">Select friends to add:</p>

        <select
          multiple
          value={friendIds}
          onChange={handleSelectChange}
          className="w-full h-40 bg-[#36393f] border border-gray-600 rounded-md p-2 text-white"
        >
          {friends.map((friend) => (
            <option key={friend.id} value={friend.id}>
              {friend.username}
            </option>
          ))}
        </select>

        <div className="flex justify-end mt-6">
          <button
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md mr-2"
            onClick={closeDialogHandler}
          >
            Cancel
          </button>
          <button
            className="bg-[#5865F2] hover:bg-[#4752c4] px-4 py-2 rounded-md"
            disabled={friendIds.length === 0}
            onClick={handleAddMembers}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembersToGroupDialog;
