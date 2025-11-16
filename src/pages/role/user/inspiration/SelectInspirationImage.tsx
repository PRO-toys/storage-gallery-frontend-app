// src/pages/role/user/inspiration/SelectInspirationImage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SweetAlert2 from '../../../../components/inspiration/SweetAlert2';
import bg from '../../../../assets/images/role/user/inspiration/bg.png';

const SS_IMG_INDEX_KEY = 'INSPIRATION_SELECTED_IMAGE_INDEX';

type Inspiration = {
  id: number;
  file_name: string;
  file_path: string;
  quote?: string | null;
  mime_type?: string | null;
  file_size_kb?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  public_url?: string | null;
};

const SelectInspirationImage: React.FC = () => {
  const nav = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) || '';

  const [items, setItems] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const fromSS = sessionStorage.getItem(SS_IMG_INDEX_KEY);
    return fromSS ? Number(fromSS) : 0;
  });

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setErr(null);
      try {
        const url = `${backendUrl}/api/role/user/inspiration/read`;
        const res = await axios.get(url);
        const data = Array.isArray(res.data?.data) ? res.data.data as Inspiration[] : [];
        if (!mounted) return;
        setItems(data);
        // ensure selectedIndex is valid
        if (data.length === 0) {
          setSelectedIndex(-1);
          sessionStorage.removeItem(SS_IMG_INDEX_KEY);
        } else {
          const prev = sessionStorage.getItem(SS_IMG_INDEX_KEY);
          const idx = prev ? Number(prev) : 0;
          const safeIdx = idx >= 0 && idx < data.length ? idx : 0;
          setSelectedIndex(safeIdx);
          sessionStorage.setItem(SS_IMG_INDEX_KEY, String(safeIdx));
        }
      } catch (e: any) {
        console.error('Failed to load inspirations', e);
        if (!mounted) return;
        setErr(e?.message || 'Failed to load inspirations');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [backendUrl]);

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
            {loading && (
              <div className="flex items-center justify-center py-10 text-gray-600">Loading...</div>
            )}

            {!loading && err && (
              <div className="text-center text-red-600 py-6">{err}</div>
            )}

            {!loading && !err && items.length === 0 && (
              <div className="text-center text-gray-700 py-6">No inspirations available.</div>
            )}

            {!loading &&
              items.map((item, idx) => {
                const label = item.quote ? item.quote : `${idx + 1}. ${item.file_name}`;
                const isSelected = selectedIndex === idx;
                return (
                  <label
                    key={item.id ?? idx}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${
                      isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedIndex(idx)}
                  >
                    <input
                      type="radio"
                      name="quoteImageIdx"
                      checked={isSelected}
                      onChange={() => setSelectedIndex(idx)}
                      className="mt-1"
                    />
                    <div className="flex-1 flex items-center gap-3">
                      {item.public_url ? (
                        <img
                          src={item.public_url}
                          alt={item.quote ?? item.file_name}
                          className="w-20 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = ''; // hide broken image
                          }}
                        />
                      ) : (
                        <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                      <span className="text-gray-900">{label}</span>
                    </div>
                  </label>
                );
              })}
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
