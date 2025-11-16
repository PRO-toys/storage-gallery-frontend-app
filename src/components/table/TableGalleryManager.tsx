// src/components/table/TableGalleryManager.tsx
import React from 'react';
import { GalleryItem, buildPublicFileUrl } from '../../services/galleryManagerService';

type Props = {
  items: GalleryItem[];
  selectedIds: number[];
  loading: boolean;
  error: string | null;

  onTogglePick: (id: number) => void;
  onPickAllOnPage: () => void;
  onClearPicks: () => void;

  onOpenPreview: (it: GalleryItem) => void;
  onUpdateStatus: (id: number, next: 'active' | 'inactive') => void;
  onClickReplace: (it: GalleryItem) => void;
  onClickRename: (it: GalleryItem) => void;
  onDelete: (id: number, mode: 'soft' | 'hard') => void;
};

const isImage = (n: string) => /\.(jpe?g|png|gif|webp|avif)$/i.test(n);
const isVideo = (n: string) => /\.(mp4|webm|mov|m4v|avi)$/i.test(n);

const TableGalleryManager: React.FC<Props> = ({
  items,
  selectedIds,
  loading,
  error,
  onTogglePick,
  onPickAllOnPage,
  onClearPicks,
  onOpenPreview,
  onUpdateStatus,
  onClickReplace,
  onClickRename,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left bg-gray-50">
            <th className="p-3">
              <input
                type="checkbox"
                checked={items.length > 0 && selectedIds.length === items.length}
                onChange={(e) => (e.target.checked ? onPickAllOnPage() : onClearPicks())}
              />
            </th>
            <th className="p-3">Preview</th>
            <th className="p-3">File</th>
            <th className="p-3">Event</th>
            <th className="p-3">QR</th>
            <th className="p-3">Size (KB)</th>
            <th className="p-3">Status</th>
            <th className="p-3">Updated</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={9} className="p-6 text-center text-gray-500">Loading…</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={9} className="p-6 text-center text-red-600">{error}</td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-6 text-center text-gray-500">No items</td>
            </tr>
          ) : (
            items.map((it) => {
              const url = buildPublicFileUrl(it.event_code, it.qrcode, it.file_name);
              return (
                <tr key={it.id} className="border-t">
                  <td className="p-3 align-top">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(it.id)}
                      onChange={() => onTogglePick(it.id)}
                    />
                  </td>

                  <td className="p-3 align-top">
                    <button
                      className="block w-28 h-20 bg-gray-100 rounded overflow-hidden"
                      onClick={() => onOpenPreview(it)}
                      title="Preview"
                    >
                      {isImage(it.file_name) ? (
                        <img
                          src={url}
                          alt={it.file_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : isVideo(it.file_name) ? (
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <span className="text-xs text-gray-500">FILE</span>
                      )}
                    </button>
                  </td>

                  <td className="p-3 align-top">
                    <div className="font-medium">{it.file_name}</div>
                    <div className="text-xs text-gray-500">#{it.id}</div>
                  </td>

                  <td className="p-3 align-top">{it.event_code}</td>
                  <td className="p-3 align-top">{it.qrcode}</td>
                  <td className="p-3 align-top">{it.file_size ?? '-'}</td>

                  <td className="p-3 align-top">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        it.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {it.status}
                    </span>
                  </td>

                  <td className="p-3 align-top text-xs text-gray-500">{it.updated_at ?? '-'}</td>

                  <td className="p-3 align-top space-x-2">
                    <button
                      className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      onClick={() => onUpdateStatus(it.id, it.status === 'active' ? 'inactive' : 'active')}
                    >
                      {it.status === 'active' ? 'Set Inactive' : 'Set Active'}
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200"
                      onClick={() => onClickReplace(it)}
                    >
                      Replace
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
                      onClick={() => onClickRename(it)}
                    >
                      Rename
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-gray-900 text-white hover:bg-black"
                      onClick={() => onDelete(it.id, 'soft')}
                    >
                      Soft Delete
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={() => onDelete(it.id, 'hard')}
                    >
                      Hard Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableGalleryManager;
