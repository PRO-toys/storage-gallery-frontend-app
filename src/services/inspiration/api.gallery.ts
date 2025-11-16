// src/services/inspiration/api.gallery.ts
import axios from 'axios';
import Swal from 'sweetalert2';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Upload gallery image to Laravel endpoint: /api/role/user/upload/upload-gallery
 * @param formData - FormData object containing fields & file
 * @returns Promise of API response
 */
export async function uploadGallery(formData: FormData) {
  try {
    const res = await axios.post(`${BACKEND_URL}/api/role/user/upload/upload-gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (res.data?.status === 'success') {
      Swal.fire('Uploaded', 'Gallery upload successful!', 'success');
    } else {
      Swal.fire('Upload failed', res.data?.message || 'Unknown error', 'warning');
    }

    return res.data;
  } catch (err: any) {
    console.error('Upload error:', err);
    Swal.fire('Error', err.message || 'Failed to upload file.', 'error');
    throw err;
  }
}
