// src/components/loading/LoadingHourglass.tsx
import React from 'react';
import hourglass from '../../assets/gifs/hourglass.gif';

type Props = {
  show?: boolean;
  text?: string;
};

const LoadingHourglass: React.FC<Props> = ({ show = false, text = 'Loading…' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <img
        src={hourglass}
        alt="Loading..."
        className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
      />
      <p className="text-white text-lg md:text-xl font-semibold mt-4 text-center animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default LoadingHourglass;
