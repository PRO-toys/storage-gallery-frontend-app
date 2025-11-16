// src/pages/role/user/inspiration/viewer/InspirationViewerAnimation.tsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import LoadingHourglass from '../../../../../components/inspiration/LoadingHourglass';
import bgViewer from '../../../../../assets/images/role/user/inspiration/bg-viewer.png';

interface GalleryItem {
  id: number;
  qrcode: string;
  file_name: string;
  event_code: string;
  updated_at: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_INSPIRATION_VIEWER_POLL_MS ?? 20000);
const GRID_COLS = Number(import.meta.env.VITE_INSPIRATION_VIEWER_GRID_COLS ?? 4);
const GRID_ROWS = Number(import.meta.env.VITE_INSPIRATION_VIEWER_GRID_ROWS ?? 3);
const GRID_GAP_PX = Number(import.meta.env.VITE_INSPIRATION_VIEWER_GRID_GAP_PX ?? 12);
const MARGIN_LEFT_PX = Number(import.meta.env.VITE_INSPIRATION_VIEWER_MARGIN_LEFT_PX ?? 24);
const MARGIN_RIGHT_PX = Number(import.meta.env.VITE_INSPIRATION_VIEWER_MARGIN_RIGHT_PX ?? 24);
const MARGIN_TOP_PX = Number(import.meta.env.VITE_INSPIRATION_VIEWER_MARGIN_TOP_PX ?? 24);
const MARGIN_BOTTOM_PX = Number(import.meta.env.VITE_INSPIRATION_VIEWER_MARGIN_BOTTOM_PX ?? 24);
const FADE_MS = Number(import.meta.env.VITE_INSPIRATION_VIEWER_FADE_MS ?? 1200);
const STAGGER_MS = Number(import.meta.env.VITE_INSPIRATION_VIEWER_STAGGER_MS ?? 120);

const GRID_COUNT = Math.max(1, GRID_COLS * GRID_ROWS);

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
      <div className="w-full" style={{ paddingTop: '56.25%' }} />
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
          style={{
            animation: `crossfadeIn ${fadeMs}ms ease-in-out forwards`,
            opacity: 0,
          }}
        />
      )}
    </div>
  );
};

const InspirationViewerAnimation: React.FC = () => {
  const { event_code } = useParams<{ event_code: string }>();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tileSrcs, setTileSrcs] = useState<string[]>(Array(GRID_COUNT).fill(''));
  const stageRef = useRef<HTMLDivElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const makeSrc = (it: GalleryItem) =>
    `${backendUrl}/storage/gallery/${it.event_code}/${it.qrcode}/${it.file_name}?t=${Date.now()}`;

  const fetchImages = async () => {
    try {
      const url = `${backendUrl}/api/role/user/read-data/read-gallery-by-event/${encodeURIComponent(
        event_code ?? ''
      )}`;
      const res = await axios.get(url);
      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        const imageItems: GalleryItem[] = res.data.data.filter((item: GalleryItem) =>
          /\.(jpg|jpeg|png)$/i.test(item.file_name)
        );
        setImages(imageItems);
        setError(null);
      } else {
        setError(res.data?.message || 'Failed to load images');
      }
    } catch {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    const interval = setInterval(fetchImages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [event_code]);

  useEffect(() => {
    if (!images.length) return;
    if (tileSrcs.some((s) => s)) return;
    const pool = [...images];
    const picked: GalleryItem[] = [];
    while (picked.length < GRID_COUNT && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    const initial = picked.map(makeSrc);
    while (initial.length < GRID_COUNT) {
      const rnd = images[Math.floor(Math.random() * images.length)];
      initial.push(makeSrc(rnd));
    }
    setTileSrcs(initial);
  }, [images, tileSrcs]);

  useEffect(() => {
    if (!images.length) return;
    if (!tileSrcs.some((s) => s)) return;

    const pool = [...images];
    const targetItems: GalleryItem[] = [];
    while (targetItems.length < GRID_COUNT && pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      targetItems.push(pool.splice(idx, 1)[0]);
    }
    while (targetItems.length < GRID_COUNT) {
      const rnd = images[Math.floor(Math.random() * images.length)];
      targetItems.push(rnd);
    }
    const targetSrcs = targetItems.map(makeSrc);

    const order = Array.from({ length: GRID_COUNT }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];

    order.forEach((idx, step) => {
      const delay = Math.floor(Math.random() * STAGGER_MS + step * STAGGER_MS);
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
  }, [images]);

  if (loading) {
    return <LoadingHourglass show={true} text="Loading inspiration images..." />;
  }

  if (error) {
    return (
      <div
        className="w-screen h-screen text-red-500 flex items-center justify-center text-xl"
        style={{
          backgroundImage: `url(${bgViewer})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
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
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        No images found
      </div>
    );
  }

  const stageStyle: React.CSSProperties = {
    width: 'min(100vw, calc(100vh * 16 / 9))',
    height: 'min(100vh, calc(100vw * 9 / 16))',
  };

  const workAreaStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    paddingLeft: MARGIN_LEFT_PX,
    paddingRight: MARGIN_RIGHT_PX,
    paddingTop: MARGIN_TOP_PX,
    paddingBottom: MARGIN_BOTTOM_PX,
    boxSizing: 'border-box',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    width: '100%',
    height: '100%',
    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
    gap: GRID_GAP_PX,
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden flex items-center justify-center"
      style={{
        backgroundImage: `url(${bgViewer})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div ref={stageRef} className="relative rounded-xl shadow-2xl" style={stageStyle}>
        <div style={workAreaStyle}>
          <div style={gridStyle}>
            {tileSrcs.slice(0, GRID_COUNT).map((src, i) => (
              <CrossfadeTile key={i} src={src} fadeMs={FADE_MS} />
            ))}
          </div>
        </div>
      </div>

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
