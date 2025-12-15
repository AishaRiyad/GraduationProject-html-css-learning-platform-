import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function authHeaders() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function fmt(dt) {
  if (!dt) return "";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
}

export default function MySupervisorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const api = useMemo(() => {
    return axios.create({
      baseURL: ROOT,
      headers: authHeaders(),
    });
  }, []);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/sessions/student");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("MySupervisorSessions load:", e);
      setErr("Failed to load sessions (check token / backend route).");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="rounded-3xl border-2 border-yellow-300 bg-white p-6 shadow">
        <h2 className="text-2xl font-black text-pink-700">Supervisor Sessions</h2>
        <p className="text-sm text-slate-600 mt-1">
          Here you can see your supervisor availability, meeting time, and the link.
        </p>
        <button
          onClick={load}
          className="mt-4 px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 font-semibold shadow"
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-4 text-slate-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border-2 border-yellow-200 bg-white p-6 shadow">
          Loading…
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border-2 border-yellow-200 bg-white p-6 shadow">
          <div className="font-semibold text-slate-800">No sessions available yet.</div>
          <div className="text-sm text-slate-500 mt-1">
            (Your supervisor may not have announced any session yet.)
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {sessions.map((s) => {
            const status = s.status || "scheduled";
            const statusStyle =
              status === "cancelled"
                ? "bg-red-50 text-red-700 border-red-200"
                : status === "rescheduled"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-green-50 text-green-700 border-green-200";

            return (
              <div
                key={s.id}
                className="rounded-3xl border-2 border-yellow-200 bg-white p-6 shadow space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-slate-900">
                      {s.title || "Session"}
                    </div>
                    <div className="text-sm text-slate-600">
                      {s.description || "No description."}
                    </div>
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full border ${statusStyle}`}>
                    {status.toUpperCase()}
                  </span>
                </div>

                <div className="text-sm text-slate-700">
                  <div>
                    <span className="font-semibold">Starts:</span> {fmt(s.starts_at)}
                  </div>
                  <div>
                    <span className="font-semibold">Ends:</span> {fmt(s.ends_at)}
                  </div>
                  {s.change_note && (
                    <div className="mt-2 text-xs text-slate-500">
                      <span className="font-semibold">Note:</span> {s.change_note}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {s.meeting_url ? (
                    <a
                      href={s.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow"
                    >
                      Join Meeting
                    </a>
                  ) : (
                    <div className="text-sm text-slate-500">
                      No meeting link provided.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
