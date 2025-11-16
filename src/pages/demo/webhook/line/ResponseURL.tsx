import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResponseURL: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(search);
  const userId = params.get("user_id"); // shown if present

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-3 text-gray-900">LINE – Response</h1>

        {userId ? (
          <div className="mt-4">
            <p className="text-sm text-gray-700">We received your LINE user_id:</p>
            <p className="mt-2 font-mono text-xs break-all bg-gray-100 p-3 rounded">{userId}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            No <span className="font-mono">user_id</span> was provided in the URL.
          </p>
        )}

        <button
          onClick={() => navigate("/demo/webhook/line/Webhook")}
          className="mt-6 px-6 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          Back to Webhook Test
        </button>
      </div>
    </div>
  );
};

export default ResponseURL;
