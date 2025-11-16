// src/pages/role/user/inspiration/upload/InspirationUpload.tsx
import React, { useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SweetAlert2 from '../../../../../components/inspiration/SweetAlert2';
import bg from '../../../../../assets/images/role/user/inspiration/bg.png';

type PreviewFile = {
  file: File;
  id: string;
  previewUrl: string;
  quote: string;
};

const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) || '';

const InspirationUpload: React.FC = () => {
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [busy, setBusy] = useState(false);

  const allowedMimes = useMemo(() => ['image/jpeg', 'image/jpg', 'image/png'], []);

  const onSelectFiles = (fList: FileList | null) => {
    if (!fList || fList.length === 0) return;
    const arr: PreviewFile[] = [];
    for (let i = 0; i < fList.length; i++) {
      const file = fList[i];
      if (!allowedMimes.includes(file.type)) {
        SweetAlert2.toast(`Skipped ${file.name} (unsupported type)`, 'warning');
        continue;
      }
      const id = `${Date.now()}-${i}-${file.name}`;
      const previewUrl = URL.createObjectURL(file);
      arr.push({ file, id, previewUrl, quote: '' });
    }
    setFiles((s) => [...s, ...arr]);
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (id: string) => {
    setFiles((s) => {
      const next = s.filter((p) => p.id !== id);
      return next;
    });
  };

  const handleQuoteChange = (id: string, v: string) => {
    setFiles((s) => s.map((p) => (p.id === id ? { ...p, quote: v } : p)));
  };

  const handleClearAll = () => {
    files.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setFiles([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      SweetAlert2.show('Validation', 'Please select at least one image to upload.', 'warning');
      return;
    }

    try {
      setBusy(true);
      const form = new FormData();
      files.forEach((p) => form.append('files[]', p.file, p.file.name));
      const quotes = files.map((p) => p.quote ?? '');
      quotes.forEach((q) => form.append('quotes[]', q));

      const url = `${backendUrl}/api/role/user/inspiration/upload`;
      const res = await axios.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      if (res?.data?.status === 'success') {
        SweetAlert2.show('Uploaded', 'Files uploaded/replaced successfully.', 'success');
        handleClearAll();
        nav('/role/user/inspiration/SelectInspirationImage');
      } else {
        SweetAlert2.show('Upload failed', res?.data?.message || 'Unknown error', 'error');
      }
    } catch (e: any) {
      console.error(e);
      SweetAlert2.show('Error', e?.message || 'Upload error', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-auto"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      <div className="relative z-10 min-h-screen w-full flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6">
          <h1 className="text-2xl font-bold text-center mb-4">Inspiration — Upload / Replace</h1>

          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-4 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-semibold w-full sm:w-auto"
                disabled={busy}
                aria-label="Select images to upload"
              >
                Select Images
              </button>
              <button
                onClick={handleClearAll}
                className="py-2 px-4 rounded border border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
                disabled={busy || files.length === 0}
                aria-label="Clear selected images"
              >
                Clear All
              </button>
              <div className="ml-0 sm:ml-auto text-sm text-gray-600 self-center">
                Note: same filename will be replaced on server
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            {files.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10 border rounded">No files selected</div>
            )}

            {files.map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row gap-3 p-3 border rounded items-start bg-white"
              >
                <div className="flex-shrink-0">
                  <img
                    src={p.previewUrl}
                    alt={p.file.name}
                    className="w-40 h-28 sm:w-28 sm:h-20 object-cover rounded"
                  />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="font-medium text-sm break-words">{p.file.name}</div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRemove(p.id)}
                        className="text-sm text-red-500 hover:underline"
                        disabled={busy}
                        aria-label={`Remove ${p.file.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="text-xs text-gray-600">Quote (optional)</label>
                    <input
                      type="text"
                      value={p.quote}
                      onChange={(e) => handleQuoteChange(p.id, e.target.value)}
                      placeholder="Short quote to associate with this image"
                      className="w-full mt-1 p-2 border rounded text-sm"
                      disabled={busy}
                      aria-label={`Quote for ${p.file.name}`}
                    />
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Type: {p.file.type} · Size: {(p.file.size / 1024).toFixed(2)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpload}
              className="w-full sm:flex-1 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow-md"
              disabled={busy || files.length === 0}
            >
              {busy ? 'Uploading…' : 'Upload / Replace'}
            </button>
            <button
              onClick={() => nav(-1)}
              className="w-full sm:w-auto py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
              disabled={busy}
            >
              Back
            </button>
          </div>

          <footer className="text-center text-xs text-gray-600 mt-6">
            <strong>Uploads saved to storage and inspirations table</strong>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default InspirationUpload;
