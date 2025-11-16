import React from "react";
import { useNavigate } from "react-router-dom";

const Webhook: React.FC = () => {
  // Hardcoded as requested
  const basicId = "@061xkxnm";   // your OA basic ID
  const eventCode = "DEV";
  const qrcode = "A001";

  // 1) Add OA (follow)
  // LINE’s “add friend / open profile” scheme:
  // - If you encode '@' as %40 it's valid.
  // - This opens the OA profile (user can tap Add).
  const addOaUrl = `https://line.me/R/ti/p/${encodeURIComponent(basicId)}`;

  // 2) Open chat with prefilled text (optional PoC)
  // The text will appear in the composer; the user must press Send.
  const payload = `event_code=${eventCode}&qrcode=${qrcode}`;
  const deepLink = `https://line.me/R/oaMessage/${encodeURIComponent(
    basicId
  )}/?${encodeURIComponent(payload)}`;

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-3 text-gray-900">LINE OA – Simple Test</h1>

        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = addOaUrl)}
            className="w-full px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            Add LINE OA
          </button>

          <button
            onClick={() => (window.location.href = deepLink)}
            className="w-full px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition"
          >
            Open chat with payload (DEV / A001)
          </button>

          <div className="text-left mt-6">
            <p className="text-xs text-gray-500">
              • When the user **follows** your OA, your backend webhook replies with a link to
              <span className="font-mono"> /demo/webhook/line/ResponseURL</span> and includes
              <span className="font-mono"> ?user_id=...</span>.<br />
              • Tap that link inside LINE to land on the page below.
            </p>
          </div>

          <button
            onClick={() => navigate("/demo/webhook/line/ResponseURL")}
            className="mt-2 w-full px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Open ResponseURL (no params)
          </button>
        </div>

        <div className="mt-6 text-left">
          <p className="text-xs text-gray-500">
            Payload preview:&nbsp;
            <span className="font-mono break-all">{payload}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Webhook;
