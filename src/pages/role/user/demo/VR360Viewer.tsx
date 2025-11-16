// src/pages/role/user/demo/VR360Viewer.tsx
import React, { useEffect, useRef } from 'react';
import vr1Image from '../../../../assets/images/role/user/demo/vr/vr1.jpg';

const VR360Viewer: React.FC = () => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadScript = () => {
      return new Promise<void>((resolve) => {
        if ((window as any).pannellum) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.js';
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    const loadCss = () => {
      if (!document.getElementById('pannellum-css')) {
        const link = document.createElement('link');
        link.id = 'pannellum-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.css';
        document.head.appendChild(link);
      }
    };

    loadCss();
    loadScript().then(() => {
      if (viewerRef.current && (window as any).pannellum) {
        (window as any).pannellum.viewer(viewerRef.current, {
          type: 'equirectangular',
          panorama: vr1Image,  // Use imported image URL here
          autoLoad: true,
        });
      }
    });
  }, []);

  return (
    <div
      ref={viewerRef}
      style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}
      aria-label="360 degree image viewer"
    />
  );
};

export default VR360Viewer;
