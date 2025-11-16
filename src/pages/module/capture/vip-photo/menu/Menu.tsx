// src/pages/module/capture/vip-photo/menu/Menu.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

import img1 from "../../../../../assets/images/module/capture/vip-photo/menu/1.jpg";
import img2 from "../../../../../assets/images/module/capture/vip-photo/menu/2.jpg";
import img3 from "../../../../../assets/images/module/capture/vip-photo/menu/3.jpg";

type MenuItem = {
  key: "mode1" | "mode2" | "mode3";
  title: string;
  desc: string;
  emoji: string;
  badge: string;
  img: string;
  /** Numeric mode value to pass via router state for queue.PARAM_1 */
  mode: "1" | "2" | "3";
};

const Menu: React.FC = () => {
  const navigate = useNavigate();

  const items: MenuItem[] = [
    {
      key: "mode1",
      title: "Change Background",
      desc: "Take a photo, then use AI to replace the background.",
      emoji: "🖼️",
      badge: "Mode 1",
      img: img1,
      mode: "1",
    },
    {
      key: "mode2",
      title: "Cartoonify Person",
      desc: "Take a photo, then use AI to transform the person into a cartoon.",
      emoji: "🎨",
      badge: "Mode 2",
      img: img2,
      mode: "2",
    },
    {
      key: "mode3",
      title: "Custom Prompt Edit",
      desc: "Take a photo, then use AI with a written prompt to specify changes.",
      emoji: "✍️",
      badge: "Mode 3",
      img: img3,
      mode: "3",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <header className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">VIP Photo — Capture Modes</h1>
            <p className="text-white/80 mt-1 text-sm">Choose how you want to process your photo with AI.</p>
          </div>
        </header>

        {/* Grid of modes */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() =>
                navigate("/module/capture/vip-photo/capture/Page1", { state: { mode: item.mode } })
              }
              className="group text-left rounded-xl bg-white overflow-hidden shadow-md transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {/* Image */}
              <div className="relative w-full">
                <img src={item.img} alt={`${item.title} preview`} loading="lazy" className="block w-full h-auto" />
                <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-700">
                  {item.badge}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.emoji}</span>
                </div>

                <h2 className="mt-3 text-lg font-semibold text-gray-900">{item.title}</h2>
                <p className="mt-1 text-sm text-gray-600">{item.desc}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-purple-700 font-medium">Start →</span>
                  <span className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-3 py-1.5 text-xs text-white transition group-hover:bg-purple-700">
                    Go
                  </span>
                </div>
              </div>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Menu;
