// src/pages/module/capture/vip-photo/capture/Page1.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// --- Config & API ---
const MODULE_URL = (import.meta.env.VITE_MODULE_URL as string) || "http://127.0.0.1:5001";
const moduleApi = axios.create({ baseURL: `${MODULE_URL}/api`, timeout: 20000 });

// Use env override if provided (falls back to 5000ms)
const POLL_MS: number = (() => {
  const raw = (import.meta.env.VITE_PHOTOT_REGISTER_POLL_MS as string) || "5000";
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 5000;
})();

const API = {
  CHECK_CAPTURE_IMAGE: "/capture/check-capture-image",
  MOVE_CAPTURE_IMAGE: "/capture/move-capture-image",
  CLEAR_ALL_CAPTURE: "/capture/clear-all-capture",
  MANAGE_CLEAR_PATH: "/manage/clear-path",
  CAPTURE_MAKE_INPUT: "/capture/make-input",
  GALLERY_GEN_QR: "/gallery/generate/qrcode",
  RENDER_VIP_PHOTO_1: "/render/vip-photo/1",
  GALLERY_PRE_UPLOAD: "/gallery/upload/pre-upload",
  GALLERY_UPLOAD: "/gallery/upload",
} as const;

// --- Types ---
type ApiResponse<T = any> = { status: "success" | "error"; message: string; data?: T };
interface CheckData { file_name: string; file_path: string; last_modified: string }
interface MoveData { original_file: string; backup_path: string; new_file_name: string; new_path: string }

// --- Utils ---
const cacheBust = (url: string) => `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
const withTrailing = (p: string) => (p.endsWith("/") ? p : p + "/");

async function clearPaths(paths: string[]) {
  const prefer = paths.map(withTrailing);
  try {
    const res = await moduleApi.post<ApiResponse<Record<string, any>>>(API.MANAGE_CLEAR_PATH, { paths: prefer });
    return res.data;
  } catch {
    const res2 = await moduleApi.post<ApiResponse<Record<string, any>>>(API.MANAGE_CLEAR_PATH, { paths });
    return res2.data;
  }
}

function summarizeClear(data: Record<string, any> | undefined) {
  let files = 0, dirs = 0;
  if (data) {
    for (const k of Object.keys(data)) {
      const v = (data as any)[k] || {};
      files += Number(v.removed_files || 0);
      dirs  += Number(v.removed_dirs || 0);
    }
  }
  return { files, dirs };
}

// --- Page ---
const Page1: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [justMoved, setJustMoved] = useState(false);

  // Default aspect = VERTICAL
  const [aspect, setAspect] = useState<"VERTICAL" | "HORIZONTAL" | "SQUARE">("VERTICAL");
  const ASPECT_CLASS = useMemo(
    () => (aspect === "HORIZONTAL" ? "aspect-[3/2]" : aspect === "SQUARE" ? "aspect-square" : "aspect-[2/3]"),
    [aspect]
  );

  const mountedRef = useRef(false);
  const movingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const inFlightAbortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  // Mount/unmount cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (inFlightAbortRef.current) inFlightAbortRef.current.abort();
    };
  }, []);

  // Poll for capture & move into served folder
  useEffect(() => {
    const tick = async () => {
      if (!mountedRef.current) return;
      if (!polling) return;
      if (document.visibilityState === "hidden") return;
      if (imageUrl) return; // don't poll while previewing
      if (movingRef.current) return;
      if (inFlightRef.current) return;

      inFlightRef.current = true;
      const ac = new AbortController();
      inFlightAbortRef.current?.abort();
      inFlightAbortRef.current = ac;

      try {
        const check = await moduleApi.get<ApiResponse<CheckData>>(API.CHECK_CAPTURE_IMAGE, {
          signal: ac.signal as any,
          timeout: 10000,
        });
        if (check.data?.status !== "success" || !check.data?.data?.file_name) return;

        // ★ IMPORTANT: purge previous moved files so only the latest ends up in /public/capture/images
        await clearPaths(["public/capture/images"]);

        movingRef.current = true;
        try {
          const move = await moduleApi.get<ApiResponse<MoveData>>(API.MOVE_CAPTURE_IMAGE, {
            signal: ac.signal as any,
            timeout: 15000,
          });
          const ok = move.data?.status === "success" && move.data?.data?.new_file_name;
          if (!ok) {
            await Swal.fire("Move failed", move.data?.message || "Unable to move captured image.", "error");
            return;
          }
          const f = (move.data!.data as MoveData).new_file_name;
          const servedUrl = `${MODULE_URL}/resource/capture/images/${encodeURIComponent(f)}`;
          if (!mountedRef.current) return;
          setImageUrl(cacheBust(servedUrl));
          setJustMoved(true);
        } finally {
          movingRef.current = false;
        }
      } catch {
        // suppress polling errors to avoid alert spam
      } finally {
        inFlightRef.current = false;
      }
    };

    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (polling) {
      tick();
      intervalRef.current = window.setInterval(tick, POLL_MS);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [polling, imageUrl]);

  // Confirm -> run processing pipeline in order
  const onConfirmClick = async () => {
    if (!imageUrl || confirming) return;
    setConfirming(true);
    setPolling(false);

    try {
      // 1) clear only input & output FIRST
      const clearIO = await clearPaths(["public/input", "public/output"]);
      if (clearIO.status !== "success") {
        await Swal.fire("Clear failed", clearIO.message || "Could not clear input/output.", "error");
        return;
      }
      const sumIO = summarizeClear(clearIO.data as any);

      // 2) capture -> make input
      const makeRes = await moduleApi.get<ApiResponse>(API.CAPTURE_MAKE_INPUT);
      if (makeRes.data?.status !== "success") {
        await Swal.fire("Make input failed", makeRes.data?.message || "Could not stage captured image.", "error");
        return;
      }

      // 2.5) clear temp AFTER making input (tidy workspace)
      const clearTmp = await clearPaths(["public/temp"]);
      if (clearTmp.status !== "success") {
        await Swal.fire("Clear temp failed", clearTmp.message || "Could not clear temp folder.", "error");
        return;
      }

      // 3) generate qrcode
      const qr = await moduleApi.post<ApiResponse<{ qrcode: string }>>(API.GALLERY_GEN_QR, {});
      if (qr.data?.status !== "success" || !qr.data?.data?.qrcode) {
        await Swal.fire("QR failed", qr.data?.message || "Could not generate QR code.", "error");
        return;
      }

      // 4) render VIP photo mode 1
      const renderRes = await moduleApi.get<ApiResponse>(API.RENDER_VIP_PHOTO_1);
      if (renderRes.data?.status !== "success") {
        await Swal.fire("Render failed", renderRes.data?.message || "Unknown error during render.", "error");
        return;
      }

      // 5) pre-upload (stage files)
      const preRes = await moduleApi.post<ApiResponse>(API.GALLERY_PRE_UPLOAD, {});
      if (preRes.data?.status !== "success") {
        await Swal.fire("Pre-upload failed", preRes.data?.message || "Could not stage files.", "error");
        return;
      }

      // 6) upload to gallery
      const up = await moduleApi.post<ApiResponse<{ url?: string }>>(API.GALLERY_UPLOAD, {});
      if (up.data?.status !== "success" || !up.data?.data?.url) {
        await Swal.fire("Upload failed", up.data?.message || "Unknown error during upload.", "error");
        return;
      }

      const { files: filesIO, dirs: dirsIO } = sumIO;
      const html = `
        <div style="text-align:left">
          <div><b>Upload URL</b>:<br/><code>${up.data.data.url}</code></div>
          <hr/>
          <div><b>Cleared</b> input/output → files: ${filesIO}, dirs: ${dirsIO}</div>
        </div>`;

      await Swal.fire({ icon: "success", title: "Uploaded", html });

      // Reset state to keep the capture loop going
      setImageUrl(null);
      setJustMoved(false);
      setPolling(true);
    } catch (e: any) {
      await Swal.fire("Error", e?.response?.data?.message || e?.message || "Failed to process.", "error");
    } finally {
      setConfirming(false);
    }
  };

  // Retake -> clear capture folders and wait again
  const onRetake = async () => {
    try {
      setPolling(false);
      inFlightAbortRef.current?.abort();
      const clear = await moduleApi.get<ApiResponse>(API.CLEAR_ALL_CAPTURE, { timeout: 12000 });
      if (clear.data?.status !== "success") {
        await Swal.fire("Clear failed", clear.data?.message || "Could not clear capture folders.", "error");
      } else {
        await Swal.fire({ icon: "success", title: "Cleared", text: "Ready for next capture." });
      }
    } catch (e: any) {
      await Swal.fire("Error", e?.response?.data?.message || e?.message || "Failed to clear.", "error");
    } finally {
      if (!mountedRef.current) return;
      setImageUrl(null);
      setJustMoved(false);
      setPolling(true);
    }
  };

  const canConfirm = useMemo(() => Boolean(imageUrl) && !confirming, [imageUrl, confirming]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-4 relative">
        {/* Header row */}
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <h1 className="text-lg font-bold text-gray-800">VIP Photo — Capture</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Aspect:</label>
            <select
              value={aspect}
              onChange={(e) => setAspect(e.target.value as any)}
              className="text-sm rounded-md border px-2 py-1"
            >
              <option value="VERTICAL">VERTICAL (2:3)</option>
              <option value="HORIZONTAL">HORIZONTAL (3:2)</option>
              <option value="SQUARE">SQUARE (1:1)</option>
            </select>
            <button
              onClick={() => window.history.back()}
              className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Info banner when a new file was moved */}
        {justMoved && (
          <div className="mb-3 rounded-lg bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
            New image moved and loaded into preview.
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-gray-200">
          {/* Left: preview */}
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-3">
              Status: <b>{confirming ? "Confirming…" : imageUrl ? "Captured" : polling ? "Waiting…" : "Paused"}</b>
            </div>
            <div className={`relative w-full ${ASPECT_CLASS} overflow-hidden rounded-xl border shadow-md bg-gray-100`}>
              {imageUrl ? (
                <img src={imageUrl} alt="Captured preview" className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                  {movingRef.current ? "Processing…" : "Waiting for capture…"}
                </div>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="p-4 flex flex-col">
            <div className="flex-1" />
            <div className="flex flex-col gap-2">
              <button
                onClick={onConfirmClick}
                disabled={!canConfirm}
                className={`px-6 py-2 rounded-lg text-white ${!canConfirm ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
              >
                {confirming ? "Processing…" : "Confirm"}
              </button>
              <button
                onClick={onRetake}
                disabled={confirming}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-60"
              >
                Retake
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page1;
