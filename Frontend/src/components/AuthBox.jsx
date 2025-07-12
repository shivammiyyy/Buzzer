import React from "react";

const AuthBox = ({ children }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#5865F2]">
      <div className="max-w-[700px] w-[85%] bg-[#36393f] rounded-md shadow-lg flex flex-col p-6">
        {children}
      </div>
    </div>
  );
};

export default AuthBox;
