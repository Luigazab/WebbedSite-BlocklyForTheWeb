import { useState } from "react";

export default function SwitchButton({activeTab, setActiveTab = "initial"}) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[1%] z-10">
      <div className="flex bg-gray-200 rounded p-1 w-48 shadow">
        <button
          onClick={() => setActiveTab("initial")}
          className={`flex-1 text-sm font-semibold py-2 rounded transition-colors!
            ${activeTab === "initial" 
              ? "bg-gray-700 text-white" 
              : "text-gray-600 hover:text-gray-800"}`}
        >
          Initial
        </button>

        <button
          onClick={() => setActiveTab("expected")}
          className={`flex-1 text-sm font-semibold py-2 rounded transition-colors!
            ${activeTab === "expected" 
              ? "bg-gray-700 text-white" 
              : "text-gray-600 hover:text-gray-800"}`}
        >
          Expected
        </button>
      </div>
    </div>
  );
}
