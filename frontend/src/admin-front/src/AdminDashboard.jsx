import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_ADMIN_API || "http://localhost:5000/api/admin";

function authHeaders() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [recent, setRecent] = useState({
    latestUsers: [],
    latestProjects: [],
    latestComments: [],
  });
  const [error, setError] = useState("");

  async function getOverview() {
    const res = await fetch(`${API}/overview`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`overview HTTP ${res.status}`);
    return res.json();
  }

  async function getRecent() {
    const res = await fetch(`${API}/recent`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`recent HTTP ${res.status}`);
    const data = await res.json();

    // تأكد دائمًا من Arrays
    const latestUsers = Array.isArray(data?.latestUsers) ? data.latestUsers : [];
    const latestProjects = Array.isArray(data?.latestProjects) ? data.latestProjects : [];
    const latestComments = Array.isArray(data?.latestComments) ? data.latestComments : [];

    return { latestUsers, latestProjects, latestComments };
  }

  useEffect(() => {
    (async () => {
      try {
        const [ov, rc] = await Promise.all([getOverview(), getRecent()]);
        setOverview(ov);
        setRecent(rc);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed loading dashboard");
      }
    })();
  }, []);

  // Helpers لتنسيق التاريخ بأمان
  const fmt = (d) =>
    d ? String(d).toString().replace("T", " ").slice(0, 19) : "";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-pink-700">Admin Dashboard</h1>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-3">
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="text-sm text-slate-500">Users</div>
          <div className="text-3xl font-bold">{overview?.users ?? "—"}</div>
        </div>
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="text-sm text-slate-500">Students</div>
          <div className="text-3xl font-bold">{overview?.students ?? "—"}</div>
        </div>
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="text-sm text-slate-500">Projects</div>
          <div className="text-3xl font-bold">{overview?.projects ?? "—"}</div>
        </div>
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="text-sm text-slate-500">Comments</div>
          <div className="text-3xl font-bold">{overview?.comments ?? "—"}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-3 gap-3">
        {/* Users */}
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="font-bold mb-2">Latest Users</div>
          <ul className="space-y-2">
            {recent.latestUsers.length === 0 && (
              <li className="text-sm text-slate-500">No users yet</li>
            )}
            {recent.latestUsers.map((u) => (
              <li key={u.id} className="border rounded-xl p-2">
                <div className="font-semibold">{u.name || "(no name)"}</div>
                <div className="text-xs text-slate-500">{u.email}</div>
                <div className="text-xs text-slate-400">{fmt(u.created_at)}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Projects */}
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="font-bold mb-2">Latest Projects</div>
          <ul className="space-y-2">
            {recent.latestProjects.length === 0 && (
              <li className="text-sm text-slate-500">No projects</li>
            )}
            {recent.latestProjects.map((p) => (
              <li key={p.id} className="border rounded-xl p-2">
                <div className="font-semibold">{p.title || "(no title)"}</div>
                <div className="text-xs text-slate-400">{fmt(p.created_at)}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Comments */}
        <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
          <div className="font-bold mb-2">Latest Comments</div>
          <ul className="space-y-2">
            {recent.latestComments.length === 0 && (
              <li className="text-sm text-slate-500">No comments</li>
            )}
            {recent.latestComments.map((c) => (
              <li key={c.id} className="border rounded-xl p-2">
                <div className="text-sm">{c.comment}</div>
                <div className="text-xs text-slate-400">{fmt(c.created_at)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
