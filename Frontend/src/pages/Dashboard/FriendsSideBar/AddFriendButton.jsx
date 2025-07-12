import React, { useState } from "react";
import AddFriendDialog from "./AddFriendDialog";

const AddFriendButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenAddFriendDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseAddFriendDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenAddFriendDialog}
        className="bg-[#3ba55d] text-white font-medium text-sm w-[120px] h-[30px] rounded-md hover:opacity-90 transition duration-200"
      >
        Add friend
      </button>

      <AddFriendDialog
        isDialogOpen={isDialogOpen}
        closeDialogHandler={handleCloseAddFriendDialog}
      />
    </>
  );
};

export default AddFriendButton;
