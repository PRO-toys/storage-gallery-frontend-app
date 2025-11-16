// src/pages/role/user/gallery/GalleryOnePage.tsx
// ======================================================
// GalleryOnePage — with polling, queue gate, cache-busting, CardShareSocial,
// and explicit hide of CardProgressRandom when queue not found
// ======================================================

// =======================
// Import dependencies
// =======================
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// =======================
// Static assets
// =======================
import logoProtoys1 from '../../../../assets/images/role/user/onepage/logo_protoys1.png';
import icon_download from '../../../../assets/images/role/user/onepage/icon_download.png';

// =======================
// Advertisement images
// =======================
import adv1 from '../../../../assets/advertisement/images/adv_1.png';
import adv2 from '../../../../assets/advertisement/images/adv_2.png';
import adv3 from '../../../../assets/advertisement/images/adv_3.png';

// =======================
// Components
// =======================
import ModalConfirmation from '../../../../components/modal/ModalConfirmation';
import ModalLoading from '../../../../components/modal/ModalLoading';
import CardProgressRandom from '../../../../components/card/CardProgressRandom';
import CardShareSocial from '../../../../components/card/CardShareSocial';

// =======================
// Google Analytics
// =======================
import { initGA, sendPageView, sendEvent } from '../../../../analytics/ga';

// =======================
// Type Definitions
// =======================
interface GalleryItem {
  id: number;
  qrcode: string;
  file_name: string;
  event_code: string;
  event_type: string;
  station_code: string;
  camera_mode: string;
  file_size: string;
  username: string;
  created_at: string;
  updated_at: string;
  status: string;
}

// Queue API response (minimal)
type QueueStatus = 'pending' | 'success' | 'error';
interface QueueApiResponse {
  status: 'success' | 'error';
  exists?: boolean;
  data?: {
    queue_status?: QueueStatus;
  } | null;
}

// =======================
// Small reusable separator
// =======================
const Separator: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`w-full max-w-xs border-t border-gray-300 my-6 ${className}`} />
);

// =======================
// Component
// =======================
const GalleryOnePage: React.FC = () => {
  // ---------- Data/UI state ----------
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  // Explicit flag to store if a queue record exists for this event/qrcode
  const [queueExists, setQueueExists] = useState<boolean | null>(null);

  // Cache-busting token for media URLs — bumped whenever gallery refreshes
  const [cacheBust, setCacheBust] = useState<number>(Date.now());

  // Track previous queue status to detect changes across polls
  const prevQueueStatusRef = useRef<QueueStatus | null>(null);
  const prevQueueExistsRef = useRef<boolean | null>(null);

  // ---------- URL params (event & qrcode) ----------
  const { event_code, qrcode } = useParams<{ event_code?: string; qrcode?: string }>();

  // ---------- ENV / URLs ----------
  const showAdvertisement = import.meta.env.VITE_ADVERTISEMENT_MODE === 'ON';
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
  const shareUrl = `${import.meta.env.VITE_FRONTEND_URL}/role/user/gallery/GalleryOnePage/${event_code}/${qrcode}`;

  // Polling interval from .env (fallback 10000ms)
  const pollingInterval = (() => {
    const raw = Number(import.meta.env.VITE_GALLERY_PROGRESS_RANDOM ?? 10000);
    return Number.isFinite(raw) && raw > 0 ? raw : 10000;
  })();

  // =======================
  // Effects — initial load + polling only the queue API
  // =======================
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    if (event_code && qrcode) {
      // ---- Analytics: hit pageview once ----
      initGA();
      sendPageView(`/role/user/gallery/GalleryOnePage/${event_code}/${qrcode}`);

      // ---- Fetch gallery (with cache-bust bump) ----
      const fetchGallery = async () => {
        try {
          const url = `${backendUrl}/api/role/user/read-data/read-gallery-by-event-and-qrcode/${event_code}/${qrcode}`;
          const response = await axios.get(url);
          const sortedData = (response.data?.data ?? []).sort(
            (a: GalleryItem, b: GalleryItem) => b.id - a.id
          );
          setGalleryData(sortedData);
          // update cache-busting token whenever gallery updates
          setCacheBust(Date.now());
        } catch (error) {
          console.error('Error fetching gallery:', error);
        }
      };

      // ---- Fetch queue status & refetch gallery when it changes ----
      const fetchQueueStatus = async () => {
        try {
          const url = `${backendUrl}/api/role/user/search-data/search-queue-by-event-and-qrcode`;
          const body = { event_code, qrcode };
          const { data } = await axios.post<QueueApiResponse>(url, body);

          let nextStatus: QueueStatus | null = null;
          let nextExists: boolean | null = null;

          if (data?.status === 'success') {
            if (data.exists) {
              nextExists = true;
              const qs = data.data?.queue_status;
              if (qs === 'pending' || qs === 'error' || qs === 'success') {
                nextStatus = qs;
              }
            } else {
              // Explicitly handled: queue not found -> hide progress card
              nextExists = false;
              nextStatus = null;
            }
          }

          const statusChanged = nextStatus !== prevQueueStatusRef.current;
          const existsChanged = nextExists !== prevQueueExistsRef.current;

          if (statusChanged || existsChanged) {
            setQueueStatus(nextStatus);
            setQueueExists(nextExists);
            prevQueueStatusRef.current = nextStatus;
            prevQueueExistsRef.current = nextExists;
            await fetchGallery();
          }
        } catch (error) {
          console.error('Error fetching queue status:', error);
          // Treat as error (unknown existence) — keep previous queueExists, but show error state
          if (prevQueueStatusRef.current !== 'error') {
            setQueueStatus('error');
            prevQueueStatusRef.current = 'error';
            await fetchGallery();
          }
        }
      };

      // Initial load
      fetchGallery();
      fetchQueueStatus();

      // Poll ONLY the queue endpoint; gallery refetches on status/exists changes
      intervalId = setInterval(() => {
        fetchQueueStatus();
      }, pollingInterval);
    }

    // Cleanup on unmount or param change
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [backendUrl, event_code, qrcode, pollingInterval]);

  // =======================
  // Actions — download ZIP for current event/qrcode
  // =======================
  const handleDownloadClick = () => setShowModal(true);

  const handleDownloadConfirm = async () => {
    try {
      if (event_code && qrcode) {
        setShowSpinner(true);

        sendEvent('download_gallery', {
          event_category: 'Gallery',
          event_label: `event_code: ${event_code}, qrcode: ${qrcode}`,
        });

        const url = `${backendUrl}/api/role/user/download/download-by-qrcode/${event_code}/${qrcode}`;
        const result = await axios.get(url, { responseType: 'blob' });

        const blobUrl = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', `gallery_${event_code}_${qrcode}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setShowSpinner(false);
      setShowModal(false);
    }
  };

  // =======================
  // Derived lists for rendering
  // =======================
  const videos = galleryData.filter((item) => item.file_name.endsWith('.mp4'));
  const qrcodeImages = galleryData.filter((item) => item.file_name === 'qrcode.jpg');
  const otherImages = galleryData.filter(
    (item) => !item.file_name.endsWith('.mp4') && item.file_name !== 'qrcode.jpg'
  );

  // Helper to build media URL with a cache-busting query param (changes when gallery refreshes)
  const buildMediaUrl = (item: GalleryItem) =>
    `${backendUrl}/storage/gallery/${item.event_code}/${item.qrcode}/${item.file_name}?t=${cacheBust}`;

  // Explicit show/hide rule:
  // - Show ONLY when a queue exists AND status is pending or error
  const showProgress = (queueExists !== false) && (queueStatus === 'pending' || queueStatus === 'error');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-10">
      {/* ======================= */}
      {/* Header — Brand / Logo  */}
      {/* ======================= */}
      <img src={logoProtoys1} alt="Protoys Logo" className="w-40 mb-6" />

      {/* ======================= */}
      {/* Divider — Header → Ads */}
      {/* ======================= */}
      <Separator />

      {/* ======================= */}
      {/* Advertisement Section   */}
      {/* ======================= */}
      {showAdvertisement && (
        <>
          <div className="flex flex-col items-center space-y-4 w-full max-w-xs mb-6">
            <img src={adv1} alt="Advertisement 1" className="w-full h-auto rounded-lg shadow-md object-cover" />
            <img src={adv2} alt="Advertisement 2" className="w-full h-auto rounded-lg shadow-md object-cover" />
            <img src={adv3} alt="Advertisement 3" className="w-full h-auto rounded-lg shadow-md object-cover" />
          </div>
          {/* Divider — Ads → Content */}
          <Separator />
        </>
      )}

      {/* ======================= */}
      {/* Queue Gate — Progress  */}
      {/* Show only when queue exists AND is pending or error */}
      {/* ======================= */}
      <CardProgressRandom
        show={showProgress}
        refreshToken={`${event_code}-${qrcode}-${queueStatus ?? 'none'}-${queueExists === false ? 'noqueue' : 'queue'}`}
        gifWidthPx={300}
        fontSizeClass="text-base"
        className="mb-6"
      />

      {/* ======================= */}
      {/* Gallery Content         */}
      {/* ======================= */}
      <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
        {/* Regular images */}
        {otherImages.map((item) => (
          <img
            key={item.id}
            src={buildMediaUrl(item)}
            alt="Gallery"
            className="w-full h-auto rounded-lg shadow-md object-cover"
          />
        ))}

        {/* QR code image (if any) */}
        {qrcodeImages.map((item) => (
          <img
            key={item.id}
            src={buildMediaUrl(item)}
            alt="QR Code"
            className="w-full h-auto rounded-lg shadow-md object-cover"
          />
        ))}

        {/* Videos */}
        {videos.map((item) => (
          <video key={item.id} className="w-full h-auto rounded-lg shadow-lg" controls autoPlay muted>
            <source src={buildMediaUrl(item)} type="video/mp4" />
          </video>
        ))}
      </div>

      {/* ======================= */}
      {/* Divider — Content → CTA */}
      {/* ======================= */}
      <Separator />

      {/* ======================= */}
      {/* CTA — Download ZIP      */}
      {/* ======================= */}
      <button onClick={handleDownloadClick} className="hover:opacity-80">
        <img src={icon_download} alt="Download" className="w-16" />
      </button>

      {/* ======================= */}
      {/* Divider — CTA → Social  */}
      {/* ======================= */}
      <Separator />

      {/* ======================= */}
      {/* Social Share (CardShareSocial) */}
      {/* ======================= */}
      <CardShareSocial
        pageUrl={`${backendUrl}/storage/gallery/${event_code}/${qrcode}/RenderImage1.jpg?t=${cacheBust}`}
        iconSizePx={56}
        className="mt-2"
        onShareClick={() =>
          sendEvent('share_facebook', { event_category: 'Gallery' })
        }
      />

      {/* ======================= */}
      {/* Divider — Social → Foot */}
      {/* ======================= */}
      <Separator />

      {/* ======================= */}
      {/* Modals                  */}
      {/* ======================= */}
      <ModalConfirmation show={showModal} onClose={() => setShowModal(false)} onConfirm={handleDownloadConfirm} />
      {showSpinner && <ModalLoading />}

      {/* ======================= */}
      {/* Footer                  */}
      {/* ======================= */}
      <footer className="text-center text-xs text-gray-600 mt-4">
        <strong>Special photo created by PRO-toys</strong>
        <div>www.protoys.online | LINE : @protoys | +66616169959</div>
      </footer>
    </div>
  );
};

export default GalleryOnePage;
