// src/components/modal/ModalGrowing.tsx
import React from 'react';

type Props = {};

const ModalGrowing: React.FC<Props> = () => {
  return (
    <div
      role="status"
      className="inline-block w-8 h-8 bg-current rounded-full animate-ping"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default ModalGrowing;
