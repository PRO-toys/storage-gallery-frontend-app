// src/pages/role/user/gallery/GalleryOnePage.tsx
// =======================
// Import dependencies
// =======================
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Static assets
import logoProtoys1 from '../../../../assets/images/role/user/onepage/logo_protoys1.png';
import icon_download from '../../../../assets/images/role/user/onepage/icon_download.png';
import icon_facebook from '../../../../assets/images/role/user/onepage/icon_facebook.png';
import icon_line from '../../../../assets/images/role/user/onepage/icon_line.png';

// Advertisement images
import adv1 from '../../../../assets/advertisement/images/adv_1.png';
import adv2 from '../../../../assets/advertisement/images/adv_2.png';
import adv3 from '../../../../assets/advertisement/images/adv_3.png';

// Components
import ModalConfirmation from '../../../../components/modal/ModalConfirmation';
import ModalLoading from '../../../../components/modal/ModalLoading';

// Google Analytics
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

// Small reusable separator
const Separator: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`w-full max-w-xs border-t border-gray-300 my-6 ${className}`} />
);

// =======================
// Component
// =======================
const GalleryOnePage: React.FC = () => {
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const { event_code, qrcode } = useParams<{ event_code?: string; qrcode?: string }>();

  const showAdvertisement = import.meta.env.VITE_ADVERTISEMENT_MODE === 'ON';
  const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
  const shareUrl = `${import.meta.env.VITE_FRONTEND_URL}/role/user/gallery/GalleryOnePage/${event_code}/${qrcode}`;

  useEffect(() => {
    if (event_code && qrcode) {
      initGA();
      sendPageView(`/role/user/gallery/GalleryOnePage/${event_code}/${qrcode}`);

      const fetchData = async () => {
        try {
          const url = `${backendUrl}/api/role/user/read-data/read-gallery-by-event-and-qrcode/${event_code}/${qrcode}`;
          const response = await axios.get(url);
          const sortedData = response.data.data.sort((a: GalleryItem, b: GalleryItem) => b.id - a.id);
          setGalleryData(sortedData);
        } catch (error) {
          console.error('Error fetching gallery:', error);
        }
      };

      fetchData();
    }
  }, [event_code, qrcode]);

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

  const videos = galleryData.filter((item) => item.file_name.endsWith('.mp4'));
  const qrcodeImages = galleryData.filter((item) => item.file_name === 'qrcode.jpg');
  const otherImages = galleryData.filter((item) => !item.file_name.endsWith('.mp4') && item.file_name !== 'qrcode.jpg');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
      <img src={logoProtoys1} alt="Protoys Logo" className="w-40 mb-6" />

      {/* Separator between Logo and Ads */}
      <Separator />

      {/* Advertisement Section */}
      {showAdvertisement && (
        <>
          <div className="flex flex-col items-center space-y-4 w-full max-w-xs mb-6">
            <img src={adv1} alt="Advertisement 1" className="w-full h-auto rounded-lg shadow-md object-cover" />
            <img src={adv2} alt="Advertisement 2" className="w-full h-auto rounded-lg shadow-md object-cover" />
            <img src={adv3} alt="Advertisement 3" className="w-full h-auto rounded-lg shadow-md object-cover" />
          </div>
          {/* Separator between Ads and Gallery */}
          <Separator />
        </>
      )}

      {/* Gallery Section */}
      <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
        {otherImages.map((item) => (
          <img
            key={item.id}
            src={`${backendUrl}/storage/gallery/${item.event_code}/${item.qrcode}/${item.file_name}`}
            alt="Gallery"
            className="w-full h-auto rounded-lg shadow-md object-cover"
          />
        ))}

        {qrcodeImages.map((item) => (
          <img
            key={item.id}
            src={`${backendUrl}/storage/gallery/${item.event_code}/${item.qrcode}/${item.file_name}`}
            alt="QR Code"
            className="w-full h-auto rounded-lg shadow-md object-cover"
          />
        ))}

        {videos.map((item) => (
          <video key={item.id} className="w-full h-auto rounded-lg shadow-lg" controls autoPlay muted>
            <source src={`${backendUrl}/storage/gallery/${item.event_code}/${item.qrcode}/${item.file_name}`} type="video/mp4" />
          </video>
        ))}
      </div>

      {/* Separator between Gallery and Download */}
      <Separator />

      {/* Download Button */}
      <button onClick={handleDownloadClick} className="hover:opacity-80">
        <img src={icon_download} alt="Download" className="w-16" />
      </button>

      {/* Separator between Download and Share */}
      <Separator />

      {/* Share Buttons */}
      {/* <div className="flex space-x-6 mt-2">
        <a
          href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
          onClick={() => sendEvent('share_line')}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={icon_line} alt="Share LINE" className="w-12 h-12" />
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          onClick={() => sendEvent('share_facebook')}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={icon_facebook} alt="Share Facebook" className="w-12 h-12" />
        </a>
      </div> */}

      {/* Separator between Share and Footer */}
      <Separator />

      {/* Modals */}
      <ModalConfirmation show={showModal} onClose={() => setShowModal(false)} onConfirm={handleDownloadConfirm} />
      {showSpinner && <ModalLoading />}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-600 mt-4">
        <strong>Special photo created by PRO-toys</strong>
        <div>www.protoys.online | LINE : @protoys | +66616169959</div>
      </footer>
    </div>
  );
};

export default GalleryOnePage;
