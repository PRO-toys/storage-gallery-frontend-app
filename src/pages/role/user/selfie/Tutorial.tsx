// src/pages/role/user/selfie/Tutorial.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingHourglass from '../../../../components/loading/LoadingHourglass';

const SS_SESSION_UUID = 'SELFIE_SESSION_UUID';

export default function Tutorial() {
  const { station = '' } = useParams();
  const nav = useNavigate();
  const backend = (import.meta.env.VITE_BACKEND_URL as string)?.replace(/\/+$/, '');

  const [busy, setBusy] = useState(false);
  const [ttlSec, setTtlSec] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // 1) validate station + read TTL to display
  useEffect(() => {
    let mounted = true;
    (async () => {
      setErr(null);
      try {
        if (!station) {
          setErr('Invalid station');
          return;
        }
        // check station
        const chk = await axios.post(`${backend}/api/role/user/selfie/station/check-by-code`, { code: station });
        if (!chk.data?.exists) {
          setErr('ไม่พบสถานีนี้หรือไม่พร้อมใช้งาน');
          return;
        }
        // read station setting (TTL)
        const st = await axios.get(
          `${backend}/api/role/user/selfie/setting/read-by-station/${encodeURIComponent(station)}`
        );
        const sec = st.data?.effective?.ttl_seconds ?? st.data?.data?.effective?.ttl_seconds;
        if (mounted) setTtlSec(Number(sec) || 600);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || 'เกิดข้อผิดพลาด');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [backend, station]);

  // 2) start flow: create-session -> begin -> go camera
  const start = async () => {
    if (!station) return alert('Invalid station');

    setBusy(true);
    setErr(null);
    try {
      // create waiting session (TTL will be set by backend from setting)
      const created = await axios.post(`${backend}/api/role/user/selfie/session/create-session`, {
        selfie_station_code: station,
      });
      const sessionUuid = created.data?.data?.session_uuid;
      if (!sessionUuid) throw new Error('สร้างเซสชันไม่สำเร็จ');

      // begin (lock station)
      await axios.post(`${backend}/api/role/user/selfie/session/begin`, {
        session_uuid: sessionUuid,
      });

      // save uuid -> go camera
      sessionStorage.setItem(SS_SESSION_UUID, sessionUuid);
      nav(`/role/user/selfie/camera/${station}`);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'เกิดข้อผิดพลาดในการเริ่มเซสชัน';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-6 text-white">
      <LoadingHourglass show={busy} text="กำลังเริ่มเซสชัน..." />
      <div className="w-full max-w-lg bg-white/10 backdrop-blur rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">วิธีถ่ายรูป 3 ขั้นตอน</h1>

        {ttlSec !== null && (
          <div className="text-center text-white/90">
            คุณมีเวลา <b>{Math.ceil(ttlSec / 60)}</b> นาที ในการถ่ายและยืนยัน
          </div>
        )}

        {err && (
          <div className="text-center text-red-200 bg-red-500/20 border border-red-400/40 rounded p-3">
            {err}
          </div>
        )}

        <ol className="list-decimal pl-6 space-y-2 text-white/90">
          <li>ยืนตามจุดและเตรียมท่าทาง</li>
          <li>ไปหน้ากล้องแล้วกด “ถ่ายตอนนี้”</li>
          <li>ตรวจรูปตัวอย่างและกด “ยืนยัน” เพื่อจบ</li>
        </ol>

        <button
          onClick={start}
          disabled={busy || !!err}
          className="w-full py-3 rounded-lg bg-white text-indigo-700 font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'กำลังเริ่ม…' : 'พร้อมเริ่ม'}
        </button>

        <div className="text-xs opacity-80 text-center mt-2">
          สถานี: <b>{station || '-'}</b>
        </div>
      </div>
    </div>
  );
}
