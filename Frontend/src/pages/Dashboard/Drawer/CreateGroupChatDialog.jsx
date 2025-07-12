import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createGroupChatAction } from "../../../actions/groupChatActions";
import { validateGroupName } from "../../../utils/validators";

const CreateGroupChatDialog = ({ isDialogOpen, closeDialogHandler }) => {
  const [name, setName] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const dispatch = useDispatch();

  const handleCloseDialog = () => {
    closeDialogHandler();
    setName("");
  };

  const handleClick = () => {
    dispatch(createGroupChatAction(name, handleCloseDialog));
  };

  useEffect(() => {
    setIsFormValid(validateGroupName(name));
  }, [name]);

  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#2f3136] rounded-xl shadow-lg w-[90%] max-w-md p-6">
        <h2 className="text-xl font-bold text-white mb-2">Create a Group Chat</h2>
        <p className="text-gray-300 mb-4">Enter name of the group</p>

        <div className="w-full flex flex-col gap-2">
          <label className="uppercase text-sm font-semibold text-gray-400">
            Create a Group
          </label>
          <input
            type="text"
            className="h-10 px-3 rounded-md border border-gray-600 bg-[#35393f] text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter a group name."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            disabled={!isFormValid}
            onClick={handleClick}
            className={`w-full h-10 text-white font-medium rounded-md transition ${
              isFormValid ? "bg-indigo-600 hover:bg-indigo-500" : "bg-indigo-600 opacity-50 cursor-not-allowed"
            }`}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupChatDialog;
