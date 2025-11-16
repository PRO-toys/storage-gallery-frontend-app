// src/pages/role/user/inspiration/SignaturePadImage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import SweetAlert2 from '../../../../components/inspiration/SweetAlert2';
import bg from '../../../../assets/images/role/user/inspiration/bg.png';

const SS_IMG_INDEX_KEY = 'INSPIRATION_SELECTED_IMAGE_INDEX';
const SS_SIGN_IMG_KEY = 'INSPIRATION_SIGNATURE_IMAGE';

type Inspiration = {
  id: number;
  file_name: string;
  quote?: string | null;
  public_url?: string | null;
};

const SignaturePadImage: React.FC = () => {
  const nav = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) || '';
  const signRef = useRef<SignatureCanvas | null>(null);

  const [imgIndex, setImgIndex] = useState<number>(0);
  const [items, setItems] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const idxStr = sessionStorage.getItem(SS_IMG_INDEX_KEY);
    if (!idxStr) {
      nav('/role/user/inspiration/SelectInspirationImage');
      return;
    }
    setImgIndex(Number(idxStr));

    const fetchInspirations = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await axios.get(`${backendUrl}/api/role/user/inspiration/read`);
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setItems(data);
      } catch (e: any) {
        console.error('Error fetching inspirations', e);
        setErr(e?.message || 'Failed to load inspiration image');
      } finally {
        setLoading(false);
      }
    };

    fetchInspirations();
  }, [nav, backendUrl]);

  const onClear = () => {
    signRef.current?.clear();
    SweetAlert2.toast('Signature cleared', 'info');
  };

  const onBack = () => {
    nav('/role/user/inspiration/SelectInspirationImage');
  };

  const onNext = () => {
    if (!signRef.current || signRef.current.isEmpty()) {
      SweetAlert2.show('Validation', 'Please sign your signature before continuing.', 'warning');
      return;
    }
    const dataUrl = signRef.current.getCanvas().toDataURL('image/png');
    sessionStorage.setItem(SS_SIGN_IMG_KEY, dataUrl);
    nav('/role/user/inspiration/PreviewInspirationImage');
  };

  const currentItem = items[imgIndex];
  const previewSrc = currentItem?.public_url || '';
  const quote = currentItem?.quote || '';

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
          <h1 className="text-2xl font-bold text-center mb-4">Sign Your Name</h1>

          {loading && (
            <div className="text-center py-10 text-gray-600">Loading image...</div>
          )}
          {!loading && err && (
            <div className="text-center text-red-600 py-6">{err}</div>
          )}

          {!loading && !err && currentItem && (
            <>
              {/* Preview image */}
              <div className="mb-4">
                <div
                  className="w-full rounded-lg overflow-hidden border"
                  style={{ aspectRatio: '16 / 9' }}
                >
                  {previewSrc ? (
                    <img
                      src={previewSrc}
                      alt={quote || currentItem.file_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
                      No preview available
                    </div>
                  )}
                </div>
              </div>

              {/* Quote */}
              {quote && (
                <p className="text-center text-lg italic mb-4 text-gray-800">
                  “{quote}”
                </p>
              )}

              {/* Signature pad */}
              <div className="bg-white rounded-xl border p-3">
                <div className="border rounded-lg overflow-hidden">
                  <SignatureCanvas
                    ref={signRef}
                    penColor="black"
                    canvasProps={{
                      className:
                        'w-full h-[220px] sm:h-[260px] md:h-[300px] bg-white touch-none',
                    }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                  <button
                    onClick={onBack}
                    className="flex-1 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={onClear}
                    className="flex-1 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    onClick={onNext}
                    className="flex-1 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignaturePadImage;
