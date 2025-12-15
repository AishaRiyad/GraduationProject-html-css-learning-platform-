import React from "react";

export default function CertificateModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-amber-700 mb-4">
          🎓 Congratulations!
        </h2>
        <p className="text-gray-700 mb-6">
          You’ve successfully completed the <b>Basic Level</b> and unlocked the <b>Advanced Level</b>!
        </p>
        <button
          onClick={onClose}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md"
        >
          Close
        </button>
      </div>
    </div>
  );
}

