// src/pages/module/capture/photo-register/menu/Menu.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import hero from "../../../../../assets/images/module/capture/menu/1.jpg"; // 1800x1200

const Menu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-6">
      {/* Centered card */}
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Hero image (keeps 3:2 aspect from 1800x1200) */}
        <div className="w-full aspect-[3/2]">
          <img
            src={hero}
            alt="Photo registration and card print preview"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Photo Registration & Card Print</h1>
          <p className="mt-1 text-gray-600">
            For registered attendees: take a photo to print your name/contact card.
            The system can include up to two promotion codes on the card.
          </p>

          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={() => navigate("/module/capture/photo-register/capture/Page1")}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <span className="text-lg">📸</span>
              <span>Start Capture & Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
