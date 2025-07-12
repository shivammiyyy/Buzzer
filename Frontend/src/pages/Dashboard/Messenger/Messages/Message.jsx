import React from "react";
import Avatar from "../../../../components/Avatar";

function formatDate(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutes} ${ampm}`;
}

const Message = ({ content, sameAuthor, username, date, incomingMessage }) => {
  const formattedTime = formatDate(new Date(date));

  // Outgoing Message (Current User)
  if (!incomingMessage) {
    return (
      <div className="w-[99%] flex mt-2">
        <div className="flex flex-col max-w-[50%] ml-auto bg-indigo-600 rounded-xl px-3 py-2">
          <p className="text-white text-base mb-1">{content}</p>
          <p className="text-right text-xs text-gray-300">{formattedTime}</p>
        </div>
      </div>
    );
  }

  // Incoming Message
  return (
    <div className="w-[99%] flex mt-2">
      {!sameAuthor && (
        <div className="w-[60px] flex justify-center items-center">
          <Avatar username={username} />
        </div>
      )}

      <div
        className={`flex flex-col max-w-[50%] bg-gray-100 rounded-xl px-3 py-2 ${
          sameAuthor ? "ml-[60px]" : ""
        }`}
      >
        <p className="text-black text-base mb-1">{content}</p>
        <p className="text-xs text-gray-500">{formattedTime}</p>
      </div>
    </div>
  );
};

export default Message;
