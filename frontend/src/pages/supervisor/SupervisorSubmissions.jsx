import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function SupervisorSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000";

  useEffect(() => {
    fetchSubmissions();
  }, []);
function formatDate(dateString) {
  const d = new Date(dateString);

  const optionsDate = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  const optionsTime = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const formattedDate = d.toLocaleDateString("en-US", optionsDate);
  const formattedTime = d.toLocaleTimeString("en-US", optionsTime);

  return `${formattedDate} — ${formattedTime}`;
}

  async function fetchSubmissions() {
    try {
      const res = await axios.get(`${API}/api/supervisor/submissions`);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-lg text-gray-600">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-5xl bg-white p-10 rounded-2xl shadow-xl border">

        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Student Submissions
        </h2>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border shadow">
          <table className="min-w-full border-collapse bg-white">
            <thead className="bg-yellow-100">
              <tr>
                <th className="p-4 text-left text-gray-700 font-semibold border-b">
                  Student
                </th>
                <th className="p-4 text-left text-gray-700 font-semibold border-b">
                  File Name
                </th>
                <th className="p-4 text-left text-gray-700 font-semibold border-b">
                  Status
                </th>
                <th className="p-4 text-left text-gray-700 font-semibold border-b">
                  Size
                </th>
                <th className="p-4 text-left text-gray-700 font-semibold border-b">
                  Submitted At
                </th>
                <th className="p-4 text-left text-gray-700 font-semibold border-b">
                  Action
                </th>
              </tr>
            </thead>

           <tbody>
  {submissions.map((s) => (
    <tr key={s.id} className="hover:bg-yellow-50 border-b">
      
      {/* Student Name */}
      <td className="p-4 text-gray-800">
        {s.student_name || "Unknown Student"}
      </td>

      {/* File Name */}
      <td className="p-4 text-gray-700">
        {s.original_name || "No file name"}
      </td>

      {/* Status */}
      <td className="p-4">
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            s.status === "submitted"
              ? "bg-green-100 text-green-700"
              : s.status === "replaced"
              ? "bg-blue-100 text-blue-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {s.status || "Unknown"}
        </span>
      </td>

      {/* Size */}
      <td className="p-4 text-gray-700">
        {s.size ? (s.size / 1024).toFixed(1) + " KB" : "—"}
      </td>

      {/* Created At */}
      <td className="p-4 text-gray-700">
        {s.created_at
          ? formatDate(s.created_at)

          : "—"}
      </td>

      {/* File URL */}
      <td className="p-4">
        {s.file_url ? (
          <Link
  to={`/supervisor/submission/${s.id}`}
  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow transition"
>
  View
</Link>

        ) : (
          "—"
        )}
      </td>

    </tr>
  ))}
</tbody>

          </table>

          {submissions.length === 0 && (
            <p className="text-center py-8 text-gray-500">
              No submissions yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
