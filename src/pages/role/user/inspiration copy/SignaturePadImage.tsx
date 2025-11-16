// src/pages/role/user/inspiration/SignaturePadImage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import SweetAlert2 from '../../../../components/inspiration/SweetAlert2';
import bg from '../../../../assets/images/role/user/inspiration/bg.png';
import q1 from '../../../../assets/images/role/user/inspiration/quotes/1.jpg';
import q2 from '../../../../assets/images/role/user/inspiration/quotes/2.jpg';
import q3 from '../../../../assets/images/role/user/inspiration/quotes/3.jpg';

const SS_IMG_INDEX_KEY = 'INSPIRATION_SELECTED_IMAGE_INDEX';
const SS_SIGN_IMG_KEY = 'INSPIRATION_SIGNATURE_IMAGE';

const SignaturePadImage: React.FC = () => {
  const nav = useNavigate();
  const signRef = useRef<SignatureCanvas | null>(null);
  const [imgIndex, setImgIndex] = useState<number>(0);

  useEffect(() => {
    const idxStr = sessionStorage.getItem(SS_IMG_INDEX_KEY);
    if (idxStr === null) {
      nav('/role/user/inspiration/SelectInspirationImage');
      return;
    }
    setImgIndex(Number(idxStr));
  }, [nav]);

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

  const previewSrc = [q1, q2, q3][imgIndex] ?? q1;

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

          {/* Small selected preview */}
          <div className="mb-4">
            <div className="w-full rounded-lg overflow-hidden border" style={{ aspectRatio: '16 / 9' }}>
              <img src={previewSrc} alt="selected" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-3">
            <div className="border rounded-lg overflow-hidden">
              <SignatureCanvas
                ref={signRef}
                penColor="black"
                canvasProps={{
                  className: 'w-full h-[220px] sm:h-[260px] md:h-[300px] bg-white touch-none',
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
        </div>
      </div>
    </div>
  );
};

export default SignaturePadImage;
