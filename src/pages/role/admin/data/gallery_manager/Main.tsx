// src/pages/role/admin/data/gallery_manager/Main.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../../../components/navbar/Navbar';
import SweetAlert2 from '../../../../../components/alert/SweetAlert2';
import TableGalleryManager from '../../../../../components/table/TableGalleryManager';
import {
  bulkDelete,
  bulkUpdateStatus,
  EventSummary,
  GalleryItem,
  getStats,
  listEvents,
  listItems,
  listQrcodesByEvent,
  Paginated,
  QrcodeSummary,
  renameFile,
  replaceFile,
  Stats,
  updateStatus,
  uploadToQrcode,
  buildPublicFileUrl,
} from '../../../../../services/galleryManagerService';

const Main: React.FC = () => {
  const navigate = useNavigate();

  const [eventCode, setEventCode] = useState('');
  const [qrcode, setQrcode] = useState('');
  const [type, setType] = useState<'all' | 'image' | 'video'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sort, setSort] = useState<'latest' | 'oldest' | 'name' | 'size'>('latest');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(40);

  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [qrcodes, setQrcodes] = useState<QrcodeSummary[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [pagination, setPagination] = useState<Paginated<GalleryItem>['pagination'] | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [preview, setPreview] = useState<{ url: string; file_name: string } | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState<{ open: boolean; item?: GalleryItem }>({ open: false });
  const [renameOpen, setRenameOpen] = useState<{ open: boolean; item?: GalleryItem }>({ open: false });
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [newName, setNewName] = useState('');

  const canBulk = selectedIds.length > 0;

  const refreshStats = async () => {
    try {
      setStats(await getStats({ event_code: eventCode || undefined, qrcode: qrcode || undefined }));
    } catch (e: any) {
      if (e?.response?.status === 401) {
        SweetAlert2.show('Session expired', 'Please login again.', 'warning');
        navigate('/role/admin/Login');
      }
    }
  };

  const refreshEvents = async () => {
    try {
      setEvents(await listEvents({ page: 1, per_page: 100, status: 'all' }));
    } catch {
      navigate('/role/admin/Login');
    }
  };

  const refreshQrcodes = async () => {
    if (!eventCode) return setQrcodes([]);
    try {
      setQrcodes(await listQrcodesByEvent(eventCode, { page: 1, per_page: 200, status: 'all' }));
    } catch {
      navigate('/role/admin/Login');
    }
  };

  const refreshItems = async () => {
    setLoading(true);
    setErr(null);
    try {
      const result = await listItems({
        event_code: eventCode || undefined,
        qrcode: qrcode || undefined,
        type,
        status,
        sort,
        page,
        per_page: perPage,
      });
      setItems(result.data);
      setPagination(result.pagination);
    } catch (e: any) {
      if (e?.response?.status === 401) navigate('/role/admin/Login');
      setErr(e?.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshEvents(); refreshStats(); }, []);
  useEffect(() => { setQrcodes([]); setQrcode(''); setPage(1); void refreshQrcodes(); }, [eventCode]);
  useEffect(() => { setPage(1); }, [type, status, sort, perPage]);
  useEffect(() => { void refreshItems(); void refreshStats(); }, [eventCode, qrcode, type, status, sort, page, perPage]);

  const togglePick = (id: number) => setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const pickAllOnPage = () => setSelectedIds(items.map((i) => i.id));
  const clearPicks = () => setSelectedIds([]);

  const onUpdateStatus = async (id: number, next: 'active' | 'inactive') => {
    await updateStatus(id, next);
    refreshItems();
  };

  const onBulkStatus = async (next: 'active' | 'inactive') => {
    await bulkUpdateStatus({ status: next, ids: selectedIds });
    clearPicks();
    refreshItems();
  };

  const onDelete = async (id: number, mode: 'soft' | 'hard') => {
    await bulkDelete({ mode, ids: [id] });
    refreshItems();
  };

  const onBulkDelete = async (mode: 'soft' | 'hard') => {
    await bulkDelete({ mode, ids: selectedIds });
    clearPicks();
    refreshItems();
  };

  const onOpenPreview = (it: GalleryItem) => {
    setPreview({ url: buildPublicFileUrl(it.event_code, it.qrcode, it.file_name), file_name: it.file_name });
  };

  const onUpload = async (files: FileList | null) => {
    if (!files || !eventCode || !qrcode) return;
    await uploadToQrcode(eventCode, qrcode, files);
    setUploadOpen(false);
    refreshItems();
  };

  const onReplace = async () => {
    if (!replaceOpen.item || !replaceInputRef.current?.files?.[0]) return;
    const it = replaceOpen.item;
    await replaceFile(it.event_code, it.qrcode, it.file_name, replaceInputRef.current.files[0]);
    setReplaceOpen({ open: false });
    refreshItems();
  };

  const onRename = async () => {
    const it = renameOpen.item;
    if (!it || !newName.trim()) return;
    await renameFile(it.event_code, it.qrcode, it.file_name, newName.trim());
    setRenameOpen({ open: false });
    refreshItems();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">Gallery Manager</h1>

        <TableGalleryManager
          items={items}
          selectedIds={selectedIds}
          loading={loading}
          error={err}
          onTogglePick={togglePick}
          onPickAllOnPage={pickAllOnPage}
          onClearPicks={clearPicks}
          onOpenPreview={onOpenPreview}
          onUpdateStatus={onUpdateStatus}
          onClickReplace={(it) => setReplaceOpen({ open: true, item: it })}
          onClickRename={(it) => { setRenameOpen({ open: true, item: it }); setNewName(it.file_name); }}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default Main;
