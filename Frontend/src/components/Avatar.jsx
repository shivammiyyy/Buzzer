import React from "react";

const Avatar = ({ username, large }) => {
  const size = large ? "w-20 h-20 text-xl" : "w-8 h-8 text-sm";

  return (
    <div
      className={`bg-[#5865f2] rounded-full flex items-center justify-center text-white font-medium ${size}`}
    >
      {username?.substring(0, 2)}
    </div>
  );
};

export default Avatar;
