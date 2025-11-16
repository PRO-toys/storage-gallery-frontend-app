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

  // Filters
  const [eventCode, setEventCode] = useState('');
  const [qrcode, setQrcode] = useState('');
  const [type, setType] = useState<'all' | 'image' | 'video'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sort, setSort] = useState<'latest' | 'oldest' | 'name' | 'size'>('latest');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(40);

  // Data
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [qrcodes, setQrcodes] = useState<QrcodeSummary[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [pagination, setPagination] = useState<Paginated<GalleryItem>['pagination'] | null>(null);

  // UI state
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

  // ==========================
  // Loaders
  // ==========================

  const refreshStats = async () => {
    try {
      // Stats can be filtered by event/qrcode, but this is relatively cheap.
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
    if (!eventCode) {
      setQrcodes([]);
      return;
    }
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
      // 🔹 Important: do NOT load any items until an event is selected
      if (!eventCode) {
        setItems([]);
        setPagination(null);
        return;
      }

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

  // ==========================
  // Effects
  // ==========================

  // Initial: load events + stats
  useEffect(() => {
    void refreshEvents();
    void refreshStats();
  }, []);

  // When event changes: reset qrcode + page, load qrcodes
  useEffect(() => {
    setQrcodes([]);
    setQrcode('');
    setPage(1);
    void refreshQrcodes();
  }, [eventCode]);

  // When filter options change: reset page
  useEffect(() => {
    setPage(1);
  }, [type, status, sort, perPage]);

  // When anything relevant changes: load items + stats
  useEffect(() => {
    void refreshItems();
    void refreshStats();
  }, [eventCode, qrcode, type, status, sort, page, perPage]);

  // ==========================
  // Selection & actions
  // ==========================

  const togglePick = (id: number) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const pickAllOnPage = () => setSelectedIds(items.map((i) => i.id));
  const clearPicks = () => setSelectedIds([]);

  const onUpdateStatus = async (id: number, next: 'active' | 'inactive') => {
    await updateStatus(id, next);
    void refreshItems();
  };

  const onBulkStatus = async (next: 'active' | 'inactive') => {
    await bulkUpdateStatus({ status: next, ids: selectedIds });
    clearPicks();
    void refreshItems();
  };

  const onDelete = async (id: number, mode: 'soft' | 'hard') => {
    await bulkDelete({ mode, ids: [id] });
    void refreshItems();
  };

  const onBulkDelete = async (mode: 'soft' | 'hard') => {
    await bulkDelete({ mode, ids: selectedIds });
    clearPicks();
    void refreshItems();
  };

  const onOpenPreview = (it: GalleryItem) => {
    setPreview({
      url: buildPublicFileUrl(it.event_code, it.qrcode, it.file_name),
      file_name: it.file_name,
    });
  };

  const onUpload = async (files: FileList | null) => {
    if (!files || !eventCode || !qrcode) return;
    await uploadToQrcode(eventCode, qrcode, files);
    setUploadOpen(false);
    void refreshItems();
  };

  const onReplace = async () => {
    if (!replaceOpen.item || !replaceInputRef.current?.files?.[0]) return;
    const it = replaceOpen.item;
    await replaceFile(it.event_code, it.qrcode, it.file_name, replaceInputRef.current.files[0]);
    setReplaceOpen({ open: false });
    void refreshItems();
  };

  const onRename = async () => {
    const it = renameOpen.item;
    if (!it || !newName.trim()) return;
    await renameFile(it.event_code, it.qrcode, it.file_name, newName.trim());
    setRenameOpen({ open: false });
    void refreshItems();
  };

  // ==========================
  // Render
  // ==========================

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-4">Gallery Manager</h1>

        {/* Filters */}
        <div className="mb-4 bg-white/10 backdrop-blur rounded-xl p-4 text-sm text-white space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Event filter (required) */}
            <div>
              <label className="block text-xs mb-1">Event</label>
              <select
                className="text-black rounded px-2 py-1 min-w-[180px]"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
              >
                <option value="">-- Select event first --</option>
                {events.map((ev) => (
                  <option key={ev.event_code} value={ev.event_code}>
                    {ev.event_code} ({ev.total})
                  </option>
                ))}
              </select>
            </div>

            {/* QR filter (depends on event) */}
            <div>
              <label className="block text-xs mb-1">QR Code</label>
              <select
                className="text-black rounded px-2 py-1 min-w-[180px]"
                value={qrcode}
                onChange={(e) => setQrcode(e.target.value)}
                disabled={!eventCode || qrcodes.length === 0}
              >
                <option value="">{!eventCode ? 'Select event first' : 'All QR codes'}</option>
                {qrcodes.map((qr) => (
                  <option key={qr.qrcode} value={qr.qrcode}>
                    {qr.qrcode} ({qr.total})
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs mb-1">Type</label>
              <select
                className="text-black rounded px-2 py-1"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs mb-1">Status</label>
              <select
                className="text-black rounded px-2 py-1"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs mb-1">Sort</label>
              <select
                className="text-black rounded px-2 py-1"
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name (A–Z)</option>
                <option value="size">Size (big first)</option>
              </select>
            </div>

            {/* Per page */}
            <div>
              <label className="block text-xs mb-1">Per page</label>
              <select
                className="text-black rounded px-2 py-1"
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                <option value={20}>20</option>
                <option value={40}>40</option>
                <option value={80}>80</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button
              className="ml-auto px-3 py-1 rounded bg-white/20 hover:bg-white/30 text-xs"
              onClick={() => {
                setPage(1);
                void refreshItems();
                void refreshStats();
              }}
            >
              Refresh
            </button>
          </div>

          {/* Stats summary */}
          {stats && (
            <div className="flex flex-wrap gap-4 text-xs">
              <div>Total: {stats.total}</div>
              <div>Active: {stats.active}</div>
              <div>Inactive: {stats.inactive}</div>
              <div>Images: {stats.images}</div>
              <div>Videos: {stats.videos}</div>
            </div>
          )}

          {/* Bulk actions */}
          {canBulk && (
            <div className="flex flex-wrap gap-2 text-xs mt-2">
              <span>Bulk actions for {selectedIds.length} items:</span>
              <button
                className="px-2 py-1 rounded bg-green-500 hover:bg-green-600"
                onClick={() => onBulkStatus('active')}
              >
                Set Active
              </button>
              <button
                className="px-2 py-1 rounded bg-gray-500 hover:bg-gray-600"
                onClick={() => onBulkStatus('inactive')}
              >
                Set Inactive
              </button>
              <button
                className="px-2 py-1 rounded bg-gray-900 hover:bg-black"
                onClick={() => onBulkDelete('soft')}
              >
                Soft Delete
              </button>
              <button
                className="px-2 py-1 rounded bg-red-600 hover:bg-red-700"
                onClick={() => onBulkDelete('hard')}
              >
                Hard Delete
              </button>
              <button
                className="px-2 py-1 rounded bg-white/20 hover:bg-white/30"
                onClick={clearPicks}
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        {/* Info when no event selected */}
        {!eventCode && (
          <div className="mb-4 text-sm text-white">
            Please select an <span className="font-semibold">event</span> above to load gallery items.
          </div>
        )}

        {/* Table */}
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
          onClickRename={(it) => {
            setRenameOpen({ open: true, item: it });
            setNewName(it.file_name);
          }}
          onDelete={onDelete}
        />

        {/* Pagination controls */}
        {pagination && (
          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-white">
            <div>
              Page {pagination.page} of {pagination.total_pages} · {pagination.total} items
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 rounded bg-white/20 disabled:opacity-40"
                disabled={!pagination.has_prev}
                onClick={() => pagination.has_prev && setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                className="px-2 py-1 rounded bg-white/20 disabled:opacity-40"
                disabled={!pagination.has_next}
                onClick={() => pagination.has_next && setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Simple preview modal */}
        {preview && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-4 relative">
              <button
                className="absolute top-2 right-2 text-sm px-2 py-1 bg-gray-200 rounded"
                onClick={() => setPreview(null)}
              >
                Close
              </button>
              <div className="mb-2 text-sm font-medium">{preview.file_name}</div>
              <img src={preview.url} alt={preview.file_name} className="max-h-[70vh] mx-auto" />
            </div>
          </div>
        )}

        {/* Upload modal (optional, kept minimal) */}
        {uploadOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-4 w-full max-w-md">
              <h2 className="font-semibold mb-2">Upload to {eventCode} / {qrcode}</h2>
              <input
                ref={uploadInputRef}
                type="file"
                multiple
                onChange={(e) => onUpload(e.target.files)}
                className="mb-3"
              />
              <div className="flex justify-end gap-2 text-sm">
                <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setUploadOpen(false)}>
                  Cancel
                </button>
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                  onClick={() => onUpload(uploadInputRef.current?.files || null)}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Replace modal */}
        {replaceOpen.open && replaceOpen.item && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-4 w-full max-w-md">
              <h2 className="font-semibold mb-2">Replace file</h2>
              <p className="text-xs mb-2">{replaceOpen.item.file_name}</p>
              <input ref={replaceInputRef} type="file" className="mb-3" />
              <div className="flex justify-end gap-2 text-sm">
                <button
                  className="px-3 py-1 rounded bg-gray-200"
                  onClick={() => setReplaceOpen({ open: false })}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 rounded bg-amber-500 text-white"
                  onClick={onReplace}
                >
                  Replace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename modal */}
        {renameOpen.open && renameOpen.item && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-4 w-full max-w-md">
              <h2 className="font-semibold mb-2">Rename file</h2>
              <p className="text-xs mb-2">From: {renameOpen.item.file_name}</p>
              <input
                type="text"
                className="border rounded px-2 py-1 w-full mb-3"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="flex justify-end gap-2 text-sm">
                <button
                  className="px-3 py-1 rounded bg-gray-200"
                  onClick={() => setRenameOpen({ open: false })}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                  onClick={onRename}
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Main;
