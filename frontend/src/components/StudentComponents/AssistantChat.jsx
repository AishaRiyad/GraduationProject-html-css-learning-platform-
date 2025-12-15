import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function AssistantChat({ isOpen, onClose, initialHtml }) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const send = async () => {
    if (!input.trim()) return;

    const newHistory = [...history, { role: "user", content: input }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/assist`, {
        html: initialHtml || "",
        question: input,
        history: newHistory,
      });

      const answer = res.data?.answer || "لم يصل رد من الخادم.";
      setHistory((h) => [...h, { role: "assistant", content: answer }]);
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "تعذر إحضار الرد حالياً.";
      setHistory((h) => [...h, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[500px] shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="font-semibold">AI Help</h2>
          <button onClick={onClose}>✖</button>
        </div>

        <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2">
          {history.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "text-right text-blue-700"
                  : "text-left text-green-700"
              }
            >
              {m.content}
            </div>
          ))}
          {loading && <div className="text-gray-500 text-sm">جاري الرد...</div>}
        </div>

        <div className="p-3 border-t flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="اكتب سؤالك..."
            className="flex-1 border rounded px-2 py-1"
          />
          <button
            onClick={send}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-1 rounded"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}
