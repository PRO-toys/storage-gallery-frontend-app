// src/components/card/CardShareLine.tsx
// src/components/card/CardShareLine.tsx
import React from 'react';
import lineIcon from '../../assets/images/ui/icon_line.png';

type Props = {
  shareUrl?: string;
  eventCode?: string;
  qrcode?: string;
  fileName?: string;
  iconSizePx?: number;
  className?: string;
  onAddClick?: () => void;
};

const CardShareLine: React.FC<Props> = ({
  shareUrl,
  eventCode = 'DEV',
  qrcode = 'A001',
  fileName = 'RenderImage1.jpg',
  iconSizePx = 56,
  className = '',
  onAddClick,
}) => {
  const basicId =
    String(import.meta.env.VITE_COMPONENT_CARD_SHARE_LINE_OA_BASIC_ID || '')
      .trim() || '@your_line_oa';

  const backend =
    String(import.meta.env.VITE_BACKEND_URL || '').trim() ||
    'http://127.0.0.1:8000';

  const enablePush =
    String(import.meta.env.VITE_COMPONENT_CARD_SHARE_LINE_IMAGE || 'OFF') ===
    'ON';

  const computedImageUrl =
    shareUrl || `${backend}/storage/gallery/${eventCode}/${qrcode}/${fileName}`;

  const addFriendHref = `https://line.me/R/ti/p/${encodeURIComponent(basicId)}`;
  const sizeStyle = { width: `${iconSizePx}px`, height: `${iconSizePx}px` };

  const handleAddClick = () => {
    onAddClick?.();
    if (enablePush) {
      const url = `${backend}/webhook-line/push-image`;
      const data = JSON.stringify({ image_url: computedImageUrl });
      if ('sendBeacon' in navigator) {
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: data,
          mode: 'no-cors',
        }).catch(() => {});
      }
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <a
        href={addFriendHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAddClick}
        aria-label="Add LINE Official Account"
        title={`Add LINE OA ${basicId}`}
        className="inline-flex items-center justify-center rounded-full p-2 hover:opacity-90 active:opacity-80 transition"
      >
        <img
          src={lineIcon}
          alt="LINE"
          style={sizeStyle}
          className="select-none"
          draggable={false}
        />
      </a>
    </div>
  );
};

export default CardShareLine;
