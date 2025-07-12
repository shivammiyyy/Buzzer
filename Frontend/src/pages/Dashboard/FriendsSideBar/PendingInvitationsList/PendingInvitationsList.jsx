import React from "react";
import PendingInvitationsListItem from "./PendingInvitationsListItem";
import { useAppSelector } from "../../../../store";

const PendingInvitationsList = () => {
  const { pendingInvitations } = useAppSelector((state) => state.friends);

  return (
    <div className="w-full flex flex-col items-center my-2">
      {pendingInvitations.map((invitation) => (
        <PendingInvitationsListItem
          key={invitation._id}
          id={invitation._id}
          username={invitation.senderId.username}
          email={invitation.senderId.email}
        />
      ))}
    </div>
  );
};

export default PendingInvitationsList;
