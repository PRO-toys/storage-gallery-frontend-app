// src/pages/role/user/selfie/Preview.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingHourglass from '../../../../components/loading/LoadingHourglass';

const SS_SESSION_UUID = 'SELFIE_SESSION_UUID';
const SS_SELECTED_FILE = 'SELFIE_SELECTED_FILE';
const WATERMARK_RE = /WaterMarkRenderImage\.jpg$/i;

type GalleryItem = {
  id: number;
  selfie_station_id: string;
  selfie_session_id: string;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function Preview() {
  const { station = '' } = useParams();
  const nav = useNavigate();
  const backend = (import.meta.env.VITE_BACKEND_URL as string)?.replace(/\/+$/, '');

  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [ending, setEnding] = useState(false);

  const galleryPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ttlPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sessionUuid = sessionStorage.getItem(SS_SESSION_UUID) || '';

  const stopAllPolling = () => {
    if (galleryPollRef.current) {
      clearInterval(galleryPollRef.current);
      galleryPollRef.current = null;
    }
    if (ttlPollRef.current) {
      clearInterval(ttlPollRef.current);
      ttlPollRef.current = null;
    }
  };

  const cleanupAndBack = () => {
    sessionStorage.removeItem(SS_SESSION_UUID);
    sessionStorage.removeItem(SS_SELECTED_FILE);
    nav(`/role/user/selfie/tutorial/${station}`);
  };

  const fetchGallery = useCallback(async () => {
    if (!sessionUuid) return;
    try {
      const url = `${backend}/api/role/user/selfie/gallery/read-by-session/${encodeURIComponent(sessionUuid)}`;
      const { data } = await axios.get(url);
      const list: GalleryItem[] = Array.isArray(data?.data) ? data.data : [];

      const wm = list.filter((it) => WATERMARK_RE.test(it.file_name));

      setItems(wm);
      if (wm.length > 0) {
        const last = wm[0]?.id > wm[wm.length - 1]?.id ? wm[0] : wm[wm.length - 1];
        setSelected(last);
        setPolling(false);
        stopAllPolling();
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [backend, sessionUuid]);

  const pollTtl = useCallback(async () => {
    if (!sessionUuid) return;
    try {
      const url = `${backend}/api/role/user/selfie/session/read-by-uuid/${encodeURIComponent(sessionUuid)}`;
      const { data } = await axios.get(url);
      const remaining = data?.remaining_seconds ?? null;
      if (remaining !== null && Number(remaining) <= 0) {
        stopAllPolling();
        alert('หมดเวลาเซสชันแล้ว กรุณาเริ่มใหม่');
        cleanupAndBack();
      }
    } catch {
      stopAllPolling();
      alert('ไม่สามารถตรวจสอบสถานะเซสชันได้ กรุณาเริ่มใหม่');
      cleanupAndBack();
    }
  }, [backend, sessionUuid]);

  useEffect(() => {
    if (!sessionUuid) {
      nav(`/role/user/selfie/tutorial/${station}`);
      return;
    }
    setLoading(true);
    setPolling(true);
    fetchGallery();
    galleryPollRef.current = setInterval(fetchGallery, 2000);
    pollTtl();
    ttlPollRef.current = setInterval(pollTtl, 5000);

    return () => stopAllPolling();
  }, [sessionUuid, station, nav, fetchGallery, pollTtl]);

  const filePublicUrl = (it: GalleryItem | null) =>
    it
      ? `${backend}/storage/gallery/selfie/${encodeURIComponent(it.selfie_station_id)}/${encodeURIComponent(
          it.selfie_session_id
        )}/${encodeURIComponent(it.file_name)}`
      : '';

  const onUseThis = () => {
    if (!selected) {
      setError('ยังไม่พบไฟล์ตัวอย่าง');
      return;
    }
    sessionStorage.setItem(SS_SELECTED_FILE, selected.file_name);
    nav(`/role/user/selfie/summary/${station}`);
  };

  const onCancel = async () => {
    if (!sessionUuid) {
      cleanupAndBack();
      return;
    }
    setEnding(true);
    setError(null);
    try {
      await axios.post(`${backend}/api/role/user/selfie/session/end`, {
        session_uuid: sessionUuid,
      });
    } catch {
      // ignore errors on cancel
    } finally {
      setEnding(false);
      cleanupAndBack();
    }
  };

  const renderPreview = () => {
    if (!selected) {
      return (
        <div className="text-center text-white/80">
          {polling ? 'กำลังรอไฟล์จากกล้อง…' : 'ยังไม่พบไฟล์'}
        </div>
      );
    }

    const url = filePublicUrl(selected);
    const isVideo = /\.(mp4)$/i.test(selected.file_name);

    return (
      <div className="w-full">
        <div className="rounded-xl overflow-hidden shadow-lg bg-black/30">
          {isVideo ? (
            <video src={url} className="w-full h-auto" controls />
          ) : (
            <img src={url} alt="preview" className="w-full h-auto object-contain" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-6 text-white">
      <LoadingHourglass show={loading || polling || ending} text={ending ? 'กำลังยกเลิกเซสชัน…' : polling ? 'กำลังรอไฟล์จากกล้อง…' : 'กำลังโหลด…'} />

      <div className="w-full max-w-3xl bg-white/10 backdrop-blur rounded-2xl p-6 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">PREVIEW</h1>

        {error && (
          <div className="text-center text-red-200 bg-red-500/20 border border-red-400/40 rounded p-3">
            {error}
          </div>
        )}

        {renderPreview()}

        <button
          onClick={onUseThis}
          disabled={!selected}
          className="w-full py-3 rounded-lg bg-white text-indigo-700 font-semibold hover:opacity-90 disabled:opacity-60"
        >
          ยืนยัน
        </button>

        <button
          onClick={onCancel}
          disabled={ending}
          className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold hover:opacity-90 disabled:opacity-60"
        >
          ยกเลิก
        </button>

        {items.length > 1 && (
          <div className="mt-4">
            <div className="text-sm mb-2 opacity-80">ไฟล์ทั้งหมดในเซสชันนี้</div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {items.map((it) => {
                const url = filePublicUrl(it);
                const isVideo = /\.(mp4)$/i.test(it.file_name);
                const active = selected?.id === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => setSelected(it)}
                    className={`rounded-lg overflow-hidden border ${
                      active ? 'border-white' : 'border-white/20'
                    } hover:border-white`}
                  >
                    {isVideo ? (
                      <div className="aspect-square grid place-items-center text-xs">MP4</div>
                    ) : (
                      <img src={url} alt="thumb" className="w-full aspect-square object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-xs opacity-80 text-center">
          สถานี: <b>{station || '-'}</b>
        </div>
      </div>
    </div>
  );
}
