// src/components/modal/ModalFlowPhotoRegister.tsx
import React, { useEffect, useRef, useState } from "react";
import axios, { AxiosInstance } from "axios";

const MODULE_URL = (import.meta.env.VITE_MODULE_URL as string) || "http://127.0.0.1:5001";
const moduleApi: AxiosInstance = axios.create({ baseURL: `${MODULE_URL}/api`, timeout: 20000 });

const API = {
  MANAGE_CLEAR_PATH: "/manage/clear-path",
  CAPTURE_MAKE_INPUT: "/capture/make-input",
  GALLERY_GEN_QR: "/gallery/generate/qrcode",
  RENDER_PHOTO_REGISTER: "/render/photo-register/1",
  RENDER_DRAW_TEXT: "/render/draw-text",
  GALLERY_PRE_UPLOAD: "/gallery/upload/pre-upload",
  GALLERY_UPLOAD: "/gallery/upload",
  // PRINTER_PRE: "/printer/pre-print",
  // PRINTER_PRINT_WIN: "/printer/print/windows",
} as const;

type ConfirmFlowResult = { url: string; qrcode?: string | null };

type ModalFlowPhotoRegisterProps = {
  isOpen: boolean;
  onClose: () => void;
  onDone: (result: ConfirmFlowResult) => void;
  autoStart?: boolean;
};

type ApiResponse<T = any> = { status: "success" | "error"; message: string; data?: T };

type StepKey =
  | "clear"
  | "makeInput"
  | "genQR"
  | "render"
  | "drawText"
  | "preUpload"
  | "upload"
  | "cleanupCapture";

const STEP_LABELS: Record<StepKey, string> = {
  clear: "Clear work folders",
  makeInput: "Make input from capture",
  genQR: "Generate QR",
  render: "Render photo",
  drawText: "Draw text on image",
  preUpload: "Stage files",
  upload: "Upload to gallery",
  cleanupCapture: "Clear capture folders",
};

type StepState = "idle" | "running" | "success" | "error";

function Dot({ state }: { state: StepState }) {
  const cls =
    state === "success"
      ? "bg-emerald-500"
      : state === "running"
      ? "bg-amber-500 animate-pulse"
      : state === "error"
      ? "bg-rose-500"
      : "bg-slate-300";
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${cls}`} />;
}

function SmallSpinner() {
  return <div className="inline-block w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />;
}

const ModalFlowPhotoRegister: React.FC<ModalFlowPhotoRegisterProps> = ({ isOpen, onClose, onDone, autoStart = true }) => {
  const [states, setStates] = useState<Record<StepKey, StepState>>({
    clear: "idle",
    makeInput: "idle",
    genQR: "idle",
    render: "idle",
    drawText: "idle",
    preUpload: "idle",
    upload: "idle",
    cleanupCapture: "idle",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(false);

  const log = (...args: any[]) => console.log("[ModalFlow]", ...args);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setStates({ clear: "idle", makeInput: "idle", genQR: "idle", render: "idle", drawText: "idle", preUpload: "idle", upload: "idle", cleanupCapture: "idle" });
    setErrorMsg(null);
    setRunning(false);
    setQrcode(null);
    setUrl(null);
    if (autoStart) runAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const mark = (key: StepKey, state: StepState) => setStates((s) => ({ ...s, [key]: state }));

  const runAll = async () => {
    if (!isOpen || running) return;
    setRunning(true);
    setErrorMsg(null);

    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;

    try {
      log("1/8", STEP_LABELS.clear, "start");
      mark("clear", "running");
      await moduleApi.post<ApiResponse>(API.MANAGE_CLEAR_PATH, { paths: ["public/input", "public/output", "public/temp"] }, { signal: ac.signal as any });
      mark("clear", "success");
      log("1/8", STEP_LABELS.clear, "ok");

      log("2/8", STEP_LABELS.makeInput, "start");
      mark("makeInput", "running");
      await moduleApi.get<ApiResponse>(API.CAPTURE_MAKE_INPUT, { signal: ac.signal as any });
      mark("makeInput", "success");
      log("2/8", STEP_LABELS.makeInput, "ok");

      log("3/8", STEP_LABELS.genQR, "start");
      mark("genQR", "running");
      const qr = await moduleApi.post<ApiResponse<{ qrcode: string }>>(API.GALLERY_GEN_QR, {}, { signal: ac.signal as any });
      const qrcodeVal = qr.data?.data?.qrcode ?? null;
      setQrcode(qrcodeVal);
      mark("genQR", "success");
      log("3/8", STEP_LABELS.genQR, "ok", qrcodeVal ? { qrcode: qrcodeVal } : undefined);

      log("4/8", STEP_LABELS.render, "start");
      mark("render", "running");
      await moduleApi.get<ApiResponse>(API.RENDER_PHOTO_REGISTER, { signal: ac.signal as any });
      mark("render", "success");
      log("4/8", STEP_LABELS.render, "ok");

      log("5/8", STEP_LABELS.drawText, "start");
      mark("drawText", "running");
      await moduleApi.post<ApiResponse>(
        API.RENDER_DRAW_TEXT,
        {
          text: "AL4G8F",
          file_name_input: "PrintRenderImage1.jpg",
          file_name_output: "PrintRenderImage1.jpg",
        },
        { signal: ac.signal as any }
      );
      mark("drawText", "success");
      log("5/8", STEP_LABELS.drawText, "ok");

      log("6/8", STEP_LABELS.preUpload, "start");
      mark("preUpload", "running");
      await moduleApi.post<ApiResponse>(API.GALLERY_PRE_UPLOAD, {}, { signal: ac.signal as any });
      mark("preUpload", "success");
      log("6/8", STEP_LABELS.preUpload, "ok");

      log("7/8", STEP_LABELS.upload, "start");
      mark("upload", "running");
      const up = await moduleApi.post<ApiResponse<{ url: string }>>(API.GALLERY_UPLOAD, {}, { signal: ac.signal as any });
      const urlVal = up.data?.data?.url;
      if (!urlVal) throw new Error(up.data?.message || "Upload failed");
      setUrl(urlVal);
      mark("upload", "success");
      log("7/8", STEP_LABELS.upload, "ok", { url: urlVal });

      log("8/8", STEP_LABELS.cleanupCapture, "start");
      mark("cleanupCapture", "running");
      await moduleApi.post<ApiResponse>(API.MANAGE_CLEAR_PATH, { paths: ["public/capture/all", "public/capture/images"] }, { signal: ac.signal as any });
      mark("cleanupCapture", "success");
      log("8/8", STEP_LABELS.cleanupCapture, "ok");

      // keep modal open; enable Close button; do not auto-call onDone
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") return;
      const msg = err?.response?.data?.message || err?.message || "Unexpected error";
      setErrorMsg(msg);
      console.error("[ModalFlow] error", msg);
      const order: StepKey[] = ["clear", "makeInput", "genQR", "render", "drawText", "preUpload", "upload", "cleanupCapture"];
      const firstNotSuccess = order.find((k) => states[k] !== "success");
      if (firstNotSuccess) mark(firstNotSuccess, "error");
    } finally {
      setRunning(false);
    }
  };

  const allDone = (Object.keys(STEP_LABELS) as StepKey[]).every((k) => states[k] === "success");

  if (!isOpen) return null;

  const handleCloseClick = () => {
    if (running) return;
    if (allDone && url) onDone({ url, qrcode });
    onClose();
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Processing…</h2>
          <button onClick={handleCloseClick} className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-60" disabled={running}>
            Close
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {(Object.keys(STEP_LABELS) as StepKey[]).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dot state={states[key]} />
                <span className="text-sm text-gray-800">{STEP_LABELS[key]}</span>
              </div>
              <div className="text-xs text-gray-500 min-w-[90px] text-right">
                {states[key] === "running" && (
                  <span className="inline-flex items-center gap-2"><SmallSpinner /> Running</span>
                )}
                {states[key] === "success" && <span>Done</span>}
                {states[key] === "idle" && <span>Pending</span>}
                {states[key] === "error" && <span className="text-rose-600">Error</span>}
              </div>
            </div>
          ))}

          {errorMsg && (
            <div className="mt-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 text-sm">{errorMsg}</div>
          )}

          {qrcode && (
            <div className="mt-1 text-xs text-gray-600">
              QR: <span className="font-mono">{qrcode}</span>
            </div>
          )}
          {url && (
            <div className="mt-1 text-xs text-gray-600">
              URL: <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">{url}</a>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          {running && (
            <button onClick={handleCancel} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
              Cancel
            </button>
          )}

          <button onClick={handleCloseClick} disabled={running} className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:bg-purple-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFlowPhotoRegister;
