import React from "react";
import InvitationDecisionButtons from "./InvitationDecisionButtons";
import Avatar from "../../../../components/Avatar";
import PendingInvitationListItemSmall from "./PendingInvitationListItemSmall";

const PendingInvitationsListItem = ({ id, username, email }) => {
  return (
    <>
      {/* Large screen version (sm and up) */}
      <div
        className="hidden sm:flex w-full items-center justify-between h-[42px] mt-[10px]"
        title={email}
      >
        <div className="flex items-center gap-2 w-full">
          <Avatar username={username} />
          <p className="font-bold text-gray-400 flex-grow">{username}</p>
          <InvitationDecisionButtons invitationId={id} />
        </div>
      </div>

      {/* Small screen version */}
      <div className="sm:hidden w-full">
        <PendingInvitationListItemSmall username={username} invitationId={id} />
      </div>
    </>
  );
};

export default PendingInvitationsListItem;
