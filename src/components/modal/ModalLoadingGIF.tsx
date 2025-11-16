// src/components/modal/ModalLoadingGIF.tsx
import React from 'react';
import loadingGif from '../../assets/gifs/loading.gif';

const ModalLoadingGIF: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      style={{ width: '100vw', height: '100vh' }}
    >
      <img
        src={loadingGif}
        alt="Loading..."
        className="w-48 h-48 object-contain animate-pulse"
        draggable={false}
      />
    </div>
  );
};

export default ModalLoadingGIF;
