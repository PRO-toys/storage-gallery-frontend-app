// src/pages/role/user/selfie/Summary.tsx
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
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

export default function Summary() {
  const { station = '' } = useParams();
  const nav = useNavigate();
  const backend = (import.meta.env.VITE_BACKEND_URL as string)?.replace(/\/+$/, '');

  const sessionUuid = sessionStorage.getItem(SS_SESSION_UUID) || '';
  const selectedFileName = sessionStorage.getItem(SS_SELECTED_FILE) || '';

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [copying, setCopying] = useState(false);

  const publicUrl = (it: GalleryItem) =>
    `${backend}/storage/gallery/selfie/${encodeURIComponent(it.selfie_station_id)}/${encodeURIComponent(
      it.selfie_session_id
    )}/${encodeURIComponent(it.file_name)}`;

  const fetchAll = useCallback(async () => {
    if (!sessionUuid) return;
    try {
      const url = `${backend}/api/role/user/selfie/gallery/read-by-session/${encodeURIComponent(sessionUuid)}`;
      const { data } = await axios.get(url);
      const list: GalleryItem[] = Array.isArray(data?.data) ? data.data : [];

      const wm = list.filter((it) => WATERMARK_RE.test(it.file_name));
      setFiles(wm);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'ดึงรายการไฟล์ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [backend, sessionUuid]);

  const checkTtl = useCallback(async () => {
    if (!sessionUuid) return;
    try {
      const url = `${backend}/api/role/user/selfie/session/read-by-uuid/${encodeURIComponent(sessionUuid)}`;
      const { data } = await axios.get(url);
      const remaining = data?.remaining_seconds ?? null;
      if (remaining !== null && Number(remaining) <= 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'หมดเวลาเซสชัน',
          text: 'กรุณาเริ่มใหม่',
          confirmButtonText: 'ตกลง',
        });
        cleanupAndBack();
      }
    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถตรวจสอบสถานะเซสชันได้',
        text: 'กรุณาเริ่มใหม่',
        confirmButtonText: 'ตกลง',
      });
      cleanupAndBack();
    }
  }, [backend, sessionUuid]);

  const cleanupAndBack = () => {
    sessionStorage.removeItem(SS_SESSION_UUID);
    sessionStorage.removeItem(SS_SELECTED_FILE);
    nav(`/role/user/selfie/tutorial/${station}`);
    nav(`/role/user/selfie/service/search`);
  };

  useEffect(() => {
    if (!sessionUuid) {
      nav(`/role/user/selfie/tutorial/${station}`);
      nav(`/role/user/selfie/service/search`);
      return;
    }
    (async () => {
      await checkTtl();
      await fetchAll();
    })();
  }, [sessionUuid, checkTtl, fetchAll, nav, station]);

  const finish = async () => {
    if (!sessionUuid) return cleanupAndBack();
    setEnding(true);
    setError(null);
    try {
      await axios.post(`${backend}/api/role/user/selfie/session/end`, {
        session_uuid: sessionUuid,
      });
      await Swal.fire({
        icon: 'success',
        title: 'เสร็จสิ้น',
        text: 'ขอบคุณที่ใช้บริการ 🙌',
        confirmButtonText: 'ตกลง',
      });
      cleanupAndBack();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'ปิดเซสชันไม่สำเร็จ';
      setError(msg);
      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: msg,
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setEnding(false);
    }
  };

  const copySessionCode = async () => {
    if (!sessionUuid) return;
    setCopying(true);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(sessionUuid);
      } else {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = sessionUuid;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      await Swal.fire({
        icon: 'success',
        title: 'คัดลอกแล้ว',
        text: 'โค้ดเซสชันถูกคัดลอกไปแล้ว',
        timer: 1400,
        showConfirmButton: false,
      });
    } catch {
      await Swal.fire({ icon: 'error', title: 'คัดลอกไม่สำเร็จ' });
    } finally {
      setCopying(false);
    }
  };

  const mainItem =
    files.find((f) => f.file_name === selectedFileName && WATERMARK_RE.test(f.file_name)) ||
    (files.length ? files[files.length - 1] : null);

  const isVideo = mainItem ? /\.(mp4)$/i.test(mainItem.file_name) : false;

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-600 to-fuchsia-600 p-4 md:p-6 text-white">
      <LoadingHourglass show={loading || ending} text={ending ? 'กำลังปิดเซสชัน…' : 'กำลังโหลด…'} />

      <div className="w-full max-w-4xl bg-white/8 backdrop-blur rounded-2xl p-4 md:p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center">สรุป</h1>

        {error && (
          <div className="text-center text-sm md:text-base text-red-200 bg-red-500/20 border border-red-400/40 rounded p-3">
            {error}
          </div>
        )}

        {!loading && !mainItem && (
          <div className="text-center text-sm md:text-base text-white/80">ยังไม่พบไฟล์ กรุณาเริ่มใหม่</div>
        )}

        {mainItem && (
          <div className="rounded-xl overflow-hidden shadow-lg bg-black/30">
            <div className="w-full h-[280px] md:h-[420px] flex items-center justify-center bg-black">
              {isVideo ? (
                <video
                  src={publicUrl(mainItem)}
                  className="w-full h-full object-contain"
                  controls
                  aria-label="preview video"
                />
              ) : (
                <img
                  src={publicUrl(mainItem)}
                  alt="summary"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        )}

        {files.length > 1 && (
          <div>
            <div className="text-sm mb-2 opacity-80">ไฟล์ทั้งหมด</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {files.map((it) => {
                const url = publicUrl(it);
                const active = it.file_name === mainItem?.file_name;
                const isV = /\.(mp4)$/i.test(it.file_name);
                return (
                  <a
                    key={it.id}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className={`rounded-lg overflow-hidden border transition-colors duration-150 ${
                      active ? 'border-white' : 'border-white/20'
                    } hover:border-white`}
                    aria-label={`open file ${it.file_name}`}
                  >
                    {isV ? (
                      <div className="aspect-square grid place-items-center text-xs md:text-sm">MP4</div>
                    ) : (
                      <img src={url} alt="thumb" className="w-full aspect-square object-cover" loading="lazy" />
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Session code display + copy */}
        <div className="bg-white/5 p-3 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs opacity-80 mb-1">โค้ดของคุณ</div>
            <div
              className="truncate text-sm font-mono bg-white/10 p-2 rounded select-all break-all"
              title={sessionUuid || '-'}
              aria-live="polite"
            >
              {sessionUuid || '-'}
            </div>
          </div>

          <div className="flex-shrink-0 flex gap-2 sm:flex-col sm:items-end">
            <button
              onClick={copySessionCode}
              disabled={!sessionUuid || copying}
              className="px-3 py-2 rounded bg-white text-indigo-700 font-semibold disabled:opacity-60"
              aria-disabled={!sessionUuid || copying}
            >
              {copying ? 'กำลังคัดลอก...' : 'คัดลอก'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={finish}
            disabled={ending}
            className="w-full py-3 rounded-lg bg-white text-indigo-700 font-semibold hover:opacity-90 disabled:opacity-60"
          >
            เสร็จสิ้น
          </button>

          <div className="flex items-center justify-center text-xs opacity-80">
            สถานี: <b className="ml-2">{station || '-'}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
