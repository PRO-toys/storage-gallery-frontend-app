// src/components/button/ButtonLineConnect.tsx
import React from "react";

interface ButtonLineConnectProps {
  /** Backend URL to hit (e.g. http://127.0.0.1:8000/webhook-line/connect) */
  backendUrl?: string;
  /** Optional extra Tailwind classes */
  className?: string;
}

const ButtonLineConnect: React.FC<ButtonLineConnectProps> = ({
  backendUrl = "http://127.0.0.1:8000/webhook-line/connect",
  className = "",
}) => {
  const handleClick = async () => {
    try {
      await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Line connect PoC" }),
      });
      alert("Posted to webhook ✅");
    } catch (error) {
      console.error("Error posting to webhook:", error);
      alert("Failed to post ❌");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-3 rounded-lg bg-[#06C755] text-white font-semibold shadow-md hover:opacity-90 active:opacity-100 transition ${className}`}
    >
      Connect LINE OA
    </button>
  );
};

export default ButtonLineConnect;
