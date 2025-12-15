// src/pages/student/StudentContactSupervisor.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";

const API = "http://localhost:5000";
const SUPERVISOR_ID = 20; // 👈 السوبرفايزر المعتمد

// 👇 socket واحد، مع JWT من localStorage
const token = localStorage.getItem("token");
const socket = io(API, {
  auth: { token },
  autoConnect: !!token,
});

export default function StudentContactSupervisor() {
  const [student, setStudent] = useState(null);
  const [supervisor, setSupervisor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // ✅ لو ما في يوزر → رجوع للوجن
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        navigate("/login");
        return;
      }
      const parsed = JSON.parse(raw);
      setStudent(parsed);
    } catch (e) {
      console.error("Invalid user in localStorage:", e);
      navigate("/login");
    }
  }, [navigate]);

  // ✅ جلب السوبرفايزر المحدد + الرسائل
  useEffect(() => {
    if (!student) return;

    const fetchSupervisorAndMessages = async () => {
      try {
        // 1) جلب السوبرفايزر id 20
        const supRes = await axios.get(
          `${API}/api/supervisor-chat/supervisor/${SUPERVISOR_ID}`
        );
        const sup = supRes.data.supervisor;
        setSupervisor(sup);

        // 2) الرسائل بين الطالب والسوبرفايزر
        const msgRes = await axios.get(
          `${API}/api/supervisor-chat/messages/${sup.id}/${student.id}`
        );
        setMessages(msgRes.data.messages || []);

        // 3) علامة مقروء لرسائل السوبرفايزر
        await axios.post(`${API}/api/supervisor-chat/read`, {
          supervisorId: sup.id,
          studentId: student.id,
        });

        scrollToBottom();
      } catch (err) {
        console.error("Error loading supervisor chat:", err);
      }
    };

    fetchSupervisorAndMessages();
  }, [student]);

  // ✅ سكروول لأسفل
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ استقبال الرسائل + typing من الـ socket
  useEffect(() => {
    if (!student) return;

    const handleReceive = (msg) => {
      if (
        (msg.sender_id === student.id && msg.receiver_id === supervisor?.id) ||
        (msg.sender_id === supervisor?.id && msg.receiver_id === student.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = (payload) => {
      if (payload.from === supervisor?.id && payload.to === student.id) {
        setTyping(true);
      }
    };

    const handleStopTyping = (payload) => {
      if (payload.from === supervisor?.id && payload.to === student.id) {
        setTyping(false);
      }
    };

    socket.on("receive_message", handleReceive);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [student, supervisor]);

  // ✅ كتابة الرسالة + typing indicator
  const handleChangeText = (e) => {
    const value = e.target.value;
    setText(value);

    if (student && supervisor) {
      socket.emit("typing", {
        from: student.id,
        to: supervisor.id,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", {
          from: student.id,
          to: supervisor.id,
        });
      }, 800);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ✅ إرسال رسالة جديدة
  const sendMessage = async () => {
    if (!text.trim() || !student || !supervisor || isSending) return;

    try {
      setIsSending(true);

      const payload = {
        sender_id: student.id,
        receiver_id: supervisor.id,
        content: text.trim(),
      };

      const res = await axios.post(
        `${API}/api/supervisor-chat/send`,
        payload
      );
      const saved = res.data.data || {
        ...payload,
        sent_at: new Date().toISOString(),
      };

      socket.emit("send_message", saved);

      setMessages((prev) => [...prev, saved]);
      setText("");
      scrollToBottom();
    } catch (err) {
      console.error("sendMessage error:", err);
    } finally {
      setIsSending(false);
    }
  };

  // ✅ تعديل / حذف رسائل الطالب فقط
  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (msgId) => {
    try {
      await axios.put(`${API}/api/supervisor-chat/message/${msgId}`, {
        content: editText,
      });

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
      await axios.delete(`${API}/api/supervisor-chat/message/${msgId}`);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err) {
      console.error("deleteMessage error:", err);
    }
  };

  if (!student) return null;

  const studentName = student.full_name || student.name || "Student";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white/80 backdrop-blur rounded-3xl shadow-2xl border border-yellow-100 p-6 md:p-8">
        {/* العنوان العلوي */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-sm text-gray-500 hover:text-yellow-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            Logged in as{" "}
            <span className="font-semibold text-gray-700">{studentName}</span>
          </div>
        </div>

        {/* الشبكة العامة */}
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_2fr] gap-6">
          {/* 👈 لوحة التوضيح */}
          <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 rounded-2xl border border-yellow-100 shadow-inner p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-yellow-700">
                    Contact Your Supervisor
                  </h2>
                  <p className="text-xs text-gray-500">
                    Ask questions, share updates, and get feedback.
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                This section is dedicated to communication between you and your
                supervisor. Use it to clarify doubts, request reviews, or stay
                aligned on your progress.
              </p>

              <div className="bg-white rounded-xl border border-yellow-100 p-3 text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-gray-800 mb-1">
                  How this works:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your messages appear on the right in yellow.</li>
                  <li>Supervisor replies appear on the left in gray.</li>
                  <li>You can edit or delete your own messages.</li>
                  <li>New messages appear instantly in real-time.</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Supervisor assigned:{" "}
              <span className="font-semibold text-gray-700">
                {supervisor?.full_name || "Loading..."}
              </span>
              <br />
              <span className="text-[11px]">
                {supervisor?.email || "Waiting for supervisor data"}
              </span>
            </div>
          </div>

          {/* 👉 صندوق الشات */}
          <div className="bg-white rounded-2xl border border-yellow-100 shadow-lg flex flex-col h-[480px] md:h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-yellow-50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-200 flex items-center justify-center font-semibold text-yellow-800">
                  {supervisor?.full_name?.[0] || "S"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {supervisor?.full_name || "Supervisor"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Private messages between you and your supervisor
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m) => {
                const isMe = m.sender_id === student.id;
                const isEditing = editingId === m.id;

                return (
                  <div
                    key={m.id || m.sent_at}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow
                        ${
                          isMe
                            ? "bg-yellow-200 text-gray-900"
                            : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            className="w-full border rounded-lg p-1 text-sm"
                            rows={2}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />
                          <div className="flex justify-end gap-2 text-[11px]">
                            <button
                              className="px-2 py-1 rounded bg-gray-200"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-2 py-1 rounded bg-yellow-500 text-black"
                              onClick={() => saveEdit(m.id)}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p>{m.content}</p>
                          {isMe && (
                            <div className="flex justify-end gap-3 mt-1 text-[11px] text-gray-600">
                              <button onClick={() => startEdit(m)}>
                                Edit
                              </button>
                              <button
                                className="text-red-600"
                                onClick={() => deleteMessage(m.id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs">
                    {supervisor?.full_name || "Supervisor"} is typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t px-4 py-3 bg-white rounded-b-2xl">
              <div className="flex gap-3 items-center">
                <textarea
                  className="flex-1 border rounded-2xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  rows={2}
                  placeholder="Write a message to your supervisor..."
                  value={text}
                  onChange={handleChangeText}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={sendMessage}
                  disabled={isSending || !text.trim() || !supervisor}
                  className={`px-4 py-2 rounded-2xl font-semibold transition
                    ${
                      isSending || !text.trim() || !supervisor
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-yellow-500 text-black hover:bg-yellow-400"
                    }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
