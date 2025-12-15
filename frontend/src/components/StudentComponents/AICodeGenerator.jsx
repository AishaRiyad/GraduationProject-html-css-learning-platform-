// src/components/AICodeGenerator.jsx
import React, { useState } from "react";
import axios from "axios";

export default function AICodeGenerator({ uploadSupport = true }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    try {
      const res = await axios.post("http://localhost:5000/api/ai-local/html-generator", {
        link: linkUrl,
        imageUrl,
        imageBase64: fileBase64 || null,
      });
      setResult(res.data.code);
    } catch (err) {
      console.error(err);
      setResult("<p class='text-red-500'>Error generating HTML code.</p>");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-[#FFFBEA] border border-amber-200 shadow-inner">
     

      {/* 🟡 Input fields */}
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <input
          className="border border-amber-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Website link (optional)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
        <input
          className="border border-amber-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setFileBase64("");
          }}
        />
      </div>

      {uploadSupport && (
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const base64 = await convertToBase64(file);
                setFileBase64(base64);
                setImageUrl("");
              }
            }}
          />
        </div>
      )}

      {/* 🟢 Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || (!linkUrl && !imageUrl && !fileBase64)}
        className={`px-5 py-2 rounded-xl font-semibold text-white transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#065F46] hover:bg-[#046040]"
        }`}
      >
        {loading ? "Generating..." : "Generate HTML with AI"}
      </button>

      {/* 🧠 Result section */}
      {result && (
        <div className="mt-6 p-5 bg-white rounded-2xl border border-amber-300 shadow-sm">
          <h4 className="text-[#064F54] font-bold mb-2 flex items-center gap-2">
            🧠 Generated Code:
          </h4>
          <pre className="bg-[#FFFDF5] text-[#1F2937] border border-amber-100 rounded-xl p-3 text-sm font-mono shadow-inner overflow-x-auto">
            {result}
          </pre>

          <h4 className="text-[#967a0e] font-semibold mt-4 mb-2">🔍 Live Preview:</h4>
          <div
            className="border border-amber-200 rounded-xl p-3 bg-[#FFF9E6] text-center"
            dangerouslySetInnerHTML={{ __html: result }}
          />

          
        </div>
      )}
    </div>
  );
}
