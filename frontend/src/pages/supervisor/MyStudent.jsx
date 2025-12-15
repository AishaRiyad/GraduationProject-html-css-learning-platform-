import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentOverview from "./StudentOverview";
import StudentSubmissions from "./StudentSubmissions";

const API = "http://localhost:5000";

export default function MyStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const rawUser = localStorage.getItem("user");
  const me = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    async function fetchStudents() {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API}/api/supervisor/students`, {
          params: { supervisorId: me?.id },
          headers: token
            ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` }
            : {},
        });

        const studentsArray = Array.isArray(res.data?.students) ? res.data.students : [];
        setStudents(studentsArray);
      } catch (err) {
        console.error("Error fetching students:", err?.response?.data || err.message);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [me?.id]);

  if (loading) {
    return <div className="text-lg text-gray-700">Loading students...</div>;
  }

  let filtered = students.filter((s) => {
    const name = s.full_name ? s.full_name.toLowerCase() : "";
    return name.includes(search.toLowerCase());
  });

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  filtered = filtered.filter((s) => {
    if (!filter) return true;

    const lastActive = s.last_active ? new Date(s.last_active) : null;

    if (filter === "active_today") {
      return lastActive && lastActive.toDateString() === today.toDateString();
    }

    if (filter === "active_week") {
      return lastActive && lastActive >= sevenDaysAgo;
    }

    if (filter === "inactive") {
      return !lastActive || lastActive < sevenDaysAgo;
    }

    if (filter === "has_projects") {
      return s.submissions_count > 0;
    }

    if (filter === "completed_most") {
      return true;
    }

    return true;
  });

  if (filter === "name_asc") filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
  if (filter === "name_desc") filtered.sort((a, b) => b.full_name.localeCompare(a.full_name));
  if (filter === "progress_desc") filtered.sort((a, b) => b.progress - a.progress);
  if (filter === "progress_asc") filtered.sort((a, b) => a.progress - b.progress);
  if (filter === "id_asc") filtered.sort((a, b) => a.user_id - b.user_id);
  if (filter === "id_desc") filtered.sort((a, b) => b.user_id - a.user_id);
  if (filter === "completed_most") filtered.sort((a, b) => b.completed_lessons - a.completed_lessons);

  const tabs = [
    { id: "", label: "All" },
    { id: "name_asc", label: "A → Z" },
    { id: "name_desc", label: "Z → A" },
    { id: "progress_desc", label: "Top Progress" },
    { id: "progress_asc", label: "Lowest Progress" },
    { id: "completed_most", label: "Most Completed Lessons" },
    { id: "id_asc", label: "ID ↑" },
    { id: "id_desc", label: "ID ↓" },
    { id: "active_today", label: "Active Today" },
    { id: "active_week", label: "Active This Week" },
    { id: "inactive", label: "Inactive" },
    { id: "has_projects", label: "Has Projects" },
  ];

  if (selectedStudentId) {
    if (typeof selectedStudentId === "string" && selectedStudentId.startsWith("subs-")) {
      const realId = selectedStudentId.replace("subs-", "");
      return <StudentSubmissions studentId={realId} onBack={() => setSelectedStudentId(null)} />;
    }

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedStudentId(null)}
          className="px-4 py-2 bg-gray-100 rounded-xl shadow hover:bg-gray-200 transition"
        >
          ← Back to My Students
        </button>

        <StudentOverview studentId={selectedStudentId} />
      </div>
    );
  }

  const totalStudents = students.length;

  const totalSubmissions = students.reduce((sum, s) => sum + (s.submissions_count || 0), 0);
  const topPerformers = students.filter((s) => s.progress >= 80).length;

  const activeToday = students.filter((s) => {
    if (!s.last_active) return false;
    const d = new Date(s.last_active);
    return d.toDateString() === today.toDateString();
  }).length;

  const activeWeek = students.filter((s) => {
    if (!s.last_active) return false;
    const d = new Date(s.last_active);
    return d >= sevenDaysAgo;
  }).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <SummaryBox title="Total Students" value={totalStudents} />
        <SummaryBox title="Total Submissions" value={totalSubmissions} />
        <SummaryBox title="Top Performers" value={topPerformers} />
        <SummaryBox title="Active Today" value={activeToday} />
        <SummaryBox title="Active This Week" value={activeWeek} />
      </div>

      <div className="flex items-center gap-4 mt-4">
        <input
          type="text"
          placeholder="Search by student name..."
          className="px-4 py-2 border rounded-xl shadow-sm w-72 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
              filter === t.id
                ? "bg-yellow-400 text-black shadow"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filtered.map((st) => (
          <div
            key={st.user_id}
            className="bg-white p-6 rounded-2xl shadow border hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <div className="flex flex-col items-center">
              <img
                src={st.photo_url || "/user-avatar.jpg"}
                alt={st.full_name}
                className="w-20 h-20 rounded-full border-2 border-yellow-500 shadow-md object-cover"
              />

              <h3 className="text-lg font-semibold mt-3 text-gray-900">{st.full_name}</h3>

              <p className="text-sm text-gray-500">Student ID: {st.user_id}</p>

              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                {st.progress >= 80 && <span className="badge-yellow">🎖️ Top Performer</span>}
                {st.submissions_count >= 5 && <span className="badge-blue">📂 High Submissions</span>}
                {st.last_active && new Date(st.last_active) >= sevenDaysAgo && (
                  <span className="badge-green">📚 Consistent Learner</span>
                )}
              </div>

              <div className="w-full mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Overall Progress</span>
                  <span>{st.progress}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-yellow-400 h-3 rounded-full" style={{ width: `${st.progress}%` }} />
                </div>
              </div>

              <p className="text-xs text-gray-600 mt-1">
                Lessons: {st.completed_lessons}/{st.total_lessons}
              </p>

              <p className="text-xs text-gray-600 mt-1">Submissions: {st.submissions_count}</p>

              {st.last_active && (
                <p className="text-xs text-gray-500 mt-2">
                  Last active:{" "}
                  {new Date(st.last_active).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  className="px-4 py-2 bg-yellow-300 rounded-lg shadow text-sm font-semibold hover:bg-yellow-400 transition"
                  onClick={() => setSelectedStudentId(st.user_id)}
                >
                  View Profile
                </button>

                <button
                  className="px-4 py-2 bg-gray-100 rounded-lg shadow text-sm font-semibold hover:bg-gray-200 transition"
                  onClick={() => setSelectedStudentId(`subs-${st.user_id}`)}
                >
                  View Submissions
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && <p className="text-gray-500">No students found.</p>}
      </div>
    </div>
  );
}

function SummaryBox({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow border text-center">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <p className="text-2xl font-bold text-yellow-500">{value}</p>
    </div>
  );
}
