// File: src/components/CSSAiAssistant.jsx
import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

export default function CSSAiAssistant({ onLessonSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post(`${API}/api/ai-local/css-smart-search`, { question });
      const data = res.data;
      setResponse(data);

      // ✅ توجيه المستخدم تلقائيًا للدرس
      if (data.lessonId && onLessonSelect) {
        onLessonSelect(data.lessonId);
      }
    } catch (err) {
      console.error("❌ Error asking AI:", err);
      setResponse({ explanation: "⚠️ Failed to connect to AI service." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🤖 الزر العائم */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 bg-gradient-to-br from-blue-500 to-blue-700 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-40"
      >
        🤖
      </button>

      {/* 🧩 نافذة الذكاء الاصطناعي */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 bg-white border border-gray-200 shadow-2xl rounded-2xl w-80 p-4 z-40">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">AI CSS Helper</h3>
          <textarea
            className="w-full border rounded-lg p-2 text-sm mb-2"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about CSS... (e.g., how to center a div)"
          ></textarea>
          <button
            onClick={handleAsk}
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-1.5 rounded-lg hover:bg-blue-600"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>

          {response && (
            <div className="mt-3 text-sm text-gray-700">
              <p>{response.explanation}</p>
              <p className="text-gray-500 text-xs mt-1">
                🎯 Suggested Lesson: <strong>{response.lesson}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
