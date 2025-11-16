// src/pages/role/user/inspiration/viewer/InspirationViewer.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import LoadingHourglass from '../../../../../components/inspiration/LoadingHourglass';

interface GalleryItem {
  id: number;
  qrcode: string;
  file_name: string;
  event_code: string;
  updated_at: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
const POLL_INTERVAL_MS = Number(import.meta.env.VITE_INSPIRATION_VIEWER_POLL_MS ?? 10000);

const InspirationViewer: React.FC = () => {
  const { event_code } = useParams<{ event_code: string }>();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error(err);
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    const interval = setInterval(fetchImages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event_code]);

  if (loading) {
    return <LoadingHourglass show={true} text="Loading inspiration images..." />;
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-black text-red-500 flex items-center justify-center text-xl">
        {error}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-screen h-screen bg-black text-gray-400 flex items-center justify-center text-lg">
        No images found
      </div>
    );
  }

  const randomImage = images[Math.floor(Math.random() * images.length)];
  const imageUrl = `${backendUrl}/storage/gallery/${randomImage.event_code}/${randomImage.qrcode}/${randomImage.file_name}?t=${Date.now()}`;

  // Responsive 16:9 container
  const boxStyle: React.CSSProperties = {
    width: 'min(100vw, calc(100vh * 16 / 9))',
    height: 'min(100vh, calc(100vw * 9 / 16))',
  };

  return (
    <div className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <div className="relative bg-black" style={boxStyle}>
        <img
          src={imageUrl}
          alt={randomImage.file_name}
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default InspirationViewer;
