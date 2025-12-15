import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const authHeader = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function BuildProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await axios.get(`${API}/api/submit-projects/submission/me`, {
          headers: authHeader(),
        });
       if (s.data.submission) {
  const parsed = Array.isArray(s.data.submission.file_url)
    ? s.data.submission.file_url
    : JSON.parse(s.data.submission.file_url || "[]");
  setSubmission({ ...s.data.submission, file_url: parsed });
}

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

// ✅ رفع ملفات جديدة (تُضاف أسفل القديمة)
// ✅ رفع عدة ملفات (حتى 4) وتحديث فوري
async function submitFile() {
  if (!files.length) return;
  setBusy(true);
  try {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    const r = await axios.post(`${API}/api/submit-projects/submission`, fd, {
      headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
    });

    if (r.data.ok && r.data.submission) {
      setSubmission(r.data.submission); // ✅ تحديث فوري لكل الملفات
    }

    setFiles([]);
    if (fileRef.current) fileRef.current.value = "";
  } catch (e) {
    console.error(e);
    alert("Upload failed");
  } finally {
    setBusy(false);
  }
}

// ✅ حذف ملف واحد فقط
async function deleteSingleFile(fileName) {
  if (!window.confirm(`Delete ${fileName}?`)) return;
  setBusy(true);
  try {
    const r = await axios.delete(`${API}/api/submit-projects/submission/single`, {
      headers: { ...authHeader(), "Content-Type": "application/json" },
      data: { fileName },
    });

    if (r.data.success && r.data.submission) {
      setSubmission(r.data.submission); // ✅ تحديث فوري بعد الحذف
    }
  } catch (e) {
    console.error(e);
    alert("Delete failed");
  } finally {
    setBusy(false);
  }
}





  // ✅ حذف كل الملفات
  async function deleteSubmission() {
    if (!window.confirm("Are you sure you want to delete all your submissions?")) return;
    setBusy(true);
    try {
      await axios.delete(`${API}/api/submit-projects/submission`, {
        headers: authHeader(),
      });
      setSubmission(null);
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    } finally {
      setBusy(false);
    }
  }

 


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-amber-700">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen bg-amber-50 text-amber-900">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">🚀 Advanced Project</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold shadow"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5">
        {/* 🔹 Project Description */}
        <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Advanced HTML + CSS Project</h2>
          <h3 className="text-xl font-bold mt-4 mb-2 text-amber-800">📜 Project Description</h3>

          <div className="leading-7 whitespace-pre-wrap text-amber-900 space-y-3">
            <p>
              In this <strong>Advanced HTML + CSS Project</strong>, you are required to build a
              fully responsive and visually appealing <strong>Landing Page</strong> that demonstrates your
              understanding of modern web structure and styling.
            </p>

            <p>
              Your project must include:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Semantic HTML structure (header, main, footer, etc.)</li>
                <li>External CSS file with custom styling and layout</li>
                <li>Responsive design that adapts to mobile and desktop</li>
                <li>At least one animation or hover effect</li>
              </ul>
            </p>

            <p>
              💡 You can upload your files below (<code>.html</code>, <code>.css</code>, or <code>.zip</code>)
              — each upload will appear dynamically under the submission list.
            </p>

            <p className="text-amber-700 italic">
              Note: Make sure your uploaded files are correctly named and tested locally before submission.
            </p>
          </div>

          <div className="mt-5">
            <button
              onClick={() => navigate("/editor")}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-bold shadow"
            >
              ✏️ Go to Editor
            </button>
          </div>
        </div>

        {/* 🔹 Submission Section */}
        <div className="mt-8 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">📦 Submission</h3>

          {Array.isArray(submission?.file_url) && submission.file_url.length > 0 ? (
            <div className="mb-4 rounded-xl bg-amber-100 p-4">
              <div className="font-semibold">
                Status: <span className="text-emerald-700">Submitted</span>
              </div>

              <ul className="text-sm mt-3 space-y-2">
                {submission.file_url.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-3 py-2"
                  >
                    <div>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-700 font-medium"
                      >
                        {f.name}
                      </a>{" "}
                      <span className="text-xs text-amber-600">
                        ({(f.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => deleteSingleFile(f.name)}
                      className="text-red-600 hover:text-red-800 text-sm font-semibold"
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>

              <div className="text-sm mt-3 text-amber-800">
                Last updated:{" "}
                <span className="font-semibold">
                  {new Date(submission.updated_at).toLocaleString()}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-400 text-amber-900 font-semibold cursor-pointer"
                >
                  Add More
                  <input
                    id="file-upload"
                    ref={fileRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".zip,.html,.htm,.css"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                </label>
                <button
                  onClick={deleteSubmission}
                  className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-semibold"
                  disabled={busy}
                >
                  Delete All
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 rounded-xl bg-amber-50 p-4">
              <div className="font-semibold">No files uploaded yet.</div>
              <div className="text-sm text-amber-700">
                Upload one or more files (.zip, .html, .css).
              </div>
            </div>
          )}

          {/* ✅ File Upload */}
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              htmlFor="file-upload-2"
              className="flex items-center justify-center w-full border border-amber-200 rounded-xl p-2 cursor-pointer bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold"
            >
              اختر الملفات
              <input
                id="file-upload-2"
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                accept=".zip,.html,.htm,.css"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </label>
            <button
              onClick={submitFile}
              disabled={busy || files.length === 0}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-bold disabled:opacity-60"
            >
              Submit
            </button>
          </div>

          {files.length > 0 && (
            <ul className="mt-3 text-sm text-amber-800 list-disc pl-6">
              {files.map((f, i) => (
                <li key={i}>
                  {f.name}{" "}
                  <span className="text-xs text-amber-600">
                    ({(f.size / 1024).toFixed(1)} KB)
                  </span>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-xs text-amber-700">
            Max file size: 100MB • Accepted: .zip, .html, .css
          </p>
        </div>
      </div>
    </div>
  );
}
