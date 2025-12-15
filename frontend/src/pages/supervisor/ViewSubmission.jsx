// src/pages/supervisor/ViewSubmission.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ViewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);

  // preview states
  const [fileType, setFileType] = useState(null);     // "text" | "binary" | "zip" | null
  const [fileContent, setFileContent] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // ZIP states
  const [zipPath, setZipPath] = useState(null);       // مسار ملف الزيب نفسه
  const [zipFiles, setZipFiles] = useState([]);       // قائمة الملفات داخل الزيب
const [rating, setRating] = useState("");
const [feedback, setFeedback] = useState("");
const [existingReview, setExistingReview] = useState(null);
const [isEditingReview, setIsEditingReview] = useState(false);

  const API = "http://localhost:5000";
useEffect(() => {
  fetchReview();
}, [submission]);

async function fetchReview() {
  if (!submission) return;

  try {
    const res = await axios.get(`${API}/api/supervisor/review/${submission.id}`);
    setExistingReview(res.data);
  } catch (err) {
    console.error("Fetch review error:", err);
  }
}
  useEffect(() => {
    fetchSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchSubmission() {
    try {
      const res = await axios.get(`${API}/api/supervisor/submission/${id}`);
      setSubmission(res.data);
    } catch (err) {
      console.error("Error fetching submission:", err);
    }
  }

  if (!submission) {
    return (
      <div className="p-10 text-center text-gray-600 text-lg">Loading...</div>
    );
  }

  // 🔹 Parse files JSON from DB
  let files = [];
  try {
    files = JSON.parse(submission.file_url || "[]");
  } catch (e) {
    console.error("Invalid file_url JSON:", e);
    files = [];
  }

  // =========================
  //  HANDLERS
  // =========================

  // فتح ملف عادي (html/css/js/txt/json/pdf/image)
  const handleOpenFile = async (filePath) => {
    try {
      // لو كان ZIP نرسل للـ ZIP handler مباشرة
      if (filePath.toLowerCase().endsWith(".zip")) {
        await handleOpenZip(filePath);
        return;
      }

      const res = await axios.get(`${API}/files/read-file`, {
        params: { path: filePath },
      });

      if (res.data.type === "text") {
        setFileType("text");
        setFileContent(res.data.content);
        setPreviewUrl(null);
        setZipPath(null);
        setZipFiles([]);
      } else if (res.data.type === "binary") {
        setFileType("binary");
        setPreviewUrl(`${API}${res.data.url}`);
        setFileContent(null);
        setZipPath(null);
        setZipFiles([]);
      } else {
        alert(res.data.error || "Cannot preview this file type");
      }
    } catch (err) {
      console.error("Error open file:", err);
      alert("Failed to open file.");
    }
  };

  // فتح ملف ZIP → جلب قائمة الملفات بالداخل
  const handleOpenZip = async (filePath) => {
    try {
      const res = await axios.get(`${API}/files/read-zip`, {
        params: { path: filePath },
      });

      setFileType("zip");
      setZipPath(filePath);
      setZipFiles(res.data.files || []);
      setFileContent(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Error open zip:", err);
      alert("Failed to open ZIP file.");
    }
  };

  // فتح ملف داخل الـ ZIP
  const handleOpenZipFile = async (insideFileName) => {
    if (!zipPath) return;

    try {
      const res = await axios.get(`${API}/files/read-zip-file`, {
        params: { zip: zipPath, file: insideFileName },
      });

      setFileType("text");
      setFileContent(res.data.content);
      // نترك zipFiles كما هي حتى يقدر يختار ملف آخر
    } catch (err) {
      console.error("Error open zip inner file:", err);
      alert("Failed to open file inside ZIP.");
    }
  };

  // =========================
  //  RENDER
  // =========================

async function submitReview() {
  if (!rating) {
    alert("Please enter a rating");
    return;
  }

  try {
    await axios.post(`${API}/api/supervisor/review`, {
      submission_id: submission.id,
      supervisor_id: submission.supervisor_id || 1, // بدّك تغيّري 1 للـ Logged user
      rating,
      feedback
    });

    alert("Review submitted!");
    fetchReview();
  } catch (err) {
    console.error("Submit review error:", err);
  }
}

  return (
    <div className="flex flex-col items-center p-10">
      {/* Back button */}
      <button
        onClick={() => navigate("/supervisor-dashboard")}
        className="mb-6 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow transition"
      >
        ← Back to Dashboard
      </button>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-10 border">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          View Submission
        </h2>

        {/* Student Info */}
        <div className="mb-8 leading-relaxed text-lg">
          <p>
            <b>Student:</b> {submission.student_name || "Unknown"}
          </p>
          <p>
            <b>Status:</b> {submission.status}
          </p>
          <p>
            <b>Date:</b>{" "}
            {new Date(submission.created_at).toLocaleString("en-GB")}
          </p>
        </div>

        {/* File List */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Submitted Files:
        </h3>

        {files.length === 0 && (
          <p className="text-gray-500">No files found.</p>
        )}

        <div className="space-y-4 mb-10">
          {files.map((f, index) => {
            const fileName = f.url.split("/").pop();
            const isZip = fileName.toLowerCase().endsWith(".zip");

            return (
              <div
                key={index}
                className="p-4 bg-yellow-50 border rounded-xl flex justify-between items-center"
              >
                <span className="text-gray-800">{fileName}</span>

                <button
                  onClick={() => handleOpenFile(f.url)}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow transition"
                >
                  {isZip ? "Open ZIP" : "Open"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Preview Section */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Preview:</h3>

          {/* ZIP file explorer */}
       {/* ZIP file explorer */}
{zipPath && (
  <div className="flex gap-6">

    {/* قائمة الملفات داخل ZIP */}
    <div className="w-1/3 border rounded-lg p-3 bg-gray-50 max-h-[400px] overflow-auto">
      <p className="font-semibold mb-2 text-gray-700">
        Files in ZIP:
      </p>

      {zipFiles.length === 0 && (
        <p className="text-gray-500 text-sm">
          No files found inside ZIP.
        </p>
      )}

      <ul className="space-y-1 text-sm">
        {zipFiles.map((zf, idx) => (
          <li key={idx}>
            {zf.isDirectory ? (
              <span className="text-gray-400">{zf.name}/</span>
            ) : (
              <button
                className="text-blue-600 hover:underline"
                onClick={() => handleOpenZipFile(zf.name)}
              >
                {zf.name}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>


    {/* محتوى الملف داخل ZIP */}
    <div className="flex-1 border rounded-lg bg-gray-900 text-green-400 p-4 max-h-[400px] overflow-auto">
      {fileContent ? (
        <pre>{fileContent}</pre>
      ) : (
        <p className="text-gray-400">
          Select a file from the ZIP to preview its content.
        </p>
      )}
    </div>
  </div>
  
)}

 {/* ⭐⭐⭐ REVIEW SECTION — HORIZONTAL ⭐⭐⭐ */}
        {/* ⭐⭐⭐ REVIEW SECTION — EDIT + VIEW ⭐⭐⭐ */}
<div className="mt-12 border-t pt-8">
  <h3 className="text-xl font-bold text-gray-800 mb-6">
    Supervisor Evaluation
  </h3>

  {/* لو التقييم موجود */}
  {existingReview && !isEditingReview ? (
    <div className="p-4 bg-green-50 border border-green-300 rounded-xl shadow-sm relative">

      <p><b>Rating:</b> {existingReview.rating}/10</p>
      <p><b>Feedback:</b> {existingReview.feedback || "No feedback"}</p>

      {/* زر Edit */}
      <button
        onClick={() => {
          setIsEditingReview(true);
          setRating(existingReview.rating);
          setFeedback(existingReview.feedback);
        }}
        className="absolute top-3 right-3 px-4 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
      >
        Edit
      </button>
    </div>
  ) : null}

  {/* FORM للتعديل أو لإضافة تقييم جديد */}
  {!existingReview || isEditingReview ? (
    <div className="flex items-start gap-10 mt-6">

      {/* Rating */}
      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Rating (1–10):
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-24 px-3 py-2 border rounded-lg"
        />
      </div>

      {/* Feedback */}
      <div className="flex-1">
        <label className="block text-gray-700 font-semibold mb-1">
          Feedback:
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border p-3 rounded-lg"
          rows="4"
          placeholder="Write your feedback..."
        ></textarea>
      </div>

      {/* Save or Update button */}
      <button
        onClick={async () => {
          try {
            await axios.post(`${API}/api/supervisor/review`, {
              submission_id: submission.id,
              supervisor_id: submission.supervisor_id || 1,
              rating,
              feedback,
            });

            alert(existingReview ? "Review updated!" : "Review submitted!");

            setIsEditingReview(false);
            fetchReview();

          } catch (err) {
            console.error("Submit review error:", err);
          }
        }}
        className="h-12 px-5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow mt-7"
      >
        {existingReview ? "Save Changes" : "Submit"}
      </button>

      {/* Cancel edit */}
      {existingReview && (
        <button
          onClick={() => setIsEditingReview(false)}
          className="h-12 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg shadow mt-7"
        >
          Cancel
        </button>
      )}
    </div>
  ) : null}
</div>

          
</div>
        </div>
        
      </div>
    
  );
}
