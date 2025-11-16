// src/pages/module/capture/photo-register/capture/Page1.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import ModalFlowPhotoRegister from "../../../../../components/modal/ModalFlowPhotoRegister";

const MODULE_URL = (import.meta.env.VITE_MODULE_URL as string) || "http://127.0.0.1:5001";

const moduleApi = axios.create({ baseURL: `${MODULE_URL}/api`, timeout: 15000 });

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
};

type ApiResponse<T = any> = { status: "success" | "error"; message: string; data?: T };
interface CheckData { file_name: string; file_path: string; last_modified: string }
interface MoveData { original_file: string; backup_path: string; new_file_name: string; new_path: string }

const cacheBust = (url: string) => `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;

const Page1: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [justMoved, setJustMoved] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const [aspect, setAspect] = useState<"VERTICAL" | "HORIZONTAL" | "SQUARE">("HORIZONTAL");
  const ASPECT_CLASS = useMemo(
    () => (aspect === "HORIZONTAL" ? "aspect-[3/2]" : aspect === "SQUARE" ? "aspect-square" : "aspect-[2/3]"),
    [aspect]
  );

  const mountedRef = useRef(false);
  const movingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const inFlightAbortRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (inFlightAbortRef.current) inFlightAbortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const tick = async () => {
      if (!mountedRef.current) return;
      if (!polling) return;
      if (document.visibilityState === "hidden") return;
      if (imageUrl) return;
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

        movingRef.current = true;
        try {
          const move = await moduleApi.get<ApiResponse<MoveData>>(API.MOVE_CAPTURE_IMAGE, {
            signal: ac.signal as any,
            timeout: 15000,
          });
          const ok = move.data?.status === "success" && move.data?.data?.new_file_name;
          if (!ok) {
            setToast({ type: "error", message: move.data?.message || "Move failed" });
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
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.message === "canceled") return;
        if (!imageUrl) setToast({ type: "info", message: err?.message || "Waiting for capture…" });
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

  const onConfirmClick = () => {
    if (!imageUrl || confirming) return;
    setConfirming(true);
    setPolling(false);
    setShowConfirmModal(true);
  };

  const handleModalClose = () => {
    setShowConfirmModal(false);
    setConfirming(false);
    setPolling(Boolean(imageUrl));
  };

  const handleModalDone = ({ url, qrcode }: { url: string; qrcode?: string | null }) => {
    setShowConfirmModal(false);
    setConfirming(false);
    setToast({ type: "success", message: `Uploaded${qrcode ? ` (${qrcode})` : ""}.` });
    setImageUrl(null);
    setJustMoved(false);
    setPolling(true);
  };

  const onRetake = async () => {
    try {
      setPolling(false);
      inFlightAbortRef.current?.abort();
      await moduleApi.get<ApiResponse>(API.CLEAR_ALL_CAPTURE, { timeout: 12000 });
    } catch {}
    finally {
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
        <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
          <h1 className="text-lg font-bold text-gray-800">Photo Register — Capture</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Aspect:</label>
            <AspectSelect value={aspect} onChange={setAspect} />
            <button onClick={() => window.history.back()} className="px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm">← Back</button>
          </div>
        </div>

        {justMoved && (
          <div className="mb-3 rounded-lg bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">New image moved and loaded into preview.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-gray-200">
          <div className="p-4">
            <div className="text-sm text-gray-600 mb-3">Status: <b>{confirming ? "Confirming…" : imageUrl ? "Captured" : polling ? "Waiting…" : "Paused"}</b></div>
            <div className={`relative w-full ${ASPECT_CLASS} overflow-hidden rounded-xl border shadow-md bg-gray-100`}>
              {imageUrl ? (
                <img src={imageUrl} alt="Captured preview" className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">{movingRef.current ? "Processing…" : "Waiting for capture…"}</div>
              )}
            </div>
          </div>

          <div className="p-4 flex flex-col">
            <div className="flex-1" />
            <div className="flex flex-col gap-2">
              <button onClick={onConfirmClick} disabled={!canConfirm} className={`px-6 py-2 rounded-lg text-white ${!canConfirm ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}>{confirming ? "Confirming…" : "Confirm"}</button>
              <button onClick={onRetake} disabled={confirming} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-60">Retake</button>
            </div>
          </div>
        </div>

        {toast && (
          <div className={`fixed bottom-5 inset-x-0 flex justify-center px-4 z-[1500]`}>
            <div className={`rounded-xl shadow-lg px-4 py-3 text-sm text-white ${
              toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-rose-600" : "bg-slate-700"
            }`}>{toast.message}</div>
          </div>
        )}
      </div>

      <ModalFlowPhotoRegister
        isOpen={showConfirmModal}
        onClose={handleModalClose}
        onDone={handleModalDone}
        /* manual start inside modal; no autoStart prop */
      />
    </div>
  );
};

function AspectSelect({ value, onChange }: { value: "VERTICAL" | "HORIZONTAL" | "SQUARE"; onChange: (v: any) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm rounded-md border px-2 py-1">
      <option value="VERTICAL">VERTICAL (2:3)</option>
      <option value="HORIZONTAL">HORIZONTAL (3:2)</option>
      <option value="SQUARE">SQUARE (1:1)</option>
    </select>
  );
}

export default Page1;
