import React from "react";
import { Users2 } from "lucide-react"; // or use Heroicons/Feather/Tabler

const MainPageButton = () => {
  return (
    <button
      className="w-12 h-12 mt-14 p-0 min-w-0 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition duration-200 flex items-center justify-center"
    >
      <Users2 size={24} />
    </button>
  );
};

export default MainPageButton;
