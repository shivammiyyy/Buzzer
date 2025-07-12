import React from "react";
import Avatar from "../../../components/Avatar";

const RoomParticipantsDialog = ({
    isDialogOpen,
    closeDialogHandler,
    roomDetails,
    currentUserId,
}) => {
    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-bold">
                        {roomDetails.roomCreator.username}'s Room
                    </h2>
                </div>

                <div className="px-6 py-2">
                    <p className="text-sm text-gray-700 mb-3">
                        {roomDetails.participants.length}{" "}
                        {roomDetails.participants.length > 1
                            ? "Participants"
                            : "Participant"}
                    </p>

                    <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
                        {roomDetails.participants.map((participant) => (
                            <li key={participant.userId} className="flex items-center py-3">
                                <div className="mr-4">
                                    <Avatar username={participant.username} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">
                                        {participant.username}{" "}
                                        {participant.userId === currentUserId && "(You)"}
                                    </span>
                                    {participant.userId ===
                                        roomDetails.roomCreator.userId && (
                                        <span className="text-xs text-gray-500">Host</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="px-6 py-3 border-t flex justify-end">
                    <button
                        onClick={closeDialogHandler}
                        className="px-4 py-2 bg-[#5865F2] text-white rounded hover:bg-[#4752c4] transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomParticipantsDialog;
