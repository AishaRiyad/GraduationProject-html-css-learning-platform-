import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getSocket } from "../../socket";

const API = "http://localhost:5000";

function authHeaders(extra = {}) {
  const t = localStorage.getItem("token");
  if (!t) return { ...extra };
  const auth = t.startsWith("Bearer ") ? t : `Bearer ${t}`;
  return { ...extra, Authorization: auth };
}

export default function ChatWindow({ supervisorId, student, onThreadRead }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const msgText = (m) => m?.content ?? m?.body ?? "";
  const msgTime = (m) => m?.sent_at ?? m?.created_at ?? null;

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${API}/api/supervisor-chat/messages/${supervisorId}/${student.id}`,
        { headers: authHeaders() }
      );

      setMessages(res.data.messages || []);
      scrollToBottom();

      await axios.post(
        `${API}/api/supervisor-chat/read`,
        { supervisorId, studentId: student.id },
        { headers: authHeaders() }
      );

      if (onThreadRead) onThreadRead(student.id);
      localStorage.setItem("supervisor_unread", 0);
    } catch (err) {
      console.error("fetchMessages error:", err);
    }
  };

  useEffect(() => {
    if (!student?.id) return;
    fetchMessages();
  }, [student?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const handleReceive = (msg) => {
      if (
        (msg.sender_id === student.id &&
          msg.receiver_id === supervisorId) ||
        (msg.sender_id === supervisorId &&
          msg.receiver_id === student.id)
      ) {
        setMessages((prev) => {
          if (msg?.id && prev.some((x) => x.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleTyping = (payload) => {
      if (payload?.from === student.id && payload?.to === supervisorId) {
        setTyping(true);
      }
    };

    const handleStopTyping = (payload) => {
      if (payload?.from === student.id && payload?.to === supervisorId) {
        setTyping(false);
      }
    };

    s.on("chat:newMessage", handleReceive);
    s.on("typing", handleTyping);
    s.on("stop_typing", handleStopTyping);

    return () => {
      s.off("chat:newMessage", handleReceive);
      s.off("typing", handleTyping);
      s.off("stop_typing", handleStopTyping);
    };
  }, [student?.id, supervisorId]);

  const handleChangeText = (e) => {
    const value = e.target.value;
    setText(value);

    const s = getSocket();
    if (s) s.emit("typing", { from: supervisorId, to: student.id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      const s2 = getSocket();
      if (s2) s2.emit("stop_typing", { from: supervisorId, to: student.id });
    }, 800);
  };

  const sendMessage = async () => {
    if (!text.trim() || isSending) return;

    try {
      setIsSending(true);

      const payload = {
        sender_id: supervisorId,
        receiver_id: student.id,
        content: text.trim(),
      };

      const res = await axios.post(
        `${API}/api/supervisor-chat/send`,
        payload,
        {
          headers: authHeaders({ "Content-Type": "application/json" }),
        }
      );

      const saved =
        res.data?.data || {
          ...payload,
          id: `${Date.now()}-${Math.random()}`,
          sent_at: new Date().toISOString(),
          is_read: 0,
        };

      const s = getSocket();
      if (s) s.emit("chat:newMessage", saved);

      // ❌ لا نضيف الرسالة هون
      // ✔️ رح تنضاف مرة واحدة من socket listener
      setText("");
    } catch (err) {
      console.error("sendMessage error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msgText(msg));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (msgId) => {
    try {
      await axios.put(
        `${API}/api/supervisor-chat/message/${msgId}`,
        { content: editText },
        { headers: authHeaders({ "Content-Type": "application/json" }) }
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, content: editText } : m))
      );

      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("saveEdit error:", err);
    }
  };

  const deleteMessage = async (msgId) => {
    try {
      await axios.delete(`${API}/api/supervisor-chat/message/${msgId}`, {
        headers: authHeaders(),
      });
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      console.error("deleteMessage error:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg p-4 flex flex-col">
      <div className="border-b pb-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
            <img
              src={student.photo_url || "/user-avatar.jpg"}
              alt={student.full_name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-800">
                {student.full_name}
              </h2>
              <span className="inline-block w-2 h-2 rounded-full bg-gray-300" />
            </div>
            <p className="text-xs text-gray-500">{student.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((m) => {
          const isMe = m.sender_id === supervisorId;
          const isEditing = editingId === m.id;

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-sm max-w-[420px] shadow ${
                  isMe ? "bg-pink-200" : "bg-gray-100"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full border rounded-lg p-2 text-sm"
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button onClick={cancelEdit}>Cancel</button>
                      <button onClick={() => saveEdit(m.id)}>Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap">{msgText(m)}</div>
                    <div className="mt-2 text-[11px] text-gray-600">
                      {msgTime(m)
                        ? new Date(msgTime(m)).toLocaleString()
                        : ""}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="text-xs text-gray-500">
            {student.full_name} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="mt-4 pt-3 border-t flex items-center gap-3"
      >
        <input
          className="flex-1 border rounded-full px-4 py-3 text-sm"
          placeholder="Type a message..."
          value={text}
          onChange={handleChangeText}
          onKeyDown={handleKeyDown}
        />

        <button
          type="submit"
          disabled={isSending || !text.trim()}
          className="px-6 py-3 rounded-full bg-pink-500 text-white text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
