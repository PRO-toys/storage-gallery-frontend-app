// src/components/card/CardProgressRandom.tsx
import React, { useMemo } from 'react';

// Import GIF assets
import progress1 from '../../assets/images/ui/progress1.gif';
import progress2 from '../../assets/images/ui/progress2.gif';
import progress3 from '../../assets/images/ui/progress3.gif';
import progress4 from '../../assets/images/ui/progress4.gif';
import progress5 from '../../assets/images/ui/progress5.gif';

interface CardProgressRandomProps {
  /** Show/hide the card (default: true) */
  show?: boolean;
  /** Optional override messages; if omitted, uses the default Thai set */
  messages?: string[];
  /** Change this value to re-randomize (e.g., a counter or a boolean) */
  refreshToken?: unknown;
  /** Tailwind classes to extend styling */
  className?: string;
  /** GIF width in pixels (default: 96px); height will auto adjust */
  gifWidthPx?: number;
  /** Font size in Tailwind classes (default: text-sm) */
  fontSizeClass?: string;
}

/** Utility: pick one random item from an array */
function getRandomItem<T>(items: T[]): T {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

const DEFAULT_MESSAGES = [
  'กำลังบรรเลงพู่กันดิจิทัล… รอสักครู่!',
  'ยานแม่กำลังส่งพิกเซลลงมา!',
  'รออีกนิด กำลังสวยให้!',
  'นั่งชิลๆ อีกนิด ภาพกำลังมา',
  'โรงงานภาพทำงานเต็มกำลัง!',
  'Processing แบบคูลๆ รอสักครู่!',
  'ภาพของคุณกำลังแต่งตัวอยู่… รอสักครู่แล้วจะพร้อมโชว์ตัว!',
];

const GIFS = [progress1, progress2, progress3, progress4, progress5];

const CardProgressRandom: React.FC<CardProgressRandomProps> = ({
  show = true,
  messages,
  refreshToken,
  className = '',
  gifWidthPx = 96,
  fontSizeClass = 'text-sm',
}) => {
  const activeMessages = messages && messages.length > 0 ? messages : DEFAULT_MESSAGES;

  // Re-pick when show toggles to true or when refreshToken changes
  const { randomGif, randomText } = useMemo(() => {
    return {
      randomGif: getRandomItem(GIFS),
      randomText: getRandomItem(activeMessages),
    };
  }, [show, refreshToken, activeMessages]);

  if (!show) return null;

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-lg flex flex-col items-center max-w-xs text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <img
        src={randomGif}
        alt="กำลังโหลด..."
        style={{ width: `${gifWidthPx}px`, height: 'auto' }}
        className="object-contain"
      />
      <p className={`mt-4 ${fontSizeClass} text-gray-700 font-medium`}>{randomText}</p>
    </div>
  );
};

export default CardProgressRandom;
