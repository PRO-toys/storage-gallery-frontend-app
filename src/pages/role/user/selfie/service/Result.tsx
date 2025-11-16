// src/pages/role/user/selfie/service/Result.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

interface GalleryItem {
  id: number;
  selfie_station_id: string;
  selfie_session_id: string;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
  expired_at: string | null;
  is_expired: boolean;
}

export default function Result() {
  const nav = useNavigate();
  const location = useLocation();
  const [copying, setCopying] = useState(false);

  const backend = (import.meta.env.VITE_BACKEND_URL as string)?.replace(/\/+$/, '');

  const { results = [], query = '' } = (location.state || {}) as { results: GalleryItem[]; query: string };

  const watermarkedResults = results.filter((r) => /WaterMarkRenderImage\.jpg$/i.test(r.file_name));

  const fileUrl = (item: GalleryItem) =>
    `${backend}/storage/gallery/selfie/${encodeURIComponent(item.selfie_station_id)}/${encodeURIComponent(
      item.selfie_session_id
    )}/${encodeURIComponent(item.file_name)}`;

  const copySessionCode = async () => {
    if (!query) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(query);
      await Swal.fire({
        icon: 'success',
        title: 'คัดลอกแล้ว',
        text: 'โค้ดของคุณถูกคัดลอกไปแล้ว',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      await Swal.fire({ icon: 'error', title: 'คัดลอกไม่สำเร็จ' });
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-4 sm:p-6 md:p-8 text-white">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">ผลลัพธ์การค้นหา</h1>

        <div className="text-center text-white/80 text-sm sm:text-base">
          ผลลัพธ์สำหรับ: <b>{query}</b>
        </div>

        {/* Copy session code section */}
        <div className="bg-white/5 p-3 rounded-lg flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs opacity-80 mb-1">โค้ดของคุณ</div>
            <div className="truncate text-sm font-mono bg-white/10 p-2 rounded">{query || '-'}</div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={copySessionCode}
              disabled={!query || copying}
              className="px-3 py-2 rounded bg-white text-indigo-700 font-semibold disabled:opacity-60"
            >
              {copying ? 'กำลังคัดลอก...' : 'คัดลอก'}
            </button>
          </div>
        </div>

        {watermarkedResults.length === 0 && (
          <div className="text-center text-white/70 text-base sm:text-lg">ไม่พบรายการสำหรับรหัสนี้</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
          {watermarkedResults.map((r) => (
            <div
              key={r.id}
              className={`bg-white/10 backdrop-blur rounded-xl p-2 sm:p-4 cursor-pointer hover:bg-white/20 transition ${
                r.is_expired ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={() =>
                !r.is_expired &&
                nav(`/role/user/selfie/preview/${r.selfie_station_id}`, { state: { selectedId: r.id } })
              }
            >
              {r.is_expired ? (
                <div className="flex items-center justify-center h-48 text-red-400 font-semibold text-center">
                  หมดอายุแล้ว
                </div>
              ) : (
                <img
                  src={fileUrl(r)}
                  alt="preview"
                  className="w-full h-48 sm:h-56 md:h-64 object-contain rounded-md border border-white/20"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => nav(-1)}
          className="mt-4 w-full py-3 sm:py-4 rounded-lg bg-white text-indigo-700 font-semibold hover:opacity-90 text-lg sm:text-xl"
        >
          กลับ
        </button>
      </div>
    </div>
  );
}
