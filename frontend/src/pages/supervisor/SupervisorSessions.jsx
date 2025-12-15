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

export default function SupervisorSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // create form
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    starts_at: "",
    ends_at: "",
    meeting_url: "",
  });

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    starts_at: "",
    ends_at: "",
    meeting_url: "",
    status: "",
    change_note: "",
  });

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
      const res = await api.get("/api/sessions/supervisor");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("SupervisorSessions load:", e);
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

  async function createSession() {
    try {
      setErr("");
      const payload = {
        title: createForm.title?.trim(),
        description: createForm.description?.trim() || null,
        starts_at: createForm.starts_at,
        ends_at: createForm.ends_at,
        meeting_url: createForm.meeting_url?.trim() || null,
      };

      if (!payload.title || !payload.starts_at || !payload.ends_at) {
        alert("Title + starts_at + ends_at are required");
        return;
      }

      await api.post("/api/sessions", payload);
      setCreateOpen(false);
      setCreateForm({
        title: "",
        description: "",
        starts_at: "",
        ends_at: "",
        meeting_url: "",
      });
      await load();
    } catch (e) {
      console.error("createSession:", e);
      alert("Failed to create session");
    }
  }

  function openEdit(s) {
    setEditing(s);
    setEditForm({
      title: s.title || "",
      description: s.description || "",
      starts_at: s.starts_at ? String(s.starts_at).slice(0, 16) : "",
      ends_at: s.ends_at ? String(s.ends_at).slice(0, 16) : "",
      meeting_url: s.meeting_url || "",
      status: s.status || "scheduled",
      change_note: s.change_note || "",
    });
    setEditOpen(true);
  }

  async function saveEdit() {
    if (!editing?.id) return;

    try {
      await api.patch(`/api/sessions/${editing.id}`, {
        title: editForm.title?.trim() || null,
        description: editForm.description?.trim() || null,
        starts_at: editForm.starts_at || null,
        ends_at: editForm.ends_at || null,
        meeting_url: editForm.meeting_url?.trim() || null,
        status: editForm.status || null,
        change_note: editForm.change_note?.trim() || null,
      });

      setEditOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      console.error("saveEdit:", e);
      alert("Failed to update session");
    }
  }

  async function cancelSession(id) {
    if (!window.confirm("Cancel this session?")) return;
    try {
      await api.patch(`/api/sessions/${id}`, {
        status: "cancelled",
        change_note: "Cancelled",
      });
      await load();
    } catch (e) {
      console.error("cancelSession:", e);
      alert("Failed to cancel session");
    }
  }

  // delete only if cancelled
  async function deleteSession(id) {
    if (!window.confirm("Delete this CANCELLED session permanently?")) return;
    try {
      await api.delete(`/api/sessions/${id}`);
      await load();
    } catch (e) {
      console.error("deleteSession:", e);
      alert("Failed to delete session");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header box */}
      <div className="rounded-3xl border-2 border-yellow-300 bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-black text-pink-700">My Sessions</h2>
            <p className="text-sm text-slate-600 mt-1">
              Announce availability + Zoom link. Students under you will see it.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={load}
              className="px-4 py-2 rounded-full bg-yellow-200 hover:bg-yellow-300 font-semibold shadow"
            >
              Refresh
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow"
            >
              + Create Session
            </button>
          </div>
        </div>
      </div>

      {err && (
        <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-4 text-slate-700">
          {err}
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border-2 border-yellow-200 shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-black text-slate-900">Create Session</div>
              <button
                className="text-red-600 font-black"
                onClick={() => setCreateOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <input
                className="w-full border rounded-xl p-3"
                placeholder="Title"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              />
              <textarea
                className="w-full border rounded-xl p-3"
                placeholder="Description (optional)"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
              />
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Starts at</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-xl p-3"
                    value={createForm.starts_at}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, starts_at: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Ends at</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-xl p-3"
                    value={createForm.ends_at}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, ends_at: e.target.value })
                    }
                  />
                </div>
              </div>

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Meeting URL (Zoom/Meet) (optional)"
                value={createForm.meeting_url}
                onChange={(e) =>
                  setCreateForm({ ...createForm, meeting_url: e.target.value })
                }
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={createSession}
                  className="px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 font-semibold shadow"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white border-2 border-yellow-200 shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-black text-slate-900">Edit / Reschedule</div>
              <button
                className="text-red-600 font-black"
                onClick={() => setEditOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <input
                className="w-full border rounded-xl p-3"
                placeholder="Title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
              <textarea
                className="w-full border rounded-xl p-3"
                placeholder="Description (optional)"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Starts at</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-xl p-3"
                    value={editForm.starts_at}
                    onChange={(e) =>
                      setEditForm({ ...editForm, starts_at: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Ends at</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-xl p-3"
                    value={editForm.ends_at}
                    onChange={(e) =>
                      setEditForm({ ...editForm, ends_at: e.target.value })
                    }
                  />
                </div>
              </div>

              <input
                className="w-full border rounded-xl p-3"
                placeholder="Meeting URL (optional)"
                value={editForm.meeting_url}
                onChange={(e) =>
                  setEditForm({ ...editForm, meeting_url: e.target.value })
                }
              />

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Status</label>
                  <select
                    className="w-full border rounded-xl p-3"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="scheduled">scheduled</option>
                    <option value="rescheduled">rescheduled</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Change note</label>
                  <input
                    className="w-full border rounded-xl p-3"
                    placeholder="e.g. moved to next week"
                    value={editForm.change_note}
                    onChange={(e) =>
                      setEditForm({ ...editForm, change_note: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 font-semibold shadow"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border-2 border-yellow-200 bg-white p-6 shadow">
          Loading…
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border-2 border-yellow-200 bg-white p-6 shadow">
          <div className="font-semibold text-slate-800">No sessions yet.</div>
          <div className="text-sm text-slate-500 mt-1">
            Create one to appear for your students.
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

                <div>
                  {s.meeting_url ? (
                    <a
                      href={s.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink-700 font-semibold hover:underline"
                    >
                      Open meeting link
                    </a>
                  ) : (
                    <div className="text-sm text-slate-500">No meeting link.</div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="px-4 py-2 rounded-full bg-yellow-200 hover:bg-yellow-300 font-semibold shadow"
                  >
                    Edit / Reschedule
                  </button>

                  <button
                    onClick={() => cancelSession(s.id)}
                    className="px-4 py-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold shadow"
                  >
                    Cancel
                  </button>

                  
                  {String(status).toLowerCase() === "cancelled" && (
                    <button
                      onClick={() => deleteSession(s.id)}
                      className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow"
                    >
                      Delete
                    </button>
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
