// src/pages/role/user/gallery/GenerateQRCode.tsx
import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const GenerateQRCode: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [qrcode, setQrcode] = useState('');
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

  useEffect(() => {
    const code = searchParams.get('qrcode') || '';
    const event = searchParams.get('event_code') || 'DEMO_EVENT';
    const fullUrl = `${FRONTEND_URL}/role/user/gallery/GalleryOnePage/${event}/${code}`;
    setQrcode(code);
    setUrl(fullUrl);
  }, [searchParams, FRONTEND_URL]);

  const downloadQR = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode_${qrcode}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">🎉 QR Code ของคุณ</h1>

        {url ? (
          <>
            <div className="flex justify-center">
              <QRCodeCanvas value={url} size={256} includeMargin={true} />
            </div>
            <p className="mt-4 text-sm text-gray-700 break-words">{url}</p>

            <button
              onClick={downloadQR}
              className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              ⬇️ ดาวน์โหลด QR Code
            </button>

            <button
              onClick={() => navigate('/role/user/persons/FormPerson')}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🔄 กลับหน้าหลัก / Back to Home
            </button>
          </>
        ) : (
          <p className="text-gray-500">กำลังโหลด QR Code...</p>
        )}
      </div>
    </div>
  );
};

export default GenerateQRCode;
