// src/pages/role/user/inspiration/viewer/InspirationViewerAnimation.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import LoadingHourglass from "../../../../../components/inspiration/LoadingHourglass";
import ModalSettings, { ViewerSettings } from "../../../../../components/inspiration/ModalSettings";
import bgViewer from "../../../../../assets/images/role/user/inspiration/bg-viewer.png";

interface GalleryItem {
  id: number;
  qrcode: string;
  file_name: string;
  event_code: string;
  updated_at: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

const ENV_POLL = Number(import.meta.env.VITE_INSPIRATION_VIEWER_POLL_MS ?? 20000);
const ENV_COLS = Number(import.meta.env.VITE_INSPIRATION_VIEWER_GRID_COLS ?? 4);
const ENV_ROWS = Number(import.meta.env.VITE_INSPIRATION_VIEWER_GRID_ROWS ?? 3);
const ENV_GAP = Number(import.meta.env.VITE_INSPIRATION_VIEWER_GRID_GAP_PX ?? 12);
const ENV_ML = Number(import.meta.env.VITE_INSPIRATION_VIEWER_MARGIN_LEFT_PX ?? 24);
const ENV_MR = Number(import.meta.env.VITE_INSPIRATION_VIEWER_MARGIN_RIGHT_PX ?? 24);
const ENV_MT = Number(import.meta.env.VITE_INSPIRATION_VIEWER_MARGIN_TOP_PX ?? 24);
const ENV_MB = Number(import.meta.env.VITE_INSPIRATION_VIEWER_MARGIN_BOTTOM_PX ?? 24);
const ENV_FADE = Number(import.meta.env.VITE_INSPIRATION_VIEWER_FADE_MS ?? 1200);
const ENV_STAGGER = Number(import.meta.env.VITE_INSPIRATION_VIEWER_STAGGER_MS ?? 120);

const envDefaults = (): ViewerSettings => ({
  pollMs: ENV_POLL,
  gridCols: ENV_COLS,
  gridRows: ENV_ROWS,
  gridGapPx: ENV_GAP,
  marginLeftPx: ENV_ML,
  marginRightPx: ENV_MR,
  marginTopPx: ENV_MT,
  marginBottomPx: ENV_MB,
  fadeMs: ENV_FADE,
  staggerMs: ENV_STAGGER,
});

const ENV_SIGNATURE = JSON.stringify(envDefaults());
const SS_KEY = "INSP_VIEWER_SETTINGS";

const isNumber = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const coerceSettings = (obj: any, fallback: ViewerSettings): ViewerSettings => {
  if (!obj || typeof obj !== "object") return fallback;
  return {
    pollMs: isNumber(obj.pollMs) ? obj.pollMs : fallback.pollMs,
    gridCols: isNumber(obj.gridCols) ? obj.gridCols : fallback.gridCols,
    gridRows: isNumber(obj.gridRows) ? obj.gridRows : fallback.gridRows,
    gridGapPx: isNumber(obj.gridGapPx) ? obj.gridGapPx : fallback.gridGapPx,
    marginLeftPx: isNumber(obj.marginLeftPx) ? obj.marginLeftPx : fallback.marginLeftPx,
    marginRightPx: isNumber(obj.marginRightPx) ? obj.marginRightPx : fallback.marginRightPx,
    marginTopPx: isNumber(obj.marginTopPx) ? obj.marginTopPx : fallback.marginTopPx,
    marginBottomPx: isNumber(obj.marginBottomPx) ? obj.marginBottomPx : fallback.marginBottomPx,
    fadeMs: isNumber(obj.fadeMs) ? obj.fadeMs : fallback.fadeMs,
    staggerMs: isNumber(obj.staggerMs) ? obj.staggerMs : fallback.staggerMs,
  };
};

const loadSettingsFromSession = (): ViewerSettings => {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    if (!raw) return envDefaults();
    const parsed = JSON.parse(raw);
    if (parsed?.__envSig !== ENV_SIGNATURE) return envDefaults();
    return coerceSettings(parsed?.data, envDefaults());
  } catch {
    return envDefaults();
  }
};

const saveSettingsToSession = (s: ViewerSettings) => {
  const payload = { __envSig: ENV_SIGNATURE, data: s };
  sessionStorage.setItem(SS_KEY, JSON.stringify(payload));
};

const clearSettingsInSession = () => {
  sessionStorage.removeItem(SS_KEY);
};

const CrossfadeTile: React.FC<{ src: string; fadeMs: number }> = ({ src, fadeMs }) => {
  const [current, setCurrent] = useState(src);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    if (src !== current) {
      setNext(src);
      const t = setTimeout(() => {
        setCurrent(src);
        setNext(null);
      }, fadeMs);
      return () => clearTimeout(t);
    }
  }, [src, current, fadeMs]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-md">
      <div className="w-full" style={{ paddingTop: "56.25%" }} />
      <img
        src={current}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 1 }}
      />
      {next && (
        <img
          src={next}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: `crossfadeIn ${fadeMs}ms ease-in-out forwards`, opacity: 0 }}
        />
      )}
    </div>
  );
};

const InspirationViewerAnimation: React.FC = () => {
  const { event_code } = useParams<{ event_code: string }>();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ViewerSettings>(() => loadSettingsFromSession());

  useEffect(() => {
    saveSettingsToSession(settings);
  }, [settings]);

  const gridCount = useMemo(
    () => Math.max(1, settings.gridCols * settings.gridRows),
    [settings.gridCols, settings.gridRows]
  );

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tileSrcs, setTileSrcs] = useState<string[]>(Array(gridCount).fill(""));

  const stageRef = useRef<HTMLDivElement | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    setTileSrcs((prev) => {
      if (prev.length === gridCount) return prev;
      const next = Array(gridCount).fill("");
      for (let i = 0; i < Math.min(prev.length, gridCount); i++) next[i] = prev[i];
      return next;
    });
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, [gridCount]);

  const makeSrc = (it: GalleryItem) =>
    `${backendUrl}/storage/gallery/${it.event_code}/${it.qrcode}/${it.file_name}?t=${Date.now()}`;

  const fetchImages = async () => {
    try {
      const url = `${backendUrl}/api/role/user/read-data/read-gallery-by-event/${encodeURIComponent(
        event_code ?? ""
      )}`;
      const res = await axios.get(url);
      if (res.data?.status === "success" && Array.isArray(res.data.data)) {
        const imageItems: GalleryItem[] = res.data.data.filter((item: GalleryItem) =>
          /\.(jpg|jpeg|png)$/i.test(item.file_name)
        );
        setImages(imageItems);
        setError(null);
      } else {
        setError(res.data?.message || "Failed to load images");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!event_code) return;
    setLoading(true);
    fetchImages();

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollIntervalRef.current = window.setInterval(fetchImages, settings.pollMs) as unknown as number;

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    };
  }, [event_code, settings.pollMs]);

  useEffect(() => {
    if (!images.length) return;
    if (tileSrcs.some((s) => s)) return;

    const pool = [...images];
    const picked: GalleryItem[] = [];
    while (picked.length < gridCount && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    const initial = picked.map(makeSrc);
    while (initial.length < gridCount) {
      const rnd = images[Math.floor(Math.random() * images.length)];
      initial.push(makeSrc(rnd));
    }
    setTileSrcs(initial);
  }, [images, tileSrcs, gridCount]);

  useEffect(() => {
    if (!images.length) return;
    if (!tileSrcs.some((s) => s)) return;

    const pool = [...images];
    const targetItems: GalleryItem[] = [];
    while (targetItems.length < gridCount && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      targetItems.push(pool.splice(idx, 1)[0]);
    }
    while (targetItems.length < gridCount) {
      const rnd = images[Math.floor(Math.random() * images.length)];
      targetItems.push(rnd);
    }
    const targetSrcs = targetItems.map(makeSrc);

    const order = Array.from({ length: gridCount }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    order.forEach((idx, step) => {
      const delay = Math.floor(Math.random() * settings.staggerMs + step * settings.staggerMs);
      const t = window.setTimeout(() => {
        setTileSrcs((prev) => {
          if (prev[idx] === targetSrcs[idx]) return prev;
          const next = prev.slice();
          next[idx] = targetSrcs[idx];
          return next;
        });
      }, delay);
      timeoutsRef.current.push(t);
    });

    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [images, gridCount, settings.staggerMs]);

  const [showUI, setShowUI] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const bumpUI = () => {
    setShowUI(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    hideTimerRef.current = window.setTimeout(() => {
      setShowUI(false);
    }, 2500) as unknown as number;
  };

  useEffect(() => {
    const onMouseMove = () => bumpUI();
    const onTouchStart = () => bumpUI();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    bumpUI();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (loading) {
    return <LoadingHourglass show={true} text="Loading inspiration images..." />;
  }

  if (error) {
    return (
      <div
        className="w-screen h-screen text-red-500 flex items-center justify-center text-xl"
        style={{
          backgroundImage: `url(${bgViewer})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {error}
      </div>
    );
  }

  if (!tileSrcs.some((s) => s)) {
    return (
      <div
        className="w-screen h-screen text-gray-300 flex items-center justify-center text-lg"
        style={{
          backgroundImage: `url(${bgViewer})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        No images found
      </div>
    );
  }

  const stageStyle: React.CSSProperties = {
    width: "min(100vw, calc(100vh * 16 / 9))",
    height: "min(100vh, calc(100vw * 9 / 16))",
  };

  const workAreaStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    paddingLeft: settings.marginLeftPx,
    paddingRight: settings.marginRightPx,
    paddingTop: settings.marginTopPx,
    paddingBottom: settings.marginBottomPx,
    boxSizing: "border-box",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    width: "100%",
    height: "100%",
    gridTemplateColumns: `repeat(${settings.gridCols}, 1fr)`,
    gridTemplateRows: `repeat(${settings.gridRows}, 1fr)`,
    gap: settings.gridGapPx,
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url(${bgViewer})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      onMouseMove={bumpUI}
      onTouchStart={bumpUI}
    >
      <div
        className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${
          showUI ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setSettingsOpen(true)}
          className="px-3 py-2 rounded-lg bg-black/60 text-white text-sm shadow-lg ring-1 ring-white/20 hover:bg-black/70 active:scale-95"
          title="Viewer Settings"
        >
          ⚙️ Settings
        </button>
      </div>

      <div ref={stageRef} className="relative rounded-xl shadow-2xl" style={stageStyle}>
        <div style={workAreaStyle}>
          <div style={gridStyle}>
            {tileSrcs.slice(0, gridCount).map((src, i) => (
              <CrossfadeTile key={i} src={src} fadeMs={settings.fadeMs} />
            ))}
          </div>
        </div>
      </div>

      <ModalSettings
        open={settingsOpen}
        initial={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={(next) => {
          setSettings(next);
          setSettingsOpen(false);
          bumpUI();
        }}
        onResetDefaults={() => {
          clearSettingsInSession();
          const def = envDefaults();
          setSettings(def);
          setSettingsOpen(false);
          bumpUI();
        }}
        title="Viewer Settings"
      />

      <style>
        {`
          @keyframes crossfadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default InspirationViewerAnimation;
