// src/pages/role/user/gallery/GalleryLiveFeedHorizontal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ModalGrowing from "../../../../components/modal/ModalGrowing";
import SidebarToggleBottom, { ThemeMode } from "../../../../components/sidebar/SidebarToggleBottom";

// ---------- images & icons (same paths as other pages) ----------
import logoSocialhub from "../../../../assets/images/role/user/gallery/logo_socialhub.png";
import bgLiveFeed from "../../../../assets/images/role/user/gallery/bg-live-feed.png";
import iconLiveOff from "../../../../assets/images/role/user/gallery/icon-live-off.png";
import iconLiveOn from "../../../../assets/images/role/user/gallery/icon-live-on.png";
import iconRefresh from "../../../../assets/images/role/user/gallery/icon-refresh.png";

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

const AUTOPLAY_MS_RAW = parseInt((import.meta.env.VITE_GALLERY_LIVE_HORIZONTAL_AUTOPLAY_MS as string) || (import.meta.env.VITE_GALLERY_LIVE_VERTICAL_AUTOPLAY_MS as string) || "5000", 10);
const AUTOPLAY_MS = clamp(isNaN(AUTOPLAY_MS_RAW) ? 5000 : AUTOPLAY_MS_RAW, 1000, 600000);

// Default QR visibility (horizontal). Falls back to OFF if env not set.
const DEFAULT_SHOW_QR =
  ((import.meta.env.VITE_GALLERY_LIVE_HORIZONTAL_SHOW_QR as string) ||
    (import.meta.env.VITE_GALLERY_LIVE_VERTICAL_SHOW_QR as string) ||
    "OFF")
    .toUpperCase() === "ON";

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
const GalleryLiveFeedHorizontal: React.FC = () => {
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

  // UI visibility toggles
  const [showTitle, setShowTitle] = useState(true);
  const [showLiveButton, setShowLiveButton] = useState(true);
  const [showAutoplayButton, setShowAutoplayButton] = useState(true);
  const [showRefreshButton, setShowRefreshButton] = useState(true);

  // theme (light/dark/system)
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

  // init
  useEffect(() => {
    if (!event_code) { setErr("Event code is required"); setLoading(false); return; }
    fetchData();
  }, [event_code]);

  // polling
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
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3 text-white"
        style={{
          backgroundImage: `url(${bgLiveFeed})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="text-lg">No media yet</div>
        <button
          onClick={fetchData}
          className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 backdrop-blur"
        >
          Refresh
        </button>
      </div>
    );
  }

  const m = media[index];

  const pageBase = "text-white"; // text color over the bg image
  const cardBase = "bg-black/70 ring-white/10"; // translucent card

  return (
    <div
      className={`min-h-screen ${pageBase} flex flex-col`}
      style={{
        backgroundImage: `url(${bgLiveFeed})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* header */}
      <div className="px-4 py-3 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img src={logoSocialhub} alt="Socialhub Logo" className="h-10 md:h-12 w-auto select-none" draggable={false} />
          <div className="leading-tight">
            {showTitle && (
              <div className="text-[11px] uppercase tracking-widest text-white/80">Live Feed (16:9)</div>
            )}
            {showEvent && (
              <div className="text-lg font-semibold drop-shadow">
                Event: <span className="font-mono">{event_code}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showRefreshButton && (
            <button
              onClick={fetchData}
              aria-label="Refresh"
              title="Refresh"
              className="p-1 rounded-lg bg-transparent hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/70 active:scale-95 transition"
            >
              <img
                src={iconRefresh}
                alt="Refresh"
                className="w-12 h-12 md:w-14 md:h-14 select-none pointer-events-none"
                draggable={false}
              />
            </button>
          )}
          {showLiveButton && (
            <button
              onClick={() => setLive(v => !v)}
              aria-label={live ? "Turn live OFF" : "Turn live ON"}
              title={live ? `Live: ON (every ${POLL_MS}ms)` : "Live: OFF"}
              aria-pressed={live}
              className="p-1 rounded-lg bg-transparent hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/70 active:scale-95 transition"
            >
              <img
                src={live ? iconLiveOn : iconLiveOff}
                alt={live ? "Live ON" : "Live OFF"}
                className="w-12 h-12 md:w-14 md:h-14 select-none pointer-events-none"
                draggable={false}
              />
            </button>
          )}
          {showAutoplayButton && (
            <button
              onClick={() => setAutoplay(v => !v)}
              className="px-3 py-1.5 rounded text-sm bg-white/10 hover:bg-white/20"
              aria-pressed={autoplay}
              title={autoplay ? `Pause autoplay (${AUTOPLAY_MS}ms)` : `Start autoplay (${AUTOPLAY_MS}ms)`}
            >
              {autoplay ? "Pause" : "Play"}
            </button>
          )}
        </div>
      </div>

      {/* single horizontal card (16:9 aspect) */}
      <div className="flex-grow flex items-center justify-center px-4 pb-16">
        <article className={`relative overflow-hidden rounded-2xl ring-1 shadow-xl w-full max-w-[1280px] ${cardBase}`}>
          {/* media area (16:9) */}
          <div className="relative w-full aspect-[16/9] bg-black">
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
                className="absolute bottom-4 right-4 h-20 w-20 lg:h-24 lg:w-24 object-contain rounded-md bg-white/90 p-1"
                draggable={false}
              />
            )}
          </div>

          {/* meta */}
          <div className="px-5 py-3 flex items-center justify-between bg-black/40">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{m.file_name}</div>
              <div className="text-[11px] text-white/80">
                {new Date(m.updated_at).toLocaleString()}
                {m.station ? ` · ${m.station}` : ""} {m.camera_mode ? ` · ${m.camera_mode}` : ""} {m.username ? ` · ${m.username}` : ""}
              </div>
            </div>
            <div className="text-xs text-white/80">{index + 1} / {media.length}</div>
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

export default GalleryLiveFeedHorizontal;
