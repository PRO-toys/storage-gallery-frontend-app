// src/pages/role/user/gallery/GalleryViewer.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ModalGrowing from "../../../../components/modal/ModalGrowing";
import logoProtoys1 from "../../../../assets/images/role/user/onepage/logo_protoys1.png";
import iconArrowLeft from "../../../../assets/images/role/user/onepage/icon_arrow_left.png";
import iconArrowRight from "../../../../assets/images/role/user/onepage/icon_arrow_right.png";

type MediaKind = "image" | "video";
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
  type: MediaKind;
  file_name: string;
  mediaUrl: string;
  qrcodeUrl: string | null;
  qrcode: string;
  updated_at: string;
}

const splitEnvList = (value: string | undefined, fallback: string[]): string[] =>
  !value || !value.trim()
    ? fallback
    : value
        .split(/[|,]/)
        .map((s) => s.trim())
        .filter(Boolean);

const clampInt = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const DEFAULT_IMG_PREFIXES = ["RenderImage", "PrintRenderImage", "image"];
const DEFAULT_VID_PREFIXES = ["RenderVideo", "Video"];
const DEFAULT_QR_PREFIXES = ["qrcode"];

const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
const frontendUrl = (import.meta.env.VITE_FRONTEND_URL as string) || "";
const ENV_IMG = splitEnvList(import.meta.env.VITE_ALLOWED_PREFIXES_IMAGES, DEFAULT_IMG_PREFIXES).map((s) =>
  s.toLowerCase()
);
const ENV_VID = splitEnvList(import.meta.env.VITE_ALLOWED_PREFIXES_VIDEOS, DEFAULT_VID_PREFIXES).map((s) =>
  s.toLowerCase()
);
const ENV_QR = splitEnvList(import.meta.env.VITE_ALLOWED_PREFIXES_QRCODE, DEFAULT_QR_PREFIXES).map((s) =>
  s.toLowerCase()
);

const ENV_POLL_MS_RAW = parseInt((import.meta.env.VITE_GALLERY_POLL_MS as string) || "10000", 10);
const POLL_MS = clampInt(isNaN(ENV_POLL_MS_RAW) ? 10000 : ENV_POLL_MS_RAW, 1000, 60000);

const ENV_ITEMS_PER_PAGE_RAW = parseInt((import.meta.env.VITE_GALLERY_ITEMS_PER_PAGE as string) || "5", 10);
const ITEMS_PER_PAGE = clampInt(isNaN(ENV_ITEMS_PER_PAGE_RAW) ? 5 : ENV_ITEMS_PER_PAGE_RAW, 1, 48);

const getOrientation = (w: number, h: number): Orientation => {
  if (!w || !h) return null;
  if (Math.abs(w - h) < 2) return "square";
  return h > w ? "portrait" : "landscape";
};

const GalleryViewer: React.FC = () => {
  const { event_code } = useParams<{ event_code: string }>();

  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveFeed, setLiveFeed] = useState(true);
  const [selectedOrientation, setSelectedOrientation] = useState<Orientation>(null);

  const fetchGallery = async () => {
    if (!event_code) return;
    setLoading(true);
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
    } catch (e) {
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

  useEffect(() => {
    if (!Array.isArray(galleryData) || galleryData.length === 0) {
      setMediaItems([]);
      setSelectedMedia(null);
      setCurrentPage(1);
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

    const out: MediaItem[] = [];
    for (const [qr, group] of Object.entries(byQr)) {
      for (const it of group.items) {
        const lower = it.file_name.toLowerCase();
        const isImgByPrefix = ENV_IMG.some((p) => lower.startsWith(p));
        const isVidByPrefix = ENV_VID.some((p) => lower.startsWith(p));
        let kind: MediaKind | null = null;
        if (isVidByPrefix || lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".webm")) {
          kind = "video";
        } else if (isImgByPrefix) {
          kind = "image";
        }
        if (!kind) continue;
        out.push({
          id: it.id,
          type: kind,
          file_name: it.file_name,
          mediaUrl: `${backendUrl}/storage/gallery/${it.event_code}/${it.qrcode}/${it.file_name}`,
          qrcodeUrl: group.qrcodeUrl,
          qrcode: qr,
          updated_at: it.updated_at,
        });
      }
    }

    out.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    setMediaItems(out);

    if (liveFeed) {
      setCurrentPage(1);
      setSelectedMedia(out[0] ?? null);
    } else {
      if (selectedMedia) {
        const stillExists = out.find((m) => m.id === selectedMedia.id);
        setSelectedMedia(stillExists || out[0] || null);
      } else {
        setSelectedMedia(out[0] ?? null);
      }
    }
  }, [galleryData, liveFeed, selectedMedia?.id]);

  useEffect(() => {
    setSelectedOrientation(null);
    if (!selectedMedia) return;
    if (selectedMedia.type === "image") {
      const img = new Image();
      img.onload = () => setSelectedOrientation(getOrientation(img.naturalWidth, img.naturalHeight));
      img.src = selectedMedia.mediaUrl;
    } else {
      setSelectedOrientation("landscape");
    }
  }, [selectedMedia?.id]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(mediaItems.length / ITEMS_PER_PAGE)), [mediaItems.length]);

  const paginatedItems = useMemo(
    () => mediaItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [mediaItems, currentPage]
  );

  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-50">
        <ModalGrowing />
      </div>
    );

  if (error) return <div className="text-center text-red-600 p-6">{error}</div>;
  if (mediaItems.length === 0) return <div className="text-center p-6">No gallery items found.</div>;

  const gapBelowViewer = selectedOrientation === "portrait" ? "mb-10" : "mb-6";

  const qrPublicLink =
    selectedMedia && event_code && selectedMedia.qrcode
      ? `${frontendUrl}/role/user/gallery/GalleryOnePage/${encodeURIComponent(event_code)}/${encodeURIComponent(
          selectedMedia.qrcode
        )}`
      : null;

  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-between mb-4">
        <img src={logoProtoys1} alt="Protoys Logo" className="w-[200px] md:w-[300px] h-auto" />
        <button
          onClick={() => setLiveFeed((v) => !v)}
          className={`px-4 py-2 rounded-lg text-white text-sm transition ${
            liveFeed ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"
          }`}
          title={liveFeed ? "Turn live feed OFF" : "Turn live feed ON"}
          aria-pressed={liveFeed}
        >
          {liveFeed ? "Live: ON" : "Live: OFF"}
        </button>
      </div>

      <div className={`flex flex-col md:flex-row justify-center items-center gap-6 w-full max-w-[1000px] ${gapBelowViewer}`}>
        <div className="flex-1 max-w-[700px] w-full flex items-center justify-center">
          {selectedMedia?.type === "image" && (
            <img
              src={selectedMedia.mediaUrl}
              alt={selectedMedia.file_name}
              className="w-auto h-[450px] max-w-[900px] max-h-[550px] object-contain"
            />
          )}
          {selectedMedia?.type === "video" && (
            <video
              src={selectedMedia.mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-auto h-[450px] max-w-[900px] max-h-[550px] object-contain"
            />
          )}
        </div>
        <div className="flex-1 max-w-[350px] text-center">
          <p className="font-bold mb-2">EXTREME AI PHOTO</p>
          {selectedMedia?.qrcodeUrl ? (
            <>
              <img
                src={selectedMedia.qrcodeUrl}
                alt="QR Code"
                className="w-[250px] md:w-[320px] h-auto mx-auto object-contain"
              />
              {qrPublicLink && (
                <a
                  href={qrPublicLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs md:text-sm text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {qrPublicLink}
                </a>
              )}
            </>
          ) : (
            <p className="text-gray-500">No QR Code available</p>
          )}
        </div>
      </div>

      <div className="w-full max-w-[1200px] flex items-center gap-2">
        <button
          onClick={prevPage}
          disabled={isPrevDisabled}
          aria-label="Previous page"
          className="shrink-0 p-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition"
        >
          <img src={iconArrowLeft} alt="Previous" className="w-10 h-10" />
        </button>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 flex-1">
          {paginatedItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              title={item.file_name}
              className="relative overflow-hidden rounded bg-transparent hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 pt-[150%]"
            >
              {item.type === "image" ? (
                <img
                  src={item.mediaUrl}
                  alt={item.file_name}
                  className="absolute inset-0 w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.mediaUrl}
                  className="absolute inset-0 w-full h-full object-contain"
                  muted
                  autoPlay
                  loop
                />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={isNextDisabled}
          aria-label="Next page"
          className="shrink-0 p-1 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition"
        >
          <img src={iconArrowRight} alt="Next" className="w-10 h-10" />
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        Page <b>{currentPage}</b> of <b>{totalPages}</b>
      </div>
    </div>
  );
};

export default GalleryViewer;
