// src/components/modal/ModalProgressRandom.tsx
import React, { useMemo } from 'react';

// Import GIF assets
import progress1 from '../../assets/images/ui/progress1.gif';
import progress2 from '../../assets/images/ui/progress2.gif';
import progress3 from '../../assets/images/ui/progress3.gif';
import progress4 from '../../assets/images/ui/progress4.gif';
import progress5 from '../../assets/images/ui/progress5.gif';

interface ModalProgressRandomProps {
  show: boolean;
}

// Utility function: pick one random item from an array
function getRandomItem<T>(items: T[]): T {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

const ModalProgressRandom: React.FC<ModalProgressRandomProps> = ({ show }) => {
  // Define gifs and texts
  const gifs = [progress1, progress2, progress3, progress4, progress5];
  const texts = [
    'กำลังบรรเลงพู่กันดิจิทัล… รอสักครู่!',
    'ยานแม่กำลังส่งพิกเซลลงมา!',
    'รออีกนิด กำลังสวยให้!',
    'นั่งชิลๆ อีกนิด ภาพกำลังมา',
    'โรงงานภาพทำงานเต็มกำลัง!',
    'Processing แบบคูลๆ รอสักครู่!',
    'ภาพของคุณกำลังแต่งตัวอยู่… รอสักครู่แล้วจะพร้อมโชว์ตัว!'
  ];

  // Pick random gif & text once when modal is shown
  const { randomGif, randomText } = useMemo(() => {
    return {
      randomGif: getRandomItem(gifs),
      randomText: getRandomItem(texts)
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center max-w-xs text-center">
        <img src={randomGif} alt="Loading..." className="w-24 h-24 object-contain" />
        <p className="mt-4 text-sm text-gray-700 font-medium">{randomText}</p>
      </div>
    </div>
  );
};

export default ModalProgressRandom;
