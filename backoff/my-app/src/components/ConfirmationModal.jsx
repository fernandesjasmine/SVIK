import React from 'react';

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <p className="mb-4 text-center text-gray-800">{message}</p>
        <div className="flex justify-around">
          <button
            onClick={onConfirm}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
