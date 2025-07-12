import React, { useState } from "react";
import { UserPlus2 } from "lucide-react"; // Replace with your preferred icon lib
import CreateGroupChatDialog from "./CreateGroupChatDialog";

const CreateGroupChatButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenGroupChatDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseGroupChatDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenGroupChatDialog}
        className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition duration-200"
      >
        <UserPlus2 size={24} />
      </button>
      <CreateGroupChatDialog
        isDialogOpen={isDialogOpen}
        closeDialogHandler={handleCloseGroupChatDialog}
      />
    </>
  );
};

export default CreateGroupChatButton;
