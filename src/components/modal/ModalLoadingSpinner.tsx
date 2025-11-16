// src/components/modal/ModalLoading.tsx
import React from 'react';

type Props = {
  show?: boolean;
  text?: string;
};

export default function ModalLoading({ show = false, text = 'กำลังอัปโหลด…' }: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        <div className="text-white text-lg font-medium animate-pulse">{text}</div>
      </div>
    </div>
  );
}
