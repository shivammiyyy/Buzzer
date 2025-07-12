import React from "react";
import { useDispatch } from "react-redux";
import { FaCheck, FaTimes } from "react-icons/fa"; // Font Awesome icons
import { acceptInvitation, rejectInvitation } from "../../../../actions/friendActions";

const InvitationDecisionButtons = ({ color = "white", invitationId }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => dispatch(acceptInvitation(invitationId))}
        className="text-xl"
        style={{ color }}
      >
        <FaCheck />
      </button>
      <button
        onClick={() => dispatch(rejectInvitation(invitationId))}
        className="text-xl"
        style={{ color }}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default InvitationDecisionButtons;
