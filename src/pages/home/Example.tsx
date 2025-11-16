// src/pages/home/Example.tsx
import React from 'react';
import SweetAlert2 from '../../components/alert/SweetAlert2';
import Swal from 'sweetalert2';

const Example: React.FC = () => {
  const showSuccessAlert = () => {
    SweetAlert2.show('Success!', 'This is a success alert.', 'success', 'OK', 'Cancel', false); // No cancel button
  };

  const showErrorAlert = () => {
    SweetAlert2.show('Error!', 'Something went wrong.', 'error', 'OK', 'Cancel', false); // No cancel button
  };

  const showWarningAlert = () => {
    SweetAlert2.show('Warning!', 'This is a warning alert.', 'warning', 'OK', 'Cancel', false); // No cancel button
  };

  const showInfoAlert = () => {
    SweetAlert2.show('Information', 'This is an informational alert.', 'info', 'OK', 'Cancel', false); // No cancel button
  };

  const showQuestionAlert = () => {
    SweetAlert2.show('Question?', 'Do you want to proceed?', 'question', 'Yes', 'No', false); // No cancel button
  };

  const showConfirmationAlert = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true, // Only confirmation alert has cancel button
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        handleConfirmedAction();
      } else if (result.isDismissed) {
        Swal.fire('Cancelled', 'Your action has been cancelled.', 'info');
      }
    });
  };

  const handleConfirmedAction = () => {
    Swal.fire('Confirmed!', 'You have chosen to proceed.', 'success');
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Welcome to the Example Page</h1>
        <p className="mt-4 text-center">This is the Example page.</p>

        <div className="flex flex-col space-y-4 mt-6">
          <button
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200"
            onClick={showSuccessAlert}
          >
            Show Success Alert
          </button>

          <button
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-200"
            onClick={showErrorAlert}
          >
            Show Error Alert
          </button>

          <button
            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition duration-200"
            onClick={showWarningAlert}
          >
            Show Warning Alert
          </button>

          <button
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            onClick={showInfoAlert}
          >
            Show Info Alert
          </button>

          <button
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition duration-200"
            onClick={showQuestionAlert}
          >
            Show Question Alert
          </button>

          <button
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition duration-200"
            onClick={showConfirmationAlert}
          >
            Show Confirmation Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export default Example;
