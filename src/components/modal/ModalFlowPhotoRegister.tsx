import React, { useEffect, useRef, useState } from "react";
import axios, { AxiosInstance } from "axios";

const MODULE_URL = (import.meta.env.VITE_MODULE_URL as string) || "http://127.0.0.1:5001";
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || "http://127.0.0.1:8000";

const PROMO_FLAG_RAW =
  (import.meta.env.VITE_IS_GIVE_PROMOTION_CODE as string) ||
  (import.meta.env.IS_GIVE_PROMOTION_CODE as string) ||
  "OFF";
const PROMO_ENABLED = String(PROMO_FLAG_RAW).toUpperCase() === "ON";

const PRINT_MODE_RAW = (import.meta.env.VITE_PRINT_MODE as string) || "OFF";
const PRINT_ENABLED = String(PRINT_MODE_RAW).toUpperCase() === "ON";

const moduleApi: AxiosInstance = axios.create({ baseURL: `${MODULE_URL}/api`, timeout: 20000 });
const backendApi: AxiosInstance = axios.create({ baseURL: `${BACKEND_URL}/api`, timeout: 20000 });

const API = {
  MANAGE_CLEAR_PATH: "/manage/clear-path",
  CAPTURE_MAKE_INPUT: "/capture/make-input",
  GALLERY_GEN_QR: "/gallery/generate/qrcode",
  RENDER_PHOTO_REGISTER: "/render/photo-register/1",
  RENDER_DRAW_TEXT: "/render/draw-text",
  GALLERY_PRE_UPLOAD: "/gallery/upload/pre-upload",
  GALLERY_UPLOAD: "/gallery/upload",
  PRINTER_PRE: "/printer/pre-print",
  PRINTER_PRINT_WIN: "/printer/print/windows",
} as const;

const BACKEND = {
  FIRST_AVAILABLE_PROMO: "/role/user/search-data/search-first-available-promotion-code",
  SEARCH_PERSON_BY_PHONE: "/role/user/search-data/search-person-by-phone",
  UPDATE_PROMO_BY_CODE: "/role/user/update-data/update-promotion-code-by-code",
} as const;

export type PromotionCode = {
  id: number;
  company_id: number | null;
  person_id: number | null;
  code: string | null;
  description?: string | null;
  discount_value?: string | number | null;
  discount_type?: "percentage" | "amount" | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_redeemed: "0" | "1" | string;
  redeemed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  status: "active" | "inactive" | string;
};

export type Person = {
  id: number;
  company_id?: number | null;
  card_id?: string | null;
  prefix?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  affiliation?: string | null;
  type?: string | null;
  code?: string | null;
  participated_status?: string | null;
  created_at?: string;
  updated_at?: string;
  status?: string | null;
};

export type ConfirmFlowResult = { url: string; qrcode?: string | null };

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
  | "printerPre"
  | "printerPrint"
  | "cleanupCapture";

const STEP_LABELS: Record<StepKey, string> = {
  clear: "Clear work folders",
  makeInput: "Make input from capture",
  genQR: "Generate QR",
  render: "Render photo",
  drawText: "Draw text on image",
  preUpload: "Stage files",
  upload: "Upload to gallery",
  printerPre: "Prepare printer",
  printerPrint: "Print (Windows)",
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

const ModalFlowPhotoRegister: React.FC<ModalFlowPhotoRegisterProps> = ({ isOpen, onClose, onDone }) => {
  const [states, setStates] = useState<Record<StepKey, StepState>>({
    clear: "idle",
    makeInput: "idle",
    genQR: "idle",
    render: "idle",
    drawText: "idle",
    preUpload: "idle",
    upload: "idle",
    printerPre: PRINT_ENABLED ? "idle" : "success",
    printerPrint: PRINT_ENABLED ? "idle" : "success",
    cleanupCapture: "idle",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [qrcode, setQrcode] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const [promoLoading, setPromoLoading] = useState(false);
  const [promoErr, setPromoErr] = useState<string | null>(null);
  const [promo, setPromo] = useState<PromotionCode | null>(null);

  const [phone, setPhone] = useState("");
  const [personLoading, setPersonLoading] = useState(false);
  const [personErr, setPersonErr] = useState<string | null>(null);
  const [person, setPerson] = useState<Person | null>(null);

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
    setStates({
      clear: "idle",
      makeInput: "idle",
      genQR: "idle",
      render: "idle",
      drawText: "idle",
      preUpload: "idle",
      upload: "idle",
      printerPre: PRINT_ENABLED ? "idle" : "success",
      printerPrint: PRINT_ENABLED ? "idle" : "success",
      cleanupCapture: "idle",
    });
    setErrorMsg(null);
    setRunning(false);
    setQrcode(null);
    setUrl(null);

    setPromo(null);
    setPromoErr(null);
    setPhone("");
    setPerson(null);

    if (PROMO_ENABLED) {
      setPromoLoading(true);
      backendApi
        .post(BACKEND.FIRST_AVAILABLE_PROMO, { status: "active" })
        .then((res) => {
          const exists = !!res?.data?.exists;
          setPromo(exists ? res?.data?.data || null : null);
          if (!exists) setPromoErr("No available promotion code.");
        })
        .catch((e) => setPromoErr(e?.response?.data?.message || "Failed to load promotion code."))
        .finally(() => setPromoLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!PROMO_ENABLED) return;
    setPersonErr(null);
    setPerson(null);

    const trimmed = phone.trim();
    if (!trimmed) return;

    const t = setTimeout(async () => {
      setPersonLoading(true);
      try {
        const res = await backendApi.post(BACKEND.SEARCH_PERSON_BY_PHONE, { phone: trimmed, status: "active" });
        const exists = !!res?.data?.exists;
        setPerson(exists ? res?.data?.data || null : null);
        if (!exists) setPersonErr("No person matched this phone.");
      } catch (e: any) {
        setPerson(null);
        setPersonErr(e?.response?.data?.message || "Search failed.");
      } finally {
        setPersonLoading(false);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [phone, isOpen]);

  const mark = (key: StepKey, state: StepState) => setStates((s) => ({ ...s, [key]: state }));

  const runAll = async () => {
    if (!isOpen || running) return;
    setRunning(true);
    setErrorMsg(null);

    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;

    try {
      log("1/10", STEP_LABELS.clear, "start");
      mark("clear", "running");
      await moduleApi.post<ApiResponse>(API.MANAGE_CLEAR_PATH, { paths: ["public/input", "public/output", "public/temp"] }, { signal: ac.signal as any });
      mark("clear", "success");

      log("2/10", STEP_LABELS.makeInput, "start");
      mark("makeInput", "running");
      await moduleApi.get<ApiResponse>(API.CAPTURE_MAKE_INPUT, { signal: ac.signal as any });
      mark("makeInput", "success");

      log("3/10", STEP_LABELS.genQR, "start");
      mark("genQR", "running");
      const qr = await moduleApi.post<ApiResponse<{ qrcode: string }>>(API.GALLERY_GEN_QR, {}, { signal: ac.signal as any });
      const qrcodeVal = qr.data?.data?.qrcode ?? null;
      setQrcode(qrcodeVal);
      mark("genQR", "success");

      log("4/10", STEP_LABELS.render, "start");
      mark("render", "running");
      await moduleApi.get<ApiResponse>(API.RENDER_PHOTO_REGISTER, { signal: ac.signal as any });
      mark("render", "success");

      log("5/10", STEP_LABELS.drawText, "start");
      mark("drawText", "running");
      await moduleApi.post<ApiResponse>(
        API.RENDER_DRAW_TEXT,
        { text: promo?.code || "AL4G8F", file_name_input: "PrintRenderImage1.jpg", file_name_output: "PrintRenderImage1.jpg" },
        { signal: ac.signal as any }
      );
      mark("drawText", "success");

      log("6/10", STEP_LABELS.preUpload, "start");
      mark("preUpload", "running");
      await moduleApi.post<ApiResponse>(API.GALLERY_PRE_UPLOAD, {}, { signal: ac.signal as any });
      mark("preUpload", "success");

      log("7/10", STEP_LABELS.upload, "start");
      mark("upload", "running");
      const up = await moduleApi.post<ApiResponse<{ url: string }>>(API.GALLERY_UPLOAD, {}, { signal: ac.signal as any });
      const urlVal = up.data?.data?.url;
      if (!urlVal) throw new Error(up.data?.message || "Upload failed");
      setUrl(urlVal);
      mark("upload", "success");

      if (PRINT_ENABLED) {
        log("8/10", STEP_LABELS.printerPre, "start");
        mark("printerPre", "running");
        await moduleApi.post<ApiResponse>(API.PRINTER_PRE, {}, { signal: ac.signal as any });
        mark("printerPre", "success");

        log("9/10", STEP_LABELS.printerPrint, "start");
        mark("printerPrint", "running");
        await moduleApi.post<ApiResponse>(API.PRINTER_PRINT_WIN, {}, { signal: ac.signal as any });
        mark("printerPrint", "success");
      } else {
        mark("printerPre", "success");
        mark("printerPrint", "success");
      }

      log("10/10", STEP_LABELS.cleanupCapture, "start");
      mark("cleanupCapture", "running");
      await moduleApi.post<ApiResponse>(API.MANAGE_CLEAR_PATH, { paths: ["public/capture/all", "public/capture/images"] }, { signal: ac.signal as any });
      mark("cleanupCapture", "success");

      if (PROMO_ENABLED && promo?.code && person?.id) {
        try {
          await backendApi.put(`${BACKEND.UPDATE_PROMO_BY_CODE}/${encodeURIComponent(promo.code)}`, {
            person_id: person.id,
          });
          console.log("[ModalFlow] Promotion code updated with person_id", person.id);
        } catch (e: any) {
          const msg = e?.response?.data?.message || "Failed to update promotion code with person.";
          setErrorMsg((prev) => (prev ? prev + " | " + msg : msg));
        }
      }
    } catch (err: any) {
      if (err?.name === "CanceledError" || err?.message === "canceled") return;
      const msg = err?.response?.data?.message || err?.message || "Unexpected error";
      setErrorMsg(msg);
      const order: StepKey[] = [
        "clear",
        "makeInput",
        "genQR",
        "render",
        "drawText",
        "preUpload",
        "upload",
        "printerPre",
        "printerPrint",
        "cleanupCapture",
      ];
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

  const disabledPromo = !PROMO_ENABLED;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Photo Register — Process</h2>
          <button onClick={handleCloseClick} className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-60" disabled={running}>
            Close
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto min-h-0">
          <div className={`rounded-xl border p-3 relative ${disabledPromo ? "opacity-60" : ""}`} aria-disabled={disabledPromo}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Promotion Code & Recipient</h3>
              {disabledPromo ? (
                <span className="text-[10px] uppercase tracking-wide bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Disabled (IS_GIVE_PROMOTION_CODE=OFF)</span>
              ) : promoLoading ? (
                <span className="text-xs text-gray-500">Loading…</span>
              ) : (
                <button onClick={() => {
                  if (!PROMO_ENABLED) return;
                  setPromoLoading(true);
                  setPromoErr(null);
                  setPromo(null);
                  backendApi
                    .post(BACKEND.FIRST_AVAILABLE_PROMO, { status: "active" })
                    .then((res) => {
                      const exists = !!res?.data?.exists;
                      setPromo(exists ? res?.data?.data || null : null);
                      if (!exists) setPromoErr("No available promotion code.");
                    })
                    .catch((e) => setPromoErr(e?.response?.data?.message || "Failed to load promotion code."))
                    .finally(() => setPromoLoading(false));
                }} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" disabled={promoLoading || running}>
                  Refresh
                </button>
              )}
            </div>

            {promoErr ? (
              <div className="text-sm text-rose-600">{promoErr}</div>
            ) : promo ? (
              <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                <div><span className="font-medium">Code:</span> <span className="font-mono">{promo.code || "-"}</span></div>
                <div><span className="font-medium">Status:</span> {String(promo.status || "-").toLowerCase()}</div>
                {promo.description && <div className="col-span-2"><span className="font-medium">Description:</span> {promo.description}</div>}
                <div><span className="font-medium">Discount:</span> {promo.discount_value ?? "-"}{promo.discount_type === "percentage" ? "%" : promo.discount_type === "amount" ? " (amount)" : ""}</div>
                <div><span className="font-medium">Redeemed:</span> {promo.is_redeemed === "1" ? "Yes" : "No"}</div>
                <div><span className="font-medium">Valid from:</span> {promo.valid_from || "-"}</div>
                <div><span className="font-medium">Valid until:</span> {promo.valid_until || "-"}</div>
                <div className="text-xs text-gray-500"><span className="font-medium">Created:</span> {promo.created_at || "-"}</div>
                <div className="text-xs text-gray-500"><span className="font-medium">Updated:</span> {promo.updated_at || "-"}</div>
              </div>
            ) : (
              !promoLoading && <div className="text-sm text-gray-500">No code available.</div>
            )}

            <div className="mt-4">
              <label className="block text-xs text-gray-600 mb-1">Search person by phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                disabled={running || disabledPromo}
              />
              <div className="mt-2 text-xs text-gray-600">
                {personLoading && <span>Searching…</span>}
                {!personLoading && personErr && <span className="text-rose-600">{personErr}</span>}
              </div>

              {!personLoading && person && (
                <div className="mt-2 rounded-lg border p-3 text-sm">
                  <div className="font-medium">{person.prefix ? `${person.prefix} ` : ""}{person.name}</div>
                  <div className="text-xs text-gray-600">Phone: {person.phone || "-"} • Email: {person.email || "-"}</div>
                  <div className="text-xs text-gray-500">Type: {person.type || "-"} • Code: {person.code || "-"}</div>
                </div>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-500">
              * The promotion code (if available) is drawn on the photo during processing. Linking to the person happens after finishing all steps.
            </div>

            {disabledPromo && <div className="absolute inset-0 rounded-xl pointer-events-none" />}
          </div>

          <div className="space-y-3">
            {(Object.keys(STEP_LABELS) as StepKey[]).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dot state={states[key]} />
                  <span className="text-sm text-gray-800">{STEP_LABELS[key]}</span>
                </div>
                <div className="text-xs text-gray-500 min-w-[110px] text-right">
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
        </div>

        <div className="px-5 py-4 border-t flex items-center justify-end gap-2 shrink-0">
          {running ? (
            <button onClick={() => { abortRef.current?.abort(); setRunning(false); }} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">
              Cancel
            </button>
          ) : (
            <button onClick={runAll} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              Start
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
