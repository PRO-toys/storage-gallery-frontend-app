// src/components/card/CardShareFaceBook.tsx
// ======================================================
// CardShareFaceBook — Facebook share button card with OG meta support
// ======================================================

// =======================
// Import dependencies
// =======================
import React, { memo } from "react";
import iconFacebook from "../../assets/images/ui/icon_facebook.png";

// =======================
// Props definition
// =======================
export interface CardShareFaceBookProps {
  /**
   * Public PAGE url to share.
   * ⚠️ This should be a page that contains proper Open Graph tags.
   */
  pageUrl: string;
  /** Optional Tailwind classes for wrapper */
  className?: string;
  /** Callback invoked when user clicks share */
  onShareClick?: () => void;
  /**
   * Icon size in pixels (default: 48px). Both width & height will be this value.
   */
  iconSizePx?: number;
}

// =======================
// Component
// =======================
const CardShareFaceBook: React.FC<CardShareFaceBookProps> = memo(
  ({ pageUrl, className = "", onShareClick, iconSizePx = 48 }) => {
    if (!pageUrl) return null;

    // Build the Facebook sharer URL — same as index.html demo
    const href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      pageUrl
    )}`;

    return (
      <div className={`flex items-center justify-center ${className}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full p-2 hover:opacity-90 active:opacity-80 transition"
          aria-label="Share on Facebook"
          onClick={onShareClick}
        >
          <img
            src={iconFacebook}
            alt="Share on Facebook"
            style={{ width: `${iconSizePx}px`, height: `${iconSizePx}px` }}
            className="select-none"
            draggable={false}
          />
        </a>
      </div>
    );
  }
);

export default CardShareFaceBook;
