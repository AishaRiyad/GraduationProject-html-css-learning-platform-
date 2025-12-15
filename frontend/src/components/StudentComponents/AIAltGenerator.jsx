// src/components/AIAltGenerator.jsx
import React, { useState } from "react";
import axios from "axios";

export default function AIAltGenerator({ uploadSupport = true }) {
  const [imageUrl, setImageUrl] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [altText, setAltText] = useState("");
  const [loading, setLoading] = useState(false);

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {
    if (!imageUrl && !fileBase64) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai-local/smart-image", {
        imageUrl,
        imageBase64: fileBase64 || null,
      });

      let aiAlt = "Image";

// إذا السيرفر رجّع كود <img ...>
if (res.data.result.includes("<img")) {
  const match = res.data.result.match(/alt=['"]([^'"]+)['"]/);
  aiAlt = match ? match[1] : "Image";
} else {
  aiAlt = res.data.result.trim();
}

      const finalSrc = imageUrl || fileBase64;

      setAltText(aiAlt);

      // ✨ نقصر النص الطويل (base64)
      const shortSrc =
        finalSrc.length > 80
          ? `${finalSrc.substring(0, 80)}...`
          : finalSrc;

      const htmlTag = `<img src='${shortSrc}' alt='${aiAlt}'>`;
      setResult(htmlTag);
    } catch (err) {
      console.error(err);
      setResult("Error generating alt text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4">
      

      {/* 🟡 إدخال الصورة */}
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          className="border rounded px-3 py-2"
          placeholder="Paste image URL..."
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setFileBase64("");
            setPreview(e.target.value);
          }}
        />
        {uploadSupport && (
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const base64 = await convertToBase64(file);
                setFileBase64(base64);
                setImageUrl("");
                setPreview(base64);
              }
            }}
          />
        )}
      </div>

      {/* 🟢 زر التوليد */}
      <button
        onClick={handleGenerate}
        disabled={loading || (!imageUrl && !fileBase64)}
        className={`${
          loading ? "bg-gray-400" : "bg-[#004D40] hover:brightness-110"
        } text-white px-4 py-2 rounded transition`}
      >
        {loading ? "Generating..." : "Generate Alt with AI"}
      </button>

      {/* 🖼️ عرض الصورة فقط مرة واحدة */}
      {preview && (
        <div className="mt-4 text-center">
          <img
            src={preview}
            alt={altText || "Preview"}
            className="max-h-48 rounded-xl border border-amber-300 mx-auto shadow-sm"
          />
        </div>
      )}

      {/* 💬 النتيجة */}
      {result && (
        <div className="mt-6">
          <p className="font-semibold text-gray-700 mb-1">Generated HTML:</p>
          <pre className="bg-[#FFFDF5] text-[#1F2937] border border-amber-200 rounded-xl p-4 text-sm font-mono shadow-inner overflow-x-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
