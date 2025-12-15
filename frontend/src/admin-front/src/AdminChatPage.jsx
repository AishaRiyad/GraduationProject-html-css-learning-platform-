import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getSocket } from "./socket";


const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const API = `${ROOT}/api/chat`;

function authHeaders(extra) {
  const t = localStorage.getItem("token");
  return { ...(extra || {}), ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AdminChatPage() {
  const [partners, setPartners] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineMap, setOnlineMap] = useState({});

  const activePartnerRef = useRef(null);
  const query = useQuery();
  const partnerFromNotif = query.get("partner");

  useEffect(() => {
    activePartnerRef.current = activePartner;
  }, [activePartner]);

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    if (!partnerFromNotif) return;
    const pid = Number(partnerFromNotif);
    if (!pid) return;
    if (!partners || partners.length === 0) return;
    openThread(pid);
  }, [partners, partnerFromNotif]);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onNewMessage = (msg) => {
      const partner = activePartnerRef.current;
      if (!partner) return;

      const isWithActive =
        msg.sender_id === partner.id || msg.receiver_id === partner.id;

      if (!isWithActive) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const onBulk = ({ onlineUserIds }) => {
      setOnlineMap(() => {
        const map = {};
        (onlineUserIds || []).forEach((id) => {
          map[id] = true;
        });
        return map;
      });
    };

    const onUpdate = ({ userId, online }) => {
      setOnlineMap((prev) => ({ ...prev, [userId]: online }));
    };

    s.off("chat:newMessage");
    s.off("presence:bulk");
    s.off("presence:update");

    s.on("chat:newMessage", onNewMessage);
    s.on("presence:bulk", onBulk);
    s.on("presence:update", onUpdate);

    setSocket(s);

    return () => {
      try {
        s.off("chat:newMessage", onNewMessage);
        s.off("presence:bulk", onBulk);
        s.off("presence:update", onUpdate);
      } catch {}
    };
  }, []);

  async function loadPartners() {
    try {
      const r = await fetch(`${API}/partners`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`partners HTTP ${r.status}`);
      const data = await r.json();
      setPartners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert("Failed to load users for chat.");
    }
  }

  async function openThread(userId) {
    setLoadingMsgs(true);
    setEditingId(null);
    setText("");
    try {
      const r = await fetch(`${API}/thread/${userId}`, {
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`thread HTTP ${r.status}`);
      const data = await r.json();
      setMessages(Array.isArray(data) ? data : []);
      const p = partners.find((x) => x.id === userId) || null;
      setActivePartner(p);

      fetch(`${API}/thread/${userId}/read`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
      }).catch(() => {});
    } catch (e) {
      console.error(e);
      alert("Failed to load messages.");
    } finally {
      setLoadingMsgs(false);
    }
  }

  function startEdit(msg) {
    setEditingId(msg.id);
    setText(msg.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setText("");
  }

  async function handleDelete(messageId) {
    if (!window.confirm("Delete this message?")) return;
    try {
      const r = await fetch(`${API}/messages/${messageId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`delete HTTP ${r.status}`);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      if (editingId === messageId) {
        setEditingId(null);
        setText("");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete message.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!activePartner || !text.trim()) return;

    const body = text.trim();

    if (editingId) {
      try {
        const r = await fetch(`${API}/messages/${editingId}`, {
          method: "PUT",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ body }),
        });
        if (!r.ok) throw new Error(`update HTTP ${r.status}`);
        const updated = await r.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
        setEditingId(null);
        setText("");
      } catch (e) {
        console.error(e);
        alert("Failed to update message.");
      }
      return;
    }

    try {
      const r = await fetch(`${API}/thread/${activePartner.id}`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ body }),
      });
      if (!r.ok) throw new Error(`send HTTP ${r.status}`);
      const msg = await r.json();
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch (e) {
      console.error(e);
      alert("Failed to send message.");
    }
  }

  const students = partners.filter((p) => p.role === "student");
  const supervisors = partners.filter((p) => p.role === "supervisor");

  function PartnerButton({ p }) {
    const isActive = activePartner?.id === p.id;
    const isOnline = onlineMap[p.id];

    return (
      <button
        key={p.id}
        type="button"
        onClick={() => openThread(p.id)}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
          isActive ? "bg-pink-100 text-pink-900" : "hover:bg-yellow-50"
        }`}
      >
        <div>
          <div className="font-medium flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span>{p.name}</span>
          </div>
          <div className="text-xs text-gray-500">{p.email}</div>
        </div>

        <div className="text-[10px]">
          {isOnline ? (
            <span className="text-green-600 font-semibold">Active now</span>
          ) : (
            <span className="text-gray-400">Offline</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-pink-700">Chat</h1>

      <div className="grid grid-cols-[260px,1fr] gap-4">
        <aside className="border rounded-2xl bg-white/90 p-3 shadow-sm">
          <h2 className="font-semibold mb-2 text-pink-700 text-sm uppercase tracking-wide">
            Students
          </h2>
          <div className="space-y-1 max-h-[26vh] overflow-y-auto mb-4">
            {students.map((p) => (
              <PartnerButton key={p.id} p={p} />
            ))}
            {students.length === 0 && (
              <div className="text-xs text-gray-500">No students available.</div>
            )}
          </div>

          <h2 className="font-semibold mb-2 text-pink-700 text-sm uppercase tracking-wide">
            Supervisors
          </h2>
          <div className="space-y-1 max-h-[26vh] overflow-y-auto">
            {supervisors.map((p) => (
              <PartnerButton key={p.id} p={p} />
            ))}
            {supervisors.length === 0 && (
              <div className="text-xs text-gray-500">No supervisors available.</div>
            )}
          </div>
        </aside>

        <section className="border rounded-2xl bg-white/90 p-3 flex flex-col shadow-sm">
          {activePartner ? (
            <>
              <header className="border-b pb-2 mb-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-pink-700 flex items-center gap-2">
                    <span>{activePartner.name}</span>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        onlineMap[activePartner.id] ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{activePartner.email}</div>
                  <div className="text-[11px] mt-1">
                    {onlineMap[activePartner.id] ? (
                      <span className="text-green-600">Active now</span>
                    ) : (
                      <span className="text-gray-400">Last seen earlier</span>
                    )}
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {loadingMsgs && (
                  <div className="text-sm text-gray-500">Loading messages…</div>
                )}

                {messages.map((msg) => {
                  const isPartner = msg.sender_id === activePartner.id;
                  const isMine = !isPartner;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isPartner ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`px-3 py-2 rounded-2xl max-w-[70%] text-sm ${
                          isPartner ? "bg-gray-100" : "bg-pink-200"
                        }`}
                      >
                        <div>{msg.body}</div>

                        <div className="mt-1 text-[10px] text-gray-500 flex justify-between items-center">
                          <span>
                            {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
                          </span>
                        </div>

                        {isMine && (
                          <div className="mt-1 text-[10px] flex gap-3 justify-end text-gray-600">
                            <button
                              type="button"
                              onClick={() => startEdit(msg)}
                              className="hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(msg.id)}
                              className="hover:underline text-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {messages.length === 0 && !loadingMsgs && (
                  <div className="text-sm text-gray-500 text-center mt-8">
                    No messages yet. Start the conversation 👋
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder={editingId ? "Edit your message…" : "Type a message…"}
                />
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-2 rounded-full bg-gray-200 text-xs"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-semibold"
                >
                  {editingId ? "Save" : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
              Select a student or supervisor on the left to start chatting.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
