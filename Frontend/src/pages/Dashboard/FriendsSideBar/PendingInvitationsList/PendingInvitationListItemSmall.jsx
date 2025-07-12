import React, { useState, useRef, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import InvitationDecisionButtons from "./InvitationDecisionButtons";

const PendingInvitationListItemSmall = ({ username, invitationId }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleToggleMenu = () => {
    setOpen(!open);
  };

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <div
        onClick={handleToggleMenu}
        className="w-full h-[42px] mt-2 flex items-center justify-between cursor-pointer px-2 hover:bg-gray-700 transition-colors rounded"
      >
        <p className="text-[#8e9297] font-bold">{username}</p>
      </div>

      {open && (
        <div
          ref={menuRef}
          className="absolute z-50 mt-1 bg-white rounded shadow-lg p-2 right-0 w-36"
        >
          <InvitationDecisionButtons color="#8e9297" invitationId={invitationId} />
        </div>
      )}
    </div>
  );
};

export default PendingInvitationListItemSmall;
