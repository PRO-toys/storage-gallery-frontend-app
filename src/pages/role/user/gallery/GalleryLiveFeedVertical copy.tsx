import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ModalGrowing from "../../../../components/modal/ModalGrowing";
import SidebarToggleBottom, { ThemeMode } from "../../../../components/sidebar/SidebarToggleBottom";

// ---------- types ----------
type MediaKind = "image" | "video";

interface GalleryRow {
  id: number;
  qrcode: string;
  file_name: string;
  event_type: string;
  event_code: string;
  station_code: string;
  camera_mode: string;
  file_size: string;
  username: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface MediaItem {
  id: number;
  kind: MediaKind;
  mediaUrl: string;
  qrcodeUrl: string | null;
  qrcode: string | null;
  updated_at: string;
  file_name: string;
  station?: string | null;
  camera_mode?: string | null;
  username?: string | null;
}

// ---------- env & utils ----------
const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

const splitEnvList = (v: string | undefined, fb: string[]) =>
  !v || !v.trim() ? fb : v.split(/[|,]/).map(s => s.trim()).filter(Boolean);

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const DEFAULT_IMG_PREFIXES = ["RenderImage", "PrintRenderImage", "image"];
const DEFAULT_QR_PREFIXES = ["qrcode"];
const DEFAULT_VIDEO_EXTS = ["mp4", "webm", "mov"];

const IMG_PREFIXES = splitEnvList(import.meta.env.VITE_ALLOWED_PREFIXES_IMAGES, DEFAULT_IMG_PREFIXES).map(s => s.toLowerCase());
const QR_PREFIXES  = splitEnvList(import.meta.env.VITE_ALLOWED_PREFIXES_QRCODE, DEFAULT_QR_PREFIXES).map(s => s.toLowerCase());
const VIDEO_EXTS   = splitEnvList(import.meta.env.VITE_ALLOWED_EXT_VIDEOS, DEFAULT_VIDEO_EXTS).map(s => s.toLowerCase());

const POLL_MS_RAW = parseInt((import.meta.env.VITE_GALLERY_POLL_MS as string) || "10000", 10);
const POLL_MS = clamp(isNaN(POLL_MS_RAW) ? 10000 : POLL_MS_RAW, 1000, 60000);

const AUTOPLAY_MS_RAW = parseInt((import.meta.env.VITE_GALLERY_LIVE_VERTICAL_AUTOPLAY_MS as string) || "5000", 10);
const AUTOPLAY_MS = clamp(isNaN(AUTOPLAY_MS_RAW) ? 5000 : AUTOPLAY_MS_RAW, 1000, 600000);

const DEFAULT_SHOW_QR = ((import.meta.env.VITE_GALLERY_LIVE_VERTICAL_SHOW_QR as string) || "ON").toUpperCase() === "ON";

const isQrFile = (name: string) => {
  const lower = name.toLowerCase();
  return QR_PREFIXES.some(p => lower === `${p}.jpg` || lower.startsWith(`${p}_`));
};
const isImageByPrefix = (name: string) => {
  const lower = name.toLowerCase();
  return IMG_PREFIXES.some(p => lower.startsWith(p));
};
const isVideoByExt = (name: string) => {
  const lower = name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot < 0) return false;
  const ext = lower.slice(dot + 1);
  return VIDEO_EXTS.includes(ext);
};
const fileUrl = (r: GalleryRow) =>
  `${backendUrl}/storage/gallery/${r.event_code}/${r.qrcode}/${r.file_name}`;

// ---------- component ----------
const GalleryLiveFeedVertical: React.FC = () => {
  const { event_code } = useParams<{ event_code: string }>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [live, setLive] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [index, setIndex] = useState(0);
  const [showEvent, setShowEvent] = useState(true);
  const [showQR, setShowQR] = useState(DEFAULT_SHOW_QR);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // NEW: UI visibility toggles
  const [showTitle, setShowTitle] = useState(true);
  const [showLiveButton, setShowLiveButton] = useState(true);
  const [showAutoplayButton, setShowAutoplayButton] = useState(true);
  const [showRefreshButton, setShowRefreshButton] = useState(true);

  // NEW: theme (light/dark/system)
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => setIsDark(mq.matches);
      handler();
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      setIsDark(theme === "dark");
    }
  }, [theme]);

  // fetch
  const fetchData = async () => {
    if (!event_code) return;
    try {
      setErr(null);
      const res = await axios.get(
        `${backendUrl}/api/role/user/read-data/read-gallery-by-event/${encodeURIComponent(event_code)}`
      );
      if (res.data?.status === "success" && Array.isArray(res.data?.data)) {
        setRows(res.data.data as GalleryRow[]);
      } else {
        setErr(res.data?.message || "Failed to load gallery");
      }
    } catch {
      setErr("Error fetching gallery");
    } finally {
      setLoading(false);
    }
  };

  // init + polling
  useEffect(() => {
    if (!event_code) { setErr("Event code is required"); setLoading(false); return; }
    fetchData();
  }, [event_code]);

  useEffect(() => {
    if (!live || !event_code) return;
    const id = setInterval(fetchData, POLL_MS);
    return () => clearInterval(id);
  }, [live, event_code]);

  // build media list (newest first)
  const media = useMemo<MediaItem[]>(() => {
    if (rows.length === 0) return [];
    const byQr: Record<string, { qrUrl: string | null; items: GalleryRow[] }> = {};

    for (const r of rows) {
      const g = (byQr[r.qrcode] ||= { qrUrl: null, items: [] });
      if (isQrFile(r.file_name)) g.qrUrl = fileUrl(r);
      else g.items.push(r);
    }

    const out: MediaItem[] = [];
    for (const [qr, g] of Object.entries(byQr)) {
      for (const r of g.items) {
        let kind: MediaKind | null = null;
        if (isVideoByExt(r.file_name)) kind = "video";
        else if (isImageByPrefix(r.file_name)) kind = "image";
        if (!kind) continue;
        out.push({
          id: r.id,
          kind,
          mediaUrl: fileUrl(r),
          qrcodeUrl: g.qrUrl || null,
          qrcode: qr || null,
          updated_at: r.updated_at,
          file_name: r.file_name,
          station: r.station_code,
          camera_mode: r.camera_mode,
          username: r.username,
        });
      }
    }

    out.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return out;
  }, [rows]);

  // keep index in range when media changes
  useEffect(() => {
    if (media.length === 0) { setIndex(0); return; }
    setIndex(i => Math.min(i, media.length - 1));
  }, [media.length]);

  // autoplay (one-at-a-time slide)
  useEffect(() => {
    if (!autoplay || media.length === 0) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % media.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [autoplay, media.length]);

  // auto-play/pause the visible video
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (media[index]?.kind === "video") {
      v.play().catch(() => {});
    }
    return () => {
      try { v?.pause(); } catch {}
    };
  }, [index, media]);

  // ---------- render ----------
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80">
        <ModalGrowing />
      </div>
    );
  }
  if (err) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-6">
        {err}
      </div>
    );
  }
  if (media.length === 0) {
    return (
      <div className={isDark ? "min-h-screen bg-slate-950 text-white/80 flex flex-col items-center justify-center gap-3" : "min-h-screen bg-white text-slate-800 flex flex-col items-center justify-center gap-3"}>
        <div className="text-lg">No media yet</div>
        <button
          onClick={fetchData}
          className={isDark ? "px-4 py-2 rounded bg-white/10 hover:bg-white/20 backdrop-blur text-white" : "px-4 py-2 rounded bg-slate-900/5 hover:bg-slate-900/10 text-slate-900"}
        >
          Refresh
        </button>
      </div>
    );
  }

  const m = media[index];

  const pageBase = isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900";
  const cardBase = isDark ? "bg-black ring-white/10" : "bg-white ring-slate-200";
  const headerTitleMuted = isDark ? "text-white/90" : "text-slate-800";
  const headerSubtle = isDark ? "opacity-70" : "text-slate-500";
  const subtleBtn = isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-slate-900/5 hover:bg-slate-900/10 text-slate-900";
  const liveBtnOn  = isDark ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-600 hover:bg-green-700 text-white";
  const liveBtnOff = isDark ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-gray-300 hover:bg-gray-400 text-slate-900";
  const playBtnOn  = isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white";
  const playBtnOff = isDark ? "bg-gray-600 hover:bg-gray-700 text-white" : "bg-gray-300 hover:bg-gray-400 text-slate-900";

  return (
    <div className={`min-h-screen ${pageBase} flex flex-col`}>
      {/* header */}
      <div className="px-4 py-3 flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className={headerTitleMuted}>
          {showTitle && (
            <div className={`text-[11px] uppercase tracking-widest ${headerSubtle}`}>Live Feed (9:16)</div>
          )}
          {showEvent && (
            <div className="text-lg font-semibold">
              Event: <span className="font-mono">{event_code}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showRefreshButton && (
            <button
              onClick={fetchData}
              className={`px-3 py-1.5 rounded text-sm ${subtleBtn}`}
            >
              Refresh
            </button>
          )}
          {showLiveButton && (
            <button
              onClick={() => setLive(v => !v)}
              className={`px-3 py-1.5 rounded text-sm ${live ? liveBtnOn : liveBtnOff}`}
              aria-pressed={live}
              title={live ? `Live ON (every ${POLL_MS}ms)` : "Live OFF"}
            >
              {live ? "Live: ON" : "Live: OFF"}
            </button>
          )}
          {showAutoplayButton && (
            <button
              onClick={() => setAutoplay(v => !v)}
              className={`px-3 py-1.5 rounded text-sm ${autoplay ? playBtnOn : playBtnOff}`}
              aria-pressed={autoplay}
              title={autoplay ? `Pause (every ${AUTOPLAY_MS}ms)` : `Play (every ${AUTOPLAY_MS}ms)`}
            >
              {autoplay ? "Pause" : "Play"}
            </button>
          )}
        </div>
      </div>

      {/* single vertical card (9:16 aspect) */}
      <div className="flex-grow flex items-center justify-center px-3 pb-14">
        <article className={`relative overflow-hidden rounded-2xl ring-1 shadow-xl w-full max-w-[480px] ${cardBase}`}>
          {/* media area (9:16 vertical) */}
          <div className="relative w-full aspect-[9/16] bg-black">
            {m.kind === "image" ? (
              <img
                src={m.mediaUrl}
                alt={m.file_name}
                className="h-full w-full object-cover select-none"
                loading="eager"
                draggable={false}
              />
            ) : (
              <video
                ref={videoRef}
                src={m.mediaUrl}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                controls={false}
                preload="metadata"
              />
            )}

            {/* QR overlay */}
            {showQR && m.qrcodeUrl && (
              <img
                src={m.qrcodeUrl}
                alt="QR"
                className="absolute bottom-3 right-3 h-18 w-18 md:h-20 md:w-20 object-contain rounded-md bg-white/90 p-1"
                draggable={false}
              />
            )}
          </div>

          {/* meta */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{m.file_name}</div>
              <div className={isDark ? "text-[11px] opacity-70" : "text-[11px] text-slate-500"}>
                {new Date(m.updated_at).toLocaleString()}
                {m.station ? ` · ${m.station}` : ""} {m.camera_mode ? ` · ${m.camera_mode}` : ""} {m.username ? ` · ${m.username}` : ""}
              </div>
            </div>
            <div className={isDark ? "text-xs opacity-80" : "text-xs text-slate-500"}>{index + 1} / {media.length}</div>
          </div>
        </article>
      </div>

      {/* bottom controls (slide-up) */}
      <SidebarToggleBottom
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(v => !v)}
        autoplay={autoplay}
        onAutoplayChange={setAutoplay}
        live={live}
        onLiveChange={setLive}
        showEvent={showEvent}
        onShowEventChange={setShowEvent}
        showQR={showQR}
        onShowQRChange={setShowQR}
        onRefresh={fetchData}
        showTitle={showTitle}
        onShowTitleChange={setShowTitle}
        showLiveButton={showLiveButton}
        onShowLiveButtonChange={setShowLiveButton}
        showAutoplayButton={showAutoplayButton}
        onShowAutoplayButtonChange={setShowAutoplayButton}
        showRefreshButton={showRefreshButton}
        onShowRefreshButtonChange={setShowRefreshButton}
        theme={theme}
        onThemeChange={setTheme}
      />
    </div>
  );
};

export default GalleryLiveFeedVertical;
