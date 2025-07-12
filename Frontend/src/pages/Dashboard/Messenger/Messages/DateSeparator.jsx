import React from "react";

const DateSeparator = ({ date }) => {
  return (
    <div className="relative w-[95%] h-px bg-gray-400 my-5">
      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#36393f] text-gray-400 px-2 text-sm">
        {new Date(date).toDateString()}
      </span>
    </div>
  );
};

export default DateSeparator;
