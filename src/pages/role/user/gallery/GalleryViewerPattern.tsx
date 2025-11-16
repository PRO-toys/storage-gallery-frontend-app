// src/pages/role/user/gallery/GalleryViewerPattern.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ModalLoading from '../../../../components/modal/ModalLoading';

interface GalleryItem {
  id: number;
  qrcode: string;
  file_name: string;
  event_code: string;
  updated_at: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

const GalleryViewerPattern: React.FC = () => {
  const { event_code } = useParams<{ event_code: string }>();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      const url = `${backendUrl}/api/role/user/read-data/read-gallery-by-event/${encodeURIComponent(event_code ?? '')}`;
      const res = await axios.get(url);
      if (res.data?.status === 'success' && Array.isArray(res.data.data)) {
        const videoItems: GalleryItem[] = res.data.data.filter((item: GalleryItem) =>
          /\.(mp4|webm|mov)$/i.test(item.file_name)
        );
        setVideos(videoItems);
      } else {
        setError(res.data?.message || 'Failed to load videos');
      }
    } catch (err) {
      console.error(err);
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 10000);
    return () => clearInterval(interval);
  }, [event_code]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <ModalLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-black text-red-500 flex items-center justify-center text-xl">
        {error}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="w-screen h-screen bg-black text-gray-400 flex items-center justify-center text-lg">
        No videos found
      </div>
    );
  }

  const randomVideo = videos[Math.floor(Math.random() * videos.length)];
  const videoUrl = `${backendUrl}/storage/gallery/${randomVideo.event_code}/${randomVideo.qrcode}/${randomVideo.file_name}?t=${Date.now()}`;

  return (
    <div className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <video
        src={videoUrl}
        className="w-full h-full object-cover aspect-[9/16]"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
      />
    </div>
  );
};

export default GalleryViewerPattern;
