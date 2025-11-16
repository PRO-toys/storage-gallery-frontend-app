// src/components/modal/ModalLoading.tsx
import React from 'react';

const ModalLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">Loading...</h2>
        <p>Please wait while we load your content.</p>
      </div>
    </div>
  );
};

export default ModalLoading;
