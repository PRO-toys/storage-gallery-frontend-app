// src/pages/role/user/inspiration/SelectInspirationImage.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SweetAlert2 from '../../../../components/inspiration/SweetAlert2';
import bg from '../../../../assets/images/role/user/inspiration/bg.png';

const SS_IMG_INDEX_KEY = 'INSPIRATION_SELECTED_IMAGE_INDEX';

const SelectInspirationImage: React.FC = () => {
  const nav = useNavigate();

  const items = useMemo(
    () => [
      '1. Believe you can and you’re halfway there.',
      '2. Don’t dream your life, live your dream.',
      '3. Stay hungry, stay foolish.',
    ],
    []
  );

  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const fromSS = sessionStorage.getItem(SS_IMG_INDEX_KEY);
    return fromSS ? Number(fromSS) : 0;
  });

  const onNext = () => {
    if (selectedIndex < 0 || selectedIndex >= items.length) {
      SweetAlert2.show('Validation', 'Please select an inspiration quote.', 'warning');
      return;
    }
    sessionStorage.setItem(SS_IMG_INDEX_KEY, String(selectedIndex));
    nav('/role/user/inspiration/SignaturePadImage');
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
        <div className="w-full max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-5">
          <h1 className="text-2xl font-bold mb-4 text-center">Choose Your Inspiration</h1>

          <div className="h-[60vh] max-h-[520px] overflow-y-auto pr-2 space-y-3">
            {items.map((label, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${
                  selectedIndex === idx ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedIndex(idx)}
              >
                <input
                  type="radio"
                  name="quoteImageIdx"
                  checked={selectedIndex === idx}
                  onChange={() => setSelectedIndex(idx)}
                  className="mt-1"
                />
                <span className="text-gray-900">{label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={onNext}
            className="mt-5 w-full py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectInspirationImage;
