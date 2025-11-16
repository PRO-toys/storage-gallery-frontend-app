// src/components/inspiration/SweetAlert2.tsx
import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Centralized SweetAlert2 helper.
 * Usage:
 *   SweetAlert2.show('Title', 'Message', 'success');
 *   SweetAlert2.toast('Saved successfully!', 'success');
 */
const SweetAlert2 = {
  /**
   * Standard alert dialog
   */
  show: (title: string, text: string, icon: SweetAlertIcon = 'info') => {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb', // Tailwind blue-600
      background: '#fff',
      color: '#111',
    });
  },

  /**
   * Quick toast (top-right corner)
   */
  toast: (title: string, icon: SweetAlertIcon = 'success', timer = 2000) => {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      background: '#fff',
      color: '#111',
    });
  },
};

export default SweetAlert2;
