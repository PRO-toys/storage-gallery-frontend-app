// src/pages/role/user/inspiration/PreviewInspirationImage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import SweetAlert2 from '../../../../components/inspiration/SweetAlert2';
import bg from '../../../../assets/images/role/user/inspiration/bg.png';
import q1 from '../../../../assets/images/role/user/inspiration/quotes/1.jpg';
import q2 from '../../../../assets/images/role/user/inspiration/quotes/2.jpg';
import q3 from '../../../../assets/images/role/user/inspiration/quotes/3.jpg';

// services/utils
import { uploadGallery } from '../../../../services/inspiration/api.gallery';
import { generateQRCodeText } from '../../../../utils/inspiration/generateQRCodeText';

const SS_IMG_INDEX_KEY = 'INSPIRATION_SELECTED_IMAGE_INDEX';
const SS_SIGN_IMG_KEY = 'INSPIRATION_SIGNATURE_IMAGE';

const ENABLE_SIGNATURE_DRAG = true;
const SHOW_DOWNLOAD_BUTTON = false;

type PosPct = { x: number; y: number };
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

// read .env inspirations
const INSPIRATION_USERNAME = String(import.meta.env.VITE_INSPIRATION_USER_NAME ?? 'admin');
const INSPIRATION_EVENT_TYPE = String(import.meta.env.VITE_INSPIRATION_EVENT_TYPE ?? 'temporary');
const INSPIRATION_EVENT_CODE = String(import.meta.env.VITE_INSPIRATION_EVENT_CODE ?? 'INS_DEV');
const INSPIRATION_STATION_CODE = String(import.meta.env.VITE_INSPIRATION_STATION_CODE ?? 'INS_DEV');
const INSPIRATION_CAMERA_MODE = String(import.meta.env.VITE_INSPIRATION_CAMERA_MODE ?? 'INS_DEV');

const PreviewInspirationImage: React.FC = () => {
  const nav = useNavigate();
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [imgIndex, setImgIndex] = useState<number>(0);
  const [signature, setSignature] = useState<string | null>(null);
  const [sigPos, setSigPos] = useState<PosPct>({ x: 50, y: 80 }); // default: centered near bottom
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const idxStr = sessionStorage.getItem(SS_IMG_INDEX_KEY);
    const sig = sessionStorage.getItem(SS_SIGN_IMG_KEY);
    if (idxStr === null || !sig) {
      nav('/role/user/inspiration/SelectInspirationImage');
      return;
    }
    setImgIndex(Number(idxStr));
    setSignature(sig);
  }, [nav]);

  const imgSrc = useMemo(() => {
    const arr = [q1, q2, q3];
    return arr[imgIndex] ?? arr[0];
  }, [imgIndex]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ENABLE_SIGNATURE_DRAG) return;
    e.preventDefault();
    setDragging(true);
  };
  const endDrag = () => setDragging(false);

  const moveDrag = (clientX: number, clientY: number, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;
    setSigPos({ x: clamp(x), y: clamp(y) });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    moveDrag(e.clientX, e.clientY, e.currentTarget as HTMLElement);
  };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const t = e.touches[0];
    if (!t) return;
    moveDrag(t.clientX, t.clientY, e.currentTarget as HTMLElement);
  };

  const frameStyle = useMemo(
    () => ({
      aspectRatio: '16 / 9',
      width: '100%',
      maxWidth: 1200,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,.18)',
      margin: '0 auto',
      backgroundColor: '#000',
    }),
    []
  );

  // helper: render stage to JPEG Blob (1920x1080)
  const renderStageToBlob = async (): Promise<Blob> => {
    if (!stageRef.current) throw new Error('Stage not available');
    const base = await html2canvas(stageRef.current, { backgroundColor: null, scale: 2 });
    const out = document.createElement('canvas');
    out.width = 1920;
    out.height = 1080;
    const ctx = out.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(base, 0, 0, out.width, out.height);

    return new Promise<Blob>((resolve, reject) => {
      out.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        },
        'image/jpeg',
        0.95
      );
    });
  };

  const onSend = async () => {
    try {
      setBusy(true);
      const blob = await renderStageToBlob();
      const filename = 'RenderImage1.jpg';

      const qrcode = generateQRCodeText();

      const form = new FormData();
      form.append('qrcode', qrcode);
      form.append('username', INSPIRATION_USERNAME);
      form.append('event_type', INSPIRATION_EVENT_TYPE);
      form.append('event_code', INSPIRATION_EVENT_CODE);
      form.append('station_code', INSPIRATION_STATION_CODE);
      form.append('camera_mode', INSPIRATION_CAMERA_MODE);
      form.append('files[]', blob, filename);

      const res = await uploadGallery(form);

      if (res?.status === 'success') {
        SweetAlert2.show('Sent', `Uploaded as ${filename} (QR: ${qrcode})`, 'success');
        nav('/role/user/inspiration/SelectInspirationImage');
      } else {
        SweetAlert2.show('Upload failed', res?.message || 'Unknown error', 'warning');
      }
    } catch (e: any) {
      SweetAlert2.show('Error', e?.message || 'Failed to send image', 'error');
    } finally {
      setBusy(false);
    }
  };

  const onDownload = async () => {
    if (!stageRef.current) return;
    const base = await html2canvas(stageRef.current, { backgroundColor: null, scale: 2 });
    const out = document.createElement('canvas');
    out.width = 1920;
    out.height = 1080;
    const ctx = out.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(base, 0, 0, out.width, out.height);
    }
    const link = document.createElement('a');
    link.href = out.toDataURL('image/jpeg', 0.95);
    link.download = 'RenderImage1.jpg';
    link.click();
    SweetAlert2.toast('Downloaded RenderImage1.jpg', 'success');
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-extrabold text-center mb-4 tracking-widest">PREVIEW (Image)</h1>

          <div
            ref={stageRef}
            style={frameStyle}
            className="relative select-none"
            onMouseMove={onMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onTouchMove={onTouchMove}
            onTouchEnd={endDrag}
          >
            <img
              src={imgSrc}
              alt="bg-quote"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {signature && (
              <img
                src={signature}
                alt="signature"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: `${sigPos.y}%`,
                  left: `${sigPos.x}%`,
                  width: '40%',
                  transform: 'translate(-50%, -50%)',
                  cursor: ENABLE_SIGNATURE_DRAG ? (dragging ? 'grabbing' : 'grab') : 'default',
                  touchAction: 'none',
                  filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.15))',
                }}
                className={ENABLE_SIGNATURE_DRAG ? 'ring-offset-2' : ''}
                onMouseDown={startDrag}
                onTouchStart={startDrag}
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-5 max-w-2xl mx-auto">
            <button
              onClick={() => nav('/role/user/inspiration/SignaturePadImage')}
              className="flex-1 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold disabled:opacity-60"
              disabled={busy}
            >
              Back
            </button>
            <button
              onClick={onSend}
              className="flex-1 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-md disabled:opacity-60"
              disabled={busy}
            >
              {busy ? 'Sending…' : 'Send'}
            </button>
            {SHOW_DOWNLOAD_BUTTON && (
              <button
                onClick={onDownload}
                className="flex-1 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-md disabled:opacity-60"
                disabled={busy}
              >
                Download (1920×1080)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewInspirationImage;
