// src\components\modal\ModalConfirmation.tsx
import React from 'react';

interface ModalConfirmationProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ModalConfirmation: React.FC<ModalConfirmationProps> = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-80 p-6 text-center">
        <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
        <p className="mb-6 text-sm text-gray-700">Are you sure you want to download?</p>
        <div className="flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmation;
