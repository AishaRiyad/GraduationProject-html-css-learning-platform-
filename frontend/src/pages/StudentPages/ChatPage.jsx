// src/pages/student/ChatPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSocket } from "../../socket";

const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const API = `${ROOT}/api/chat`;

function authHeaders(extra) {
  const t = localStorage.getItem("token");
  return { ...(extra || {}), ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

const normRole = (r) => String(r || "").trim().toLowerCase();

export default function ChatPage() {
  const nav = useNavigate();
  const location = useLocation();

  const [partners, setPartners] = useState([]); // ADMINS ONLY
  const [supervisor, setSupervisor] = useState(null);

  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // stable partner param (string) from URL
  const partnerFromHeader = useMemo(() => {
    const q = new URLSearchParams(location.search);
    return q.get("partner");
  }, [location.search]);

  const [onlineMap, setOnlineMap] = useState({});
  const activePartnerRef = useRef(null);

  // prevents repeatedly opening same thread from URL when partners updates
  const openedFromHeaderRef = useRef(null);

  // abort previous thread fetch when opening a new one
  const threadAbortRef = useRef(null);

  useEffect(() => {
    activePartnerRef.current = activePartner;
  }, [activePartner]);

  useEffect(() => {
    loadPartners();
  }, []);

 
  useEffect(() => {
    if (!partnerFromHeader) return;

    const pid = Number(partnerFromHeader);
    if (!pid) return;

    const canOpen =
      (partners && partners.length > 0) || (supervisor && supervisor.id);
    if (!canOpen) return;

    // if already opened this pid from URL, do nothing
    if (openedFromHeaderRef.current === pid) return;

    // if already active partner is pid, do nothing
    if (activePartnerRef.current?.id === pid) {
      openedFromHeaderRef.current = pid;
      return;
    }

    openedFromHeaderRef.current = pid;
    openThread(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerFromHeader, partners, supervisor]);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    s.on("chat:newMessage", (msg) => {
      const partner = activePartnerRef.current;
      if (!partner) return;

      const isWithActive =
        (msg.sender_id === partner.id) || (msg.receiver_id === partner.id);

      if (isWithActive) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // mark read if partner sent it
        if (msg.sender_id === partner.id) {
          s.emit("mark_thread_read", { partnerId: partner.id });
        }
      }

      // update partners list unread (admins list only)
      const body = msg.body;
      const senderId = msg.sender_id;

      setPartners((prev) =>
        prev.map((p) =>
          p.id === senderId
            ? { ...p, unread: (p.unread || 0) + 1, lastMessage: body }
            : p
        )
      );
    });

    s.on("presence:bulk", ({ onlineUserIds }) => {
      setOnlineMap(() => {
        const map = {};
        (onlineUserIds || []).forEach((id) => {
          map[id] = true;
        });
        return map;
      });
    });

    s.on("presence:update", ({ userId, online }) => {
      setOnlineMap((prev) => ({ ...prev, [userId]: online }));
    });

    s.on("chat:readAll", ({ partnerId }) => {
      setPartners((prev) =>
        prev.map((p) => (p.id === partnerId ? { ...p, unread: 0 } : p))
      );
    });

    return () => {
      s.off("chat:newMessage");
      s.off("presence:bulk");
      s.off("presence:update");
      s.off("chat:readAll");
    };
  }, []);

  async function loadPartners() {
    try {
      const r = await fetch(`${API}/partners`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`partners HTTP ${r.status}`);
      const data = await r.json();
      const arr = Array.isArray(data) ? data : [];

      const sup = arr.find((u) => normRole(u.role) === "supervisor") || null;
      setSupervisor(sup);

      const adminsOnly = arr.filter((u) => normRole(u.role) === "admin");
      setPartners(adminsOnly);
    } catch (e) {
      console.error(e);
      alert("Failed to load chat partners.");
      setSupervisor(null);
      setPartners([]);
    }
  }

  async function openThread(userId) {
    //  abort previous fetch to avoid piling requests
    try {
      if (threadAbortRef.current) threadAbortRef.current.abort();
    } catch {}
    const controller = new AbortController();
    threadAbortRef.current = controller;

    setLoadingMsgs(true);
    setEditingId(null);
    setText("");

    try {
      const r = await fetch(`${API}/thread/${userId}`, {
        headers: authHeaders(),
        signal: controller.signal,
      });
      if (!r.ok) throw new Error(`thread HTTP ${r.status}`);
      const data = await r.json();

      //  dedupe by id just in case backend returns duplicates
      const arr = Array.isArray(data) ? data : [];
      const seen = new Set();
      const unique = [];
      for (const m of arr) {
        if (!m || seen.has(m.id)) continue;
        seen.add(m.id);
        unique.push(m);
      }
      setMessages(unique);

      const p =
        partners.find((x) => x.id === userId) ||
        (supervisor && supervisor.id === userId ? supervisor : null);

      setActivePartner(p);

      fetch(`${API}/thread/${userId}/read`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
      }).catch(() => {});

      const s = getSocket();
      if (s) s.emit("mark_thread_read", { partnerId: userId });
    } catch (e) {
      // ignore abort error
      if (String(e?.name) === "AbortError") return;
      console.error(e);
      alert("Failed to load messages.");
    } finally {
      // only stop loading if this is the latest controller
      if (threadAbortRef.current === controller) {
        setLoadingMsgs(false);
      }
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
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
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
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setText("");
    } catch (e) {
      console.error(e);
      alert("Failed to send message.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4 text-pink-700">Messages</h1>

      <div className="grid grid-cols-[260px,1fr] gap-4">
        <aside className="border rounded-2xl bg-white/90 p-3 shadow-sm">
          <h2 className="font-semibold mb-2 text-pink-700 text-sm uppercase tracking-wide">
            Supervisor
          </h2>

          {supervisor ? (
            <button
              type="button"
              onClick={() => openThread(supervisor.id)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-yellow-50"
            >
              <div>
                <div className="font-medium flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      onlineMap[supervisor.id] ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span>{supervisor.full_name || supervisor.name}</span>
                </div>
                <div className="text-xs text-gray-500">{supervisor.email}</div>
              </div>
              <div className="text-[10px]">
                {onlineMap[supervisor.id] ? (
                  <span className="text-green-600 font-semibold">Active now</span>
                ) : (
                  <span className="text-gray-400">Offline</span>
                )}
              </div>
            </button>
          ) : (
            <div className="text-xs text-gray-500">No supervisor available.</div>
          )}

          <div className="border-t my-3" />

          <h2 className="font-semibold mb-2 text-pink-700 text-sm uppercase tracking-wide">
            Admins
          </h2>

          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {partners.map((p) => {
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
            })}

            {partners.length === 0 && (
              <div className="text-xs text-gray-500">No admins available.</div>
            )}
          </div>
        </aside>

        <section className="border rounded-2xl bg-white/90 p-3 flex flex-col shadow-sm">
          {activePartner ? (
            <>
              <header className="border-b pb-2 mb-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-pink-700 flex items-center gap-2">
                    <span>{activePartner.name || activePartner.full_name}</span>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        onlineMap[activePartner.id] ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div className="text-xs text-gray-500">{activePartner.email}</div>
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
                        <div className="mt-1 text-[10px] text-gray-500">
                          {msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}
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
                    No messages yet. Say hi 👋
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
              Select an admin on the left to start chatting.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
