// src/pages/role/user/demo/MultiChannel.tsx
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

// Quadrant type
type Quadrant = "A" | "B" | "C" | "D";

const MultiChannel: React.FC = () => {
  // Get videoId from URL params
  const { videoId } = useParams<{ videoId?: string }>();
  const [active, setActive] = useState<Quadrant>("A");

  // Default video if none provided
  const defaultVideoId = "406dfn99RAQ";
  const finalVideoId = videoId || defaultVideoId;

  // Build the embed URL
  const src = useMemo(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      modestbranding: "1",
      playsinline: "1",
      rel: "0",
    }).toString();
    return `https://www.youtube.com/embed/${finalVideoId}?${params}`;
  }, [finalVideoId]);

  // Map A–D to quadrants
  const transformByQuad: Record<Quadrant, string> = {
    A: "translate(0%, 0%)",       // Top-Left
    B: "translate(-50%, 0%)",     // Top-Right
    C: "translate(0%, -50%)",     // Bottom-Left
    D: "translate(-50%, -50%)",   // Bottom-Right
  };

  return (
    <div className="min-h-screen flex flex-col gap-6 items-center justify-center p-2 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-5xl">
        <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold mb-3 text-center px-2">
          PRO-toys Live — Multi-Channel View
        </h1>

        {/* Cropped player viewport */}
        <div
          className="relative w-full rounded-md sm:rounded-lg md:rounded-2xl overflow-hidden shadow-md sm:shadow-xl md:shadow-2xl bg-black aspect-video"
          onContextMenu={(e) => e.preventDefault()}
        >
          <iframe
            src={src}
            title="YouTube live"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            draggable={false}
            className="absolute top-0 left-0 border-0 pointer-events-none select-none"
            style={{
              width: "200%",
              height: "200%",
              transform: transformByQuad[active],
              transformOrigin: "top left",
            }}
          />
        </div>

        {/* Buttons centered below */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4">
          {(["A", "B", "C", "D"] as Quadrant[]).map((q) => (
            <button
              key={q}
              onClick={() => setActive(q)}
              className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-md sm:rounded-lg md:rounded-xl text-sm sm:text-base font-bold shadow transition-colors duration-200
                ${active === q ? "bg-white text-blue-600" : "bg-black/40 text-white hover:bg-black/60"}`}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiChannel;
