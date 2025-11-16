// src/pages/role/user/selfie/Camera.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingHourglass from '../../../../components/loading/LoadingHourglass';

const SS_SESSION_UUID = 'SELFIE_SESSION_UUID';

export default function Camera() {
  const { station = '' } = useParams();
  const nav = useNavigate();
  const backend = (import.meta.env.VITE_BACKEND_URL as string)?.replace(/\/+$/, '');

  const [checking, setChecking] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const galleryPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ttlPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getSessionUuid = () => sessionStorage.getItem(SS_SESSION_UUID) || '';

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

  // Poll gallery for new files; if found -> go preview
  const pollGallery = useCallback(async () => {
    const sessionUuid = getSessionUuid();
    if (!sessionUuid) return;

    try {
      const url = `${backend}/api/role/user/selfie/gallery/read-by-session/${encodeURIComponent(sessionUuid)}`;
      const { data } = await axios.get(url);
      const items = data?.data || [];
      if (Array.isArray(items) && items.length > 0) {
        stopAllPolling();
        setPolling(false);
        nav(`/role/user/selfie/preview/${station}`);
      }
    } catch {
      // ignore; keep polling
    }
  }, [backend, station, nav]);

  // Periodically verify session not expired (every 5s)
  const pollTtl = useCallback(async () => {
    const sessionUuid = getSessionUuid();
    if (!sessionUuid) return;

    try {
      const url = `${backend}/api/role/user/selfie/session/read-by-uuid/${encodeURIComponent(sessionUuid)}`;
      const { data } = await axios.get(url);
      const remaining = data?.remaining_seconds ?? null;
      if (remaining !== null && Number(remaining) <= 0) {
        stopAllPolling();
        setPolling(false);
        alert('หมดเวลาเซสชันแล้ว กรุณาเริ่มใหม่');
        sessionStorage.removeItem(SS_SESSION_UUID);
        nav(`/role/user/selfie/tutorial/${station}`);
      }
    } catch {
      // if cannot read session, be safe and stop the flow
      stopAllPolling();
      setPolling(false);
      alert('ไม่สามารถตรวจสอบสถานะเซสชันได้ กรุณาเริ่มใหม่');
      sessionStorage.removeItem(SS_SESSION_UUID);
      nav(`/role/user/selfie/tutorial/${station}`);
    }
  }, [backend, station, nav]);

  const trigger = async () => {
    const sessionUuid = getSessionUuid();
    if (!station || !sessionUuid) {
      alert('เซสชันไม่ถูกต้อง กรุณาเริ่มใหม่');
      nav(`/role/user/selfie/tutorial/${station}`);
      return;
    }

    setError(null);
    setChecking(true);
    try {
      // 1) ask camera to capture
      await axios.post(`${backend}/api/role/user/selfie/camera/trigger`, {
        selfie_station_code: station,
      });

      // 2) start polling
      setPolling(true);

      // gallery polling: every 2s
      await pollGallery(); // immediate first hit
      galleryPollRef.current = setInterval(pollGallery, 2000);

      // ttl polling: every 5s (ensure hard TTL, no heartbeat)
      await pollTtl(); // immediate first check
      ttlPollRef.current = setInterval(pollTtl, 5000);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'สั่งถ่ายไม่สำเร็จ');
    } finally {
      setChecking(false);
    }
  };

  // Guard on mount: must have session uuid
  useEffect(() => {
    const uuid = getSessionUuid();
    if (!uuid) {
      nav(`/role/user/selfie/tutorial/${station}`);
    }
    return () => stopAllPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-6 text-white">
      <LoadingHourglass
        show={checking || polling}
        text={polling ? 'กำลังรอรูปจากกล้อง…' : 'กำลังสั่งถ่าย…'}
      />
      <div className="w-full max-w-lg bg-white/10 backdrop-blur rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">หน้ากล้อง</h1>
        <p className="text-center text-white/90">
          กด “ถ่ายตอนนี้” เพื่อให้กล้องทำงาน จากนั้นระบบจะรอให้ไฟล์อัปโหลดอัตโนมัติ
        </p>

        {error && (
          <div className="text-center text-red-200 bg-red-500/20 border border-red-400/40 rounded p-3">
            {error}
          </div>
        )}

        <button
          onClick={trigger}
          disabled={checking || polling}
          className="w-full py-4 rounded-lg bg-white text-indigo-700 text-lg font-semibold hover:opacity-90 disabled:opacity-60"
        >
          ถ่ายตอนนี้
        </button>

        <div className="text-xs opacity-80 text-center">สถานี: <b>{station || '-'}</b></div>
      </div>
    </div>
  );
}
