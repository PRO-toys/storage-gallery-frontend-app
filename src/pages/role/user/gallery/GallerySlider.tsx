// src/pages/role/user/gallery/GallerySlider.tsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ModalGrowing from "../../../../components/modal/ModalGrowing";
import logoProtoys1 from "../../../../assets/images/role/user/onepage/logo_protoys1.png";

// ---------------- Types ----------------
type Orientation = "portrait" | "landscape" | "square" | null;

interface GalleryItem {
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
  file_name: string;
  mediaUrl: string;
  qrcodeUrl: string | null;
  qrcode: string | null;
  updated_at: string;
}

// ---------------- Utils ----------------
const splitEnvList = (value: string | undefined, fallback: string[]): string[] =>
  !value || !value.trim()
    ? fallback
    : value
        .split(/[|,]/)
        .map((s) => s.trim())
        .filter(Boolean);

const clampInt = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const DEFAULT_IMG_PREFIXES = ["RenderImage", "PrintRenderImage", "image"];
const DEFAULT_QR_PREFIXES = ["qrcode"];

const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
const ENV_IMG = splitEnvList(import.meta.env.VITE_ALLOWED_PREFIXES_IMAGES, DEFAULT_IMG_PREFIXES).map((s) =>
  s.toLowerCase()
);
const ENV_QR = splitEnvList(import.meta.env.VITE_ALLOWED_PREFIXES_QRCODE, DEFAULT_QR_PREFIXES).map((s) =>
  s.toLowerCase()
);
const ENV_POLL_MS_RAW = parseInt((import.meta.env.VITE_GALLERY_POLL_MS as string) || "10000", 10);
const POLL_MS = clampInt(isNaN(ENV_POLL_MS_RAW) ? 10000 : ENV_POLL_MS_RAW, 1000, 60000);

// --- Slider-specific envs ---
const SHOW_QR = ((import.meta.env.VITE_GALLERY_SLIDER_SHOW_QRCODE as string) || "ON").toUpperCase() === "ON";
const RANDOMIZE = ((import.meta.env.VITE_GALLERY_SLIDER_RANDOM as string) || "OFF").toUpperCase() === "ON";
const AUTOPLAY_MS_RAW = parseInt((import.meta.env.VITE_GALLERY_SLIDER_AUTOPLAY_MS as string) || "5000", 10);
const AUTOPLAY_MS = clampInt(isNaN(AUTOPLAY_MS_RAW) ? 5000 : AUTOPLAY_MS_RAW, 1000, 600000);

const getOrientation = (w: number, h: number): Orientation => {
  if (!w || !h) return null;
  if (Math.abs(w - h) < 2) return "square";
  return h > w ? "portrait" : "landscape";
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------- Component ----------------
const GallerySlider: React.FC = () => {
  const { event_code } = useParams<{ event_code: string }>();

  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveFeed, setLiveFeed] = useState(false); // default OFF
  const [autoplay, setAutoplay] = useState(false); // default OFF
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>(null);

  // ---- Inactivity-based UI visibility (fullscreen) ----
  const UI_HIDE_MS = 3000;
  const [uiVisible, setUiVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);
  const pokeUI = () => {
    setUiVisible(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setUiVisible(false), UI_HIDE_MS);
  };

  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const fetchGallery = async () => {
    if (!event_code) return;
    setError(null);
    try {
      const res = await axios.get(
        `${backendUrl}/api/role/user/read-data/read-gallery-by-event/${encodeURIComponent(event_code)}`
      );
      if (res.data?.status === "success" && Array.isArray(res.data?.data)) {
        setGalleryData(res.data.data);
      } else {
        setError(res.data?.message || "Failed to load gallery data");
      }
    } catch {
      setError("Error fetching gallery data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!event_code) {
      setError("Event code is required");
      setLoading(false);
      return;
    }
    fetchGallery();
    if (!liveFeed) return;
    const id = setInterval(fetchGallery, POLL_MS);
    return () => clearInterval(id);
  }, [event_code, liveFeed]);

  // Build images only; skip qrcode files as media
  useEffect(() => {
    if (galleryData.length === 0) {
      setMediaItems([]);
      setIndex(0);
      return;
    }

    const byQr: Record<string, { qrcodeUrl: string | null; items: GalleryItem[] }> = {};
    for (const it of galleryData) {
      const group = (byQr[it.qrcode] ||= { qrcodeUrl: null, items: [] });
      const lower = it.file_name.toLowerCase();
      if (ENV_QR.some((p) => lower === `${p}.jpg` || lower.startsWith(`${p}_`))) {
        group.qrcodeUrl = `${backendUrl}/storage/gallery/${it.event_code}/${it.qrcode}/${it.file_name}`;
      } else {
        group.items.push(it);
      }
    }

    let out: MediaItem[] = [];
    for (const [qr, group] of Object.entries(byQr)) {
      for (const it of group.items) {
        const lower = it.file_name.toLowerCase();
        const isImgByPrefix = ENV_IMG.some((p) => lower.startsWith(p));
        if (!isImgByPrefix) continue;
        out.push({
          id: it.id,
          file_name: it.file_name,
          mediaUrl: `${backendUrl}/storage/gallery/${it.event_code}/${it.qrcode}/${it.file_name}`,
          qrcodeUrl: group.qrcodeUrl || null,
          qrcode: qr || null,
          updated_at: it.updated_at,
        });
      }
    }

    if (RANDOMIZE) {
      out = shuffle(out);
    } else {
      out.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    }

    setMediaItems(out);
    setIndex((prev) => (out.length === 0 ? 0 : Math.min(prev, out.length - 1)));
  }, [galleryData]);

  // Track orientation
  useEffect(() => {
    const current = mediaItems[index];
    setOrientation(null);
    if (!current) return;
    const img = new Image();
    img.onload = () => setOrientation(getOrientation(img.naturalWidth, img.naturalHeight));
    img.src = current.mediaUrl;
  }, [mediaItems, index]);

  const total = mediaItems.length;
  const prev = () => setIndex((i) => (total ? (i - 1 + total) % total : 0));
  const next = () => setIndex((i) => (total ? (i + 1) % total : 0));

  // Keyboard nav + poke UI
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { prev(); pokeUI(); }
      if (e.key === "ArrowRight") { next(); pokeUI(); }
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    pokeUI();
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    pokeUI();
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const dx = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (Math.abs(dx) > 50) {
      if (dx > 0) prev();
      else next();
    }
    pokeUI();
  };

  // Autoplay
  useEffect(() => {
    if (!autoplay || total === 0) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [autoplay, total]);

  // ---------------- Render ----------------
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/80">
        <ModalGrowing />
      </div>
    );
  }
  if (error)
    return (
      <div className="min-h-screen w-screen bg-black text-red-500 flex items-center justify-center p-6">
        {error}
      </div>
    );
  if (total === 0)
    return (
      <div className="min-h-screen w-screen bg-black text-white flex items-center justify-center p-6">
        No images found.
      </div>
    );

  const current = mediaItems[index];

  // Class helper for fullscreen UI visibility
  const overlayUI = uiVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      {/* --- Compact slider card --- */}
      <div className="w-full max-w-5xl rounded-xl shadow-lg bg-black relative overflow-hidden">
        {/* Top overlay (always visible in compact) */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 bg-black/30">
          <img src={logoProtoys1} alt="Protoys Logo" className="w-[90px] md:w-[120px] h-auto" />
          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-white text-xs md:text-sm opacity-80">{index + 1} / {total}</div>
            <button
              onClick={() => setAutoplay((v) => !v)}
              className={`px-3 py-1 rounded text-white text-xs md:text-sm transition ${autoplay ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"}`}
              aria-pressed={autoplay}
              title={autoplay ? `Pause (every ${AUTOPLAY_MS}ms)` : `Play (every ${AUTOPLAY_MS}ms)`}
            >
              {autoplay ? "Pause" : "Play"}
            </button>
            <button
              onClick={() => setLiveFeed((v) => !v)}
              className={`px-3 py-1 rounded text-white text-xs md:text-sm transition ${liveFeed ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"}`}
              aria-pressed={liveFeed}
              title={liveFeed ? "Turn live feed OFF" : "Turn live feed ON"}
            >
              {liveFeed ? "Live: ON" : "Live: OFF"}
            </button>
            <button
              onClick={() => { setIsFullscreen(true); setUiVisible(true); pokeUI(); }}
              className="px-3 py-1 rounded text-white text-xs md:text-sm bg-white/10 hover:bg-white/20 backdrop-blur"
              title="Enter fullscreen"
            >
              Fullscreen
            </button>
          </div>
        </div>

        {/* Image area (16:9) */}
        <div
          className="aspect-video w-full flex items-center justify-center bg-black"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            key={current.id}
            src={current.mediaUrl}
            alt={current.file_name}
            className="max-h-full max-w-full w-auto h-auto object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Controls (compact) */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-2 text-white"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-2 text-white"
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* --- Fullscreen overlay (auto-hide UI on inactivity) --- */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black overflow-hidden select-none"
          onMouseMove={pokeUI}
          onClick={() => { next(); pokeUI(); }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => { onTouchEnd(); pokeUI(); }}
        >
          {/* Top bar */}
          <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-black/30 transition-opacity ${overlayUI}`}>
            <img src={logoProtoys1} alt="Protoys Logo" className="w-[90px] md:w-[120px] h-auto" />
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-white text-sm opacity-80">{index + 1} / {total}</div>
              <button
                onClick={(e) => { e.stopPropagation(); setAutoplay((v) => !v); pokeUI(); }}
                className={`px-3 py-1.5 rounded text-white text-xs md:text-sm transition ${autoplay ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"}`}
                aria-pressed={autoplay}
                title={autoplay ? `Pause (every ${AUTOPLAY_MS}ms)` : `Play (every ${AUTOPLAY_MS}ms)`}
              >
                {autoplay ? "Pause" : "Play"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLiveFeed((v) => !v); pokeUI(); }}
                className={`px-3 py-1.5 rounded text-white text-xs md:text-sm transition ${liveFeed ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"}`}
                aria-pressed={liveFeed}
                title={liveFeed ? "Turn live feed OFF" : "Turn live feed ON"}
              >
                {liveFeed ? "Live: ON" : "Live: OFF"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current); }}
                className="px-3 py-1.5 rounded text-white text-xs md:text-sm bg-white/10 hover:bg-white/20 backdrop-blur"
                title="Exit fullscreen (Esc)"
              >
                Close
              </button>
            </div>
          </div>

          {/* Main media */}
          <div className="h-full w-full flex items-center justify-center">
            <img
              key={current.id}
              src={current.mediaUrl}
              alt={current.file_name}
              className="max-h-[100vh] max-w-[100vw] w-auto h-auto object-contain"
              draggable={false}
            />
          </div>

          {/* Arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); pokeUI(); }}
            className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20 backdrop-blur transition-opacity ${overlayUI}`}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); pokeUI(); }}
            className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20 backdrop-blur transition-opacity ${overlayUI}`}
            aria-label="Next"
          >
            ›
          </button>

          {/* Bottom QR */}
          {SHOW_QR && current.qrcodeUrl && (
            <div className={`absolute bottom-0 left-0 right-0 z-10 flex items-end justify-center pb-4 transition-opacity ${overlayUI}`}>
              <img
                src={current.qrcodeUrl}
                alt="QR Code"
                className="w-[120px] md:w-[160px] h-auto object-contain opacity-90"
                draggable={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GallerySlider;
