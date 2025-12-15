import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function StudentOverview({ studentId }) {
    console.log("📌 Received studentId in StudentOverview:", studentId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${API}/api/supervisor/students/${studentId}`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching student overview:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) {
    return <div className="text-lg text-gray-700">Loading profile...</div>;
  }

  if (!data) {
    return <div className="text-red-500">Student not found.</div>;
  }

  const { student, progress, timeline } = data;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-10 border">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col items-center text-center">
         {console.log("📸 StudentOverview Image URL =", student.photo_url)}

        <img
          src={student.photo_url}
          alt="profile"
          className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-md object-cover"
        />

        <h2 className="text-2xl font-bold text-gray-900 mt-4">
          {student.full_name}
        </h2>

        <p className="text-gray-500">{student.email}</p>
      </div>

      {/* ================= BASIC INFO ================= */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

        <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
          <p className="text-sm text-gray-500">City</p>
          <p className="text-lg font-semibold text-gray-800">
            {student.city || "—"}
          </p>
        </div>

        <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
          <p className="text-sm text-gray-500">Address</p>
          <p className="text-lg font-semibold text-gray-800">
            {student.address || "—"}
          </p>
        </div>

        <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
          <p className="text-sm text-gray-500">Phone Number</p>
          <p className="text-lg font-semibold text-gray-800">
            {student.phone_number || "—"}
          </p>
        </div>

        <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
          <p className="text-sm text-gray-500">Last Login</p>
          <p className="text-lg font-semibold text-gray-800">
            {student.last_login
  ? new Date(student.last_login).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  : "—"}

          </p>
        </div>
      </div>

      {/* ================= ABOUT ME ================= */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">About</h3>
        <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
          <p className="text-gray-700 whitespace-pre-line">
            {student.about_me || "No description provided."}
          </p>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="mt-10 grid grid-cols-3 gap-4 text-center">

        <div className="p-5 rounded-xl border bg-yellow-50 shadow">
          <p className="text-sm text-gray-600">Lessons Progress</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {progress.lessons}%
          </p>
        </div>

        <div className="p-5 rounded-xl border bg-yellow-50 shadow">
          <p className="text-sm text-gray-600">Quiz Avg</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {progress.quizzes}%
          </p>
        </div>

        <div className="p-5 rounded-xl border bg-yellow-50 shadow">
          <p className="text-sm text-gray-600">Projects Submitted</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {progress.projects}
          </p>
        </div>
      </div>

      {/* ================= TIMELINE ================= */}
      <div className="mt-10">
        <h3 className="text-xl font-bold">Activity Timeline</h3>

        <div className="mt-3 space-y-3">
          {timeline.length === 0 && (
            <p className="text-gray-500">No activity yet.</p>
          )}

          {timeline.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border bg-gray-50 shadow-sm flex justify-between"
            >
              <span className="capitalize font-medium">{item.type}</span>

              <span className="text-gray-600">
              {item.timestamp
    ? new Date(item.timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "—"}

              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
