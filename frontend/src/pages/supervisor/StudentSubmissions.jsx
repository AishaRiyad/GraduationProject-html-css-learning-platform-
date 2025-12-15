import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";
const downloadFile = async (fileUrl, filename) => {
  try {
    const response = await fetch(`http://localhost:5000${fileUrl}`);
    if (!response.ok) {
      throw new Error("Failed to download");
    }

    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  } catch (err) {
    console.error("Download error:", err);
  }
};


export default function StudentSubmissions({ studentId, onBack }) {

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubs() {
      try {
        const res = await axios.get(`${API}/api/supervisor/students/${studentId}/submissions`);
        setSubmissions(res.data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubs();
  }, [studentId]);

  if (loading) return <div className="text-lg">Loading submissions...</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="px-4 py-2 bg-gray-100 rounded-xl shadow hover:bg-gray-200 transition"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold">Project Submissions</h2>

      {submissions.length === 0 && (
        <p className="text-gray-500">No submissions found.</p>
      )}

      <div className="space-y-4">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="p-4 bg-white rounded-xl border shadow-sm hover:shadow transition"
          >
            <h3 className="font-semibold">{sub.original_name}</h3>

            <p className="text-sm text-gray-600">
              Status: <span className="font-medium">{sub.status}</span>
            </p>

            <p className="text-sm text-gray-600">
              Size: {(sub.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <p className="text-sm text-gray-600">
             Uploaded: {
    new Date(sub.created_at).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  }
            </p>

           <button
  onClick={() => downloadFile(sub.file_url, sub.original_name)}
  className="inline-block mt-3 px-3 py-2 bg-yellow-300 rounded-md shadow hover:bg-yellow-400"
>
  Download File
</button>

          </div>
        ))}
      </div>
    </div>
  );
}
