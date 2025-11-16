// src/components/alert/SweetAlert2.tsx
import Swal from 'sweetalert2';

const SweetAlert2 = {
  show: (
    title: string,
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info' | 'question',
    confirmButtonText: string = 'OK',
    cancelButtonText: string = 'Cancel',
    showCancelButton: boolean = false,
    callback?: () => void
  ) => {
    Swal.fire({
      title,
      text,
      icon,
      showCancelButton,
      confirmButtonText,
      cancelButtonText,
    }).then((result) => {
      if (result.isDismissed) {
        Swal.fire('Cancelled', 'Your action has been cancelled.', 'info');
      } else if (result.isConfirmed && callback) {
        callback();
      }
    });
  },
};

export default SweetAlert2;
