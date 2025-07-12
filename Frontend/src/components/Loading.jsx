import React from "react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center w-full h-screen bg-[#2F3136]">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
