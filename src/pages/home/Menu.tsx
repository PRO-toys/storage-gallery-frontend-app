// src/pages/home/Menu.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_EVENT_CODE: string = String(import.meta.env.VITE_EVENT_CODE ?? 'DEV');
const DEFAULT_QRCODE = 'A001';
const DEFAULT_VIDEO_ID = 'demo1';
const DEFAULT_STATION = 'S1';
const MENU_PASSWORD = String(import.meta.env.VITE_MENU_PASSWORD ?? '');

interface RouteItem {
  path: string;
  label: string;
  description: string;
}

const userRoutes: RouteItem[] = [
  // Gallery
  { path: `/role/user/gallery/GalleryOnePage/${DEFAULT_EVENT_CODE}/${DEFAULT_QRCODE}`, label: 'Gallery One Page', description: 'Single page view by event & QR code' },
  { path: `/role/user/gallery/GalleryViewer/${DEFAULT_EVENT_CODE}`, label: 'Gallery Viewer', description: 'Grid viewer of gallery by event code' },
  { path: `/role/user/gallery/GallerySlider/${DEFAULT_EVENT_CODE}`, label: 'Gallery Slider', description: 'Slideshow gallery for event' },
  { path: `/role/user/gallery/GalleryLiveFeedVertical/${DEFAULT_EVENT_CODE}`, label: 'Gallery Live Feed Vertical', description: 'Vertical live update gallery' },
  { path: `/role/user/gallery/GalleryLiveFeedHorizontal/${DEFAULT_EVENT_CODE}`, label: 'Gallery Live Feed Horizontal', description: 'Horizontal live update gallery' },
  { path: `/role/user/gallery/GalleryViewerPattern/${DEFAULT_EVENT_CODE}`, label: 'Gallery Viewer Pattern', description: 'Full-screen random video display (9:16)' },
  { path: '/role/user/gallery/GenerateQRCode', label: 'Generate QR Code', description: 'Generate QR codes for capture sessions' },

  // Forms
  { path: '/role/user/persons/FormPerson', label: 'Form Person', description: 'Form for creating or editing a person' },
  { path: '/role/user/companies/FormCompany', label: 'Form Company', description: 'Form for creating or editing a company' },
  { path: '/role/user/form/OpenHouse', label: 'Open House Register', description: 'Register company & person for event' },

  // Promotions
  { path: '/role/user/promotion_code/Claim', label: 'Claim Promotion Code', description: 'Claim and validate promo codes' },

  // Demos
  { path: '/role/user/demo/VR360Viewer', label: 'VR 360 Viewer', description: 'View immersive 360° content' },
  { path: '/role/user/demo/ARLocation', label: 'AR Location', description: 'Augmented reality location demo' },
  { path: `/role/user/demo/MultiChannel/${DEFAULT_VIDEO_ID}`, label: 'Multi Channel', description: 'Multi-screen live channel demo' },
  { path: '/role/user/demo/PhotoMobile', label: 'Photo Mobile', description: 'Mobile photo capture interface' },

  // Inspiration (Image Type)
  { path: '/role/user/inspiration/SelectInspirationImage', label: 'Inspiration Image · Select', description: 'Choose your inspirational image' },
  { path: '/role/user/inspiration/SignaturePadImage', label: 'Inspiration Image · Signature Pad', description: 'Draw your signature overlay' },
  { path: '/role/user/inspiration/PreviewInspirationImage', label: 'Inspiration Image · Preview', description: 'Preview image with draggable signature' },
  { path: `/role/user/inspiration/viewer/InspirationViewer/${DEFAULT_EVENT_CODE}`, label: 'Inspiration Viewer', description: 'Auto viewer for uploaded inspirations' },
  { path: `/role/user/inspiration/viewer/InspirationViewerAnimation/${DEFAULT_EVENT_CODE}`, label: 'Inspiration Viewer (Animation)', description: 'Grid viewer with stagger cross-fade' },
  { path: '/role/user/inspiration/upload/InspirationUpload', label: 'Inspiration Upload', description: 'Upload / replace inspiration images (admin)' },
];

const selfieRoutes: RouteItem[] = [
  { path: `/role/user/selfie/tutorial/${DEFAULT_STATION}`, label: 'Selfie Tutorial', description: 'Step-by-step guide before capture' },
  { path: `/role/user/selfie/camera/${DEFAULT_STATION}`, label: 'Selfie Camera', description: 'Take a photo via device camera' },
  { path: `/role/user/selfie/preview/${DEFAULT_STATION}`, label: 'Selfie Preview', description: 'Preview and confirm selfie' },
  { path: `/role/user/selfie/summary/${DEFAULT_STATION}`, label: 'Selfie Summary', description: 'Show session summary after capture' },
  { path: '/role/user/selfie/service/search', label: 'Selfie Search', description: 'Search for your selfie session' },
  { path: '/role/user/selfie/service/result', label: 'Selfie Result', description: 'View your selfie results' },
];

const Menu: React.FC = () => {
  const [authorized, setAuthorized] = useState(false);
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!MENU_PASSWORD) {
      setAuthorized(true);
      return;
    }
    if (pwd === MENU_PASSWORD) {
      setAuthorized(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center px-4">
        <form onSubmit={handleEnter} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Protected Menu</h1>
          <p className="text-gray-500 text-center mb-6">Enter the access password to continue</p>

          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-4 w-full py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-md"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-700 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-8 text-white text-center">User Routes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl w-full mb-12">
        {userRoutes.map(({ path, label, description }) => (
          <Link
            key={path}
            to={path}
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-800">{label}</h2>
            <p className="text-gray-600 flex-grow">{description}</p>
            <span className="mt-4 text-blue-600 font-medium underline">Go to page</span>
          </Link>
        ))}
      </div>

      <h2 className="text-3xl font-bold mb-6 text-white text-center">Selfie Routes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl w-full">
        {selfieRoutes.map(({ path, label, description }) => (
          <Link
            key={path}
            to={path}
            className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{label}</h3>
            <p className="text-gray-600 flex-grow">{description}</p>
            <span className="mt-4 text-blue-600 font-medium underline">Go to page</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Menu;
