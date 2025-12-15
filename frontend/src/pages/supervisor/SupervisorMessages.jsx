import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ChatWindow from "./ChatWindow";
import { getSocket } from "../../socket";

const API = "http://localhost:5000";
const CHAT_API = `${API}/api/chat`;

function authHeaders(extra) {
  const t = localStorage.getItem("token");
  const auth = t ? (t.startsWith("Bearer ") ? t : `Bearer ${t}`) : null;
  return { ...(extra || {}), ...(auth ? { Authorization: auth } : {}) };
}

export default function SupervisorMessages({ supervisorId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminMessages, setAdminMessages] = useState([]);
  const [adminText, setAdminText] = useState("");
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [loadingAdminMsgs, setLoadingAdminMsgs] = useState(false);

  const [onlineMap, setOnlineMap] = useState({});
  const activeAdminRef = useRef(null);

  const effectiveSupervisorId = (() => {
    if (supervisorId) return Number(supervisorId);
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      return u?.id ? Number(u.id) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    activeAdminRef.current = selectedAdmin;
  }, [selectedAdmin]);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);

      const res = await axios.get(`${API}/api/supervisor-chat/students`, {
        params: { supervisorId: effectiveSupervisorId || undefined },
        headers: authHeaders(),
      });

      setStudents(res.data?.students || []);
    } catch (err) {
      console.error("fetchStudents error:", err?.response?.data || err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [effectiveSupervisorId]);

  useEffect(() => {
    const sid = localStorage.getItem("open_student_id");
    if (sid) {
      const st = students.find((s) => String(s.id) === String(sid));
      if (st) setSelectedStudent(st);
      localStorage.removeItem("open_student_id");
    }
  }, [students]);

  const handleThreadRead = (studentId) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, unread_count: 0 } : s))
    );

    const s = getSocket();
    if (s) s.emit("mark_thread_read", { partnerId: studentId });
  };

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onChatNew = (msg) => {
      const a = activeAdminRef.current;
      if (!a) return;

      const isWithActive = msg.sender_id === a.id || msg.receiver_id === a.id;
      if (!isWithActive) return;

      setAdminMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onPresenceBulk = ({ onlineUserIds }) => {
      setOnlineMap(() => {
        const map = {};
        (onlineUserIds || []).forEach((id) => (map[id] = true));
        return map;
      });
    };

    const onPresenceUpdate = ({ userId, online }) => {
      setOnlineMap((prev) => ({ ...prev, [userId]: online }));
    };

    s.on("chat:newMessage", onChatNew);
    s.on("presence:bulk", onPresenceBulk);
    s.on("presence:update", onPresenceUpdate);

    return () => {
      s.off("chat:newMessage", onChatNew);
      s.off("presence:bulk", onPresenceBulk);
      s.off("presence:update", onPresenceUpdate);
    };
  }, []);

  async function fetchAdmins() {
    try {
      setLoadingAdmins(true);
      const r = await fetch(`${CHAT_API}/partners`, {
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`partners HTTP ${r.status}`);

      const data = await r.json();

      const onlyAdmins = Array.isArray(data)
        ? data.filter((u) => u.role === "admin")
        : [];

      setAdmins(onlyAdmins);
    } catch (e) {
      console.error("fetchAdmins error:", e);
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function openAdminThread(adminId) {
    setLoadingAdminMsgs(true);
    setAdminText("");
    try {
      const r = await fetch(`${CHAT_API}/thread/${adminId}`, {
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`thread HTTP ${r.status}`);
      const data = await r.json();
      setAdminMessages(Array.isArray(data) ? data : []);
      const a = admins.find((x) => x.id === adminId) || null;
      setSelectedAdmin(a);

      fetch(`${CHAT_API}/thread/${adminId}/read`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
      }).catch(() => {});

      const s = getSocket();
      if (s) s.emit("mark_thread_read", { partnerId: adminId });
    } catch (e) {
      console.error(e);
      alert("Failed to load admin messages.");
    } finally {
      setLoadingAdminMsgs(false);
    }
  }

  async function sendAdminMessage(e) {
    e.preventDefault();
    if (!selectedAdmin || !adminText.trim()) return;

    const body = adminText.trim();
    try {
      const r = await fetch(`${CHAT_API}/thread/${selectedAdmin.id}`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ body }),
      });
      if (!r.ok) throw new Error(`send HTTP ${r.status}`);
      const msg = await r.json();
      setAdminMessages((prev) => [...prev, msg]);
      setAdminText("");
    } catch (e) {
      console.error(e);
      alert("Failed to send message to admin.");
    }
  }

  function StudentButton({ s }) {
    return (
      <button
        key={s.id}
        type="button"
        onClick={() => {
          setSelectedStudent(s);
          setSelectedAdmin(null);
        }}
        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition
          ${
            selectedStudent?.id === s.id
              ? "bg-yellow-100 border-yellow-300"
              : "hover:bg-gray-50 border-gray-200"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={s.photo_url || "/user-avatar.jpg"}
              alt={s.full_name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            {Number(s.unread_count) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow">
                {s.unread_count}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{s.full_name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[150px]">
              {s.email}
            </p>
          </div>
        </div>
      </button>
    );
  }

  function AdminButton({ a }) {
    const isOnline = onlineMap[a.id];
    const isActive = selectedAdmin?.id === a.id;

    return (
      <button
        key={a.id}
        type="button"
        onClick={() => {
          setSelectedStudent(null);
          openAdminThread(a.id);
        }}
        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition
          ${
            isActive
              ? "bg-pink-100 border-pink-300"
              : "hover:bg-gray-50 border-gray-200"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <div>
            <p className="font-semibold text-gray-800">{a.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[150px]">
              {a.email}
            </p>
          </div>
        </div>

        <div className="text-[10px]">
          {isOnline ? (
            <span className="text-green-600 font-semibold">Online</span>
          ) : (
            <span className="text-gray-400">Offline</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="flex gap-6 h-[620px]">
      <div className="w-1/3 bg-white rounded-2xl shadow-lg p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Students</h2>
          {loadingStudents && (
            <span className="text-xs text-gray-400">Loading...</span>
          )}
        </div>

        <div className="overflow-y-auto space-y-3 max-h-[250px] pr-1">
          {students.map((s) => (
            <StudentButton key={s.id} s={s} />
          ))}

          {!loadingStudents && students.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-3">
              No students found.
            </p>
          )}
        </div>

        <div className="my-4 border-t" />

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Admins</h2>
          {loadingAdmins && (
            <span className="text-xs text-gray-400">Loading...</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {admins.map((a) => (
            <AdminButton key={a.id} a={a} />
          ))}

          {!loadingAdmins && admins.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-3">
              No admins found.
            </p>
          )}
        </div>
      </div>

      <div className="flex-1">
        {selectedStudent ? (
          <ChatWindow
            supervisorId={effectiveSupervisorId}
            student={selectedStudent}
            onThreadRead={handleThreadRead}
          />
        ) : selectedAdmin ? (
          <div className="h-full bg-white rounded-2xl shadow-lg p-4 flex flex-col">
            <div className="border-b pb-3 mb-3">
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                <span>{selectedAdmin.name}</span>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    onlineMap[selectedAdmin.id] ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </div>
              <div className="text-xs text-gray-500">{selectedAdmin.email}</div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingAdminMsgs && (
                <div className="text-sm text-gray-400">Loading messages…</div>
              )}

              {adminMessages.map((m) => {
                const isPartner = m.sender_id === selectedAdmin.id;
                return (
                  <div
                    key={m.id}
                    className={`flex ${
                      isPartner ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${
                        isPartner ? "bg-gray-100" : "bg-pink-200"
                      }`}
                    >
                      <div>{m.body}</div>
                      <div className="mt-1 text-[10px] text-gray-500">
                        {m.created_at
                          ? new Date(m.created_at).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </div>
                );
              })}

              {adminMessages.length === 0 && !loadingAdminMsgs && (
                <div className="text-sm text-gray-500 text-center mt-8">
                  No messages yet. Start the conversation 👋
                </div>
              )}
            </div>

            <form onSubmit={sendAdminMessage} className="flex gap-2 mt-3">
              <input
                value={adminText}
                onChange={(e) => setAdminText(e.target.value)}
                className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                placeholder="Type a message…"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-semibold"
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500">
              Select a student or admin from the left to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
