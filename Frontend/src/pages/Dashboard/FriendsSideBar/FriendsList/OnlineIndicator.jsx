import React from "react";

const OnlineIndicator = () => {
  return (
    <div className="text-[#3ba55d] flex items-center absolute right-[5px]">
      <svg
        className="w-4 h-4 fill-current"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="8" />
      </svg>
    </div>
  );
};

export default OnlineIndicator;
