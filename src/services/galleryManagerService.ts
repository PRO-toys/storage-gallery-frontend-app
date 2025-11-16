// src/services/galleryManagerService.ts
import axios, { AxiosInstance } from 'axios';

export type GalleryItem = {
  id: number;
  qrcode: string;
  file_name: string;
  event_code: string;
  file_size?: number;
  status: 'active' | 'inactive';
  updated_at?: string;
  created_at?: string;
};

export type PaginationMeta = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  filters?: any;
  generated_at?: string;
};

export type Paginated<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type EventSummary = { event_code: string; total: number };
export type QrcodeSummary = { qrcode: string; total: number };
export type Stats = {
  total: number;
  active: number;
  inactive: number;
  images: number;
  videos: number;
  byEvent: EventSummary[];
};

const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

function authHeaders() {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function apiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: backendUrl,
    headers: { ...authHeaders() },
    withCredentials: false,
  });
  client.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(err)
  );
  return client;
}

export async function listItems(params: {
  event_code?: string;
  qrcode?: string;
  type?: 'all' | 'image' | 'video';
  status?: 'all' | 'active' | 'inactive';
  sort?: 'latest' | 'oldest' | 'name' | 'size';
  page?: number;
  per_page?: number;
}): Promise<Paginated<GalleryItem>> {
  const api = apiClient();
  const { data } = await api.get('/api/role/admin/gallery-management/items', { params });
  if (data?.status !== 'success') throw new Error(data?.message || 'Failed to load items');
  return { data: data.data ?? [], pagination: data.pagination };
}

export async function getItem(id: number): Promise<GalleryItem> {
  const api = apiClient();
  const { data } = await api.get(`/api/role/admin/gallery-management/items/${id}`);
  if (data?.status !== 'success') throw new Error(data?.message || 'Failed to load item');
  return data.data as GalleryItem;
}

export async function listEvents(params?: { page?: number; per_page?: number; status?: 'all'|'active'|'inactive' }): Promise<EventSummary[]> {
  const api = apiClient();
  const { data } = await api.get('/api/role/admin/gallery-management/groups/events', { params });
  if (data?.status !== 'success') throw new Error(data?.message || 'Failed to load events');
  return data.data ?? [];
}

export async function listQrcodesByEvent(event_code: string, params?: { page?: number; per_page?: number; status?: 'all'|'active'|'inactive' }): Promise<QrcodeSummary[]> {
  const api = apiClient();
  const { data } = await api.get(`/api/role/admin/gallery-management/groups/event/${encodeURIComponent(event_code)}/qrcodes`, { params });
  if (data?.status !== 'success') throw new Error(data?.message || 'Failed to load qrcodes');
  return data.data ?? [];
}

export async function uploadToQrcode(event_code: string, qrcode: string, files: FileList | File[], extra?: Partial<{
  username: string; event_type: string; station_code: string; camera_mode: string;
}>): Promise<any> {
  const api = apiClient();
  const form = new FormData();
  const arr = Array.isArray(files) ? files : Array.from(files);
  arr.forEach(f => form.append('files[]', f));
  if (extra) Object.entries(extra).forEach(([k,v]) => v!=null && form.append(k, String(v)));
  const { data } = await api.post(
    `/api/role/admin/gallery-management/groups/event/${encodeURIComponent(event_code)}/qrcode/${encodeURIComponent(qrcode)}/upload`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  if (data?.status !== 'success') throw new Error(data?.message || 'Upload failed');
  return data.data;
}

export async function replaceFile(event_code: string, qrcode: string, file_name: string, file: File): Promise<any> {
  const api = apiClient();
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(
    `/api/role/admin/gallery-management/groups/event/${encodeURIComponent(event_code)}/qrcode/${encodeURIComponent(qrcode)}/replace/${encodeURIComponent(file_name)}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  if (data?.status !== 'success') throw new Error(data?.message || 'Replace failed');
  return data.data;
}

export async function renameFile(event_code: string, qrcode: string, old_name: string, new_name: string): Promise<any> {
  const api = apiClient();
  const { data } = await api.put(
    `/api/role/admin/gallery-management/groups/event/${encodeURIComponent(event_code)}/qrcode/${encodeURIComponent(qrcode)}/rename/${encodeURIComponent(old_name)}`,
    { new_name }
  );
  if (data?.status !== 'success') throw new Error(data?.message || 'Rename failed');
  return data.data;
}

export async function updateStatus(id: number, status: 'active'|'inactive'): Promise<void> {
  const api = apiClient();
  const { data } = await api.put(`/api/role/admin/gallery-management/items/${id}/status`, { status });
  if (data?.status !== 'success') throw new Error(data?.message || 'Update status failed');
}

export async function bulkUpdateStatus(payload: { status: 'active'|'inactive'; ids?: number[]; qrcodes?: string[] }): Promise<void> {
  const api = apiClient();
  const { data } = await api.post('/api/role/admin/gallery-management/bulk/status', payload);
  if (data?.status !== 'success') throw new Error(data?.message || 'Bulk status failed');
}

export async function deleteItem(id: number, mode: 'soft'|'hard' = 'soft'): Promise<void> {
  const api = apiClient();
  const { data } = await api.delete(`/api/role/admin/gallery-management/items/${id}`, { params: { mode } });
  if (data?.status !== 'success') throw new Error(data?.message || 'Delete failed');
}

export async function bulkDelete(payload: { mode?: 'soft'|'hard'; ids?: number[]; qrcodes?: string[] }): Promise<void> {
  const api = apiClient();
  const { data } = await api.post('/api/role/admin/gallery-management/bulk/delete', payload);
  if (data?.status !== 'success') throw new Error(data?.message || 'Bulk delete failed');
}

export async function getStats(params?: { event_code?: string; qrcode?: string }): Promise<Stats> {
  const api = apiClient();
  const { data } = await api.get('/api/role/admin/gallery-management/stats', { params });
  if (data?.status !== 'success') throw new Error(data?.message || 'Stats failed');
  return data.data as Stats;
}

export async function getFileUrl(event_code: string, qrcode: string, file_name: string): Promise<string> {
  const api = apiClient();
  const { data } = await api.get(`/api/role/admin/gallery-management/file-url/event/${encodeURIComponent(event_code)}/qrcode/${encodeURIComponent(qrcode)}/${encodeURIComponent(file_name)}`);
  if (data?.status !== 'success') throw new Error(data?.message || 'File URL failed');
  return data.data.url as string;
}

export function buildPublicFileUrl(
  event_code: string,
  qrcode: string,
  file_name: string,
  cacheBust = true
): string {
  const ts = cacheBust ? `?t=${Date.now()}` : '';
  return `${backendUrl}/storage/gallery/${encodeURIComponent(event_code)}/${encodeURIComponent(qrcode)}/${encodeURIComponent(file_name)}${ts}`;
}
