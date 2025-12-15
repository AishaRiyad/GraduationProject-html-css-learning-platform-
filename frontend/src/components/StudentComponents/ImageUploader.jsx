import React, { useState } from "react";

export default function ImageUploader({ onFileSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  };

  return (
    <div className="mt-3">
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="border border-amber-300 rounded-lg p-2 w-full"
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-3 rounded-lg w-full h-60 object-cover shadow"
        />
      )}
    </div>
  );
}
