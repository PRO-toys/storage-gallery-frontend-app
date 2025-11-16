// src/pages/role/user/selfie/service/Search.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Search() {
  const nav = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backend = (import.meta.env.VITE_BACKEND_URL as string)?.replace(/\/+$/, '');

  const onSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${backend}/api/role/user/selfie/gallery/search-by-session`, {
        selfie_session_id: query,
      });

      const data = res.data?.data || [];
      if (data.length === 0) {
        setError('ไม่พบรายการสำหรับรหัสนี้');
        return;
      }

      // Navigate to Result page with data as state
      nav('/role/user/selfie/service/result', { state: { results: data, query } });
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || 'เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/10 backdrop-blur rounded-2xl p-6 sm:p-8 md:p-10 space-y-6 text-white">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">ค้นหาโค้ดของคุณ</h1>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ใส่รหัสโค้ดของคุณ"
          className="w-full px-4 py-3 sm:py-4 rounded-lg bg-white/20 backdrop-blur-sm placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-white"
        />

        {error && <div className="text-red-400 text-sm sm:text-base text-center">{error}</div>}

        <button
          onClick={onSearch}
          disabled={!query || loading}
          className="w-full py-3 sm:py-4 rounded-lg bg-white text-indigo-700 font-semibold hover:opacity-90 disabled:opacity-60 text-lg sm:text-xl"
        >
          {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
        </button>
      </div>
    </div>
  );
}
