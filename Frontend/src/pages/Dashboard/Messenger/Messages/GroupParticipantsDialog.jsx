import React from "react";
import Avatar from "../../../../components/Avatar";

const GroupParticipantsDialog = ({
  isDialogOpen,
  closeDialogHandler,
  groupDetails,
  currentUserId,
}) => {
  if (!isDialogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{groupDetails.groupName}</h2>
          <button
            onClick={closeDialogHandler}
            className="text-gray-400 hover:text-white text-xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4">
            {groupDetails.participants.length} {" "}
            {groupDetails.participants.length > 1
              ? "Participants"
              : "Participant"}
          </p>
          <ul>
            {groupDetails.participants.map((participant) => {
              const isYou = participant._id === currentUserId;
              const isAdmin = participant._id === groupDetails.admin._id;

              return (
                <li
                  key={participant._id}
                  className="flex items-start space-x-3 py-2 border-b border-gray-700"
                >
                  <Avatar username={participant.username} />
                  <div>
                    <p className="font-semibold">
                      {participant.username} {isYou && "(You)"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {participant.email}
                      {isAdmin && " — Group Admin"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GroupParticipantsDialog;
