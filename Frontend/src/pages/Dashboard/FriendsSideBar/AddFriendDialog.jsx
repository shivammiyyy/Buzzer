import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { inviteFriend } from "../../../actions/friendActions";
import { validateMail } from "../../../utils/validators";

const AddFriendDialog = ({ isDialogOpen, closeDialogHandler }) => {
  const [email, setEmail] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const dispatch = useDispatch();

  const handleCloseDialog = () => {
    closeDialogHandler();
    setEmail("");
  };

  const handleClick = () => {
    dispatch(inviteFriend(email, handleCloseDialog));
  };

  useEffect(() => {
    setIsFormValid(validateMail(email));
  }, [email]);

  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-[#2f3136] text-white rounded-lg shadow-lg w-[90%] max-w-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Invite a Friend</h2>
          <p className="text-sm text-gray-300 mt-1">
            Enter email address of the friend you'd like to invite.
          </p>
        </div>

        <div className="flex flex-col space-y-2 w-full mb-4">
          <label className="uppercase text-sm font-semibold text-gray-400">
            Invite your friend
          </label>
          <input
            type="email"
            className="h-10 rounded px-2 bg-[#35393f] text-white border border-black outline-none"
            placeholder="Enter email of your friend"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCloseDialog}
            className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white text-sm"
          >
            Cancel
          </button>
          <button
            disabled={!isFormValid}
            onClick={handleClick}
            className={`${
              isFormValid ? "bg-[#5865F2] hover:bg-[#4752c4]" : "bg-[#5865F2] opacity-50 cursor-not-allowed"
            } px-6 py-2 rounded text-white text-sm font-medium`}
          >
            Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFriendDialog;
