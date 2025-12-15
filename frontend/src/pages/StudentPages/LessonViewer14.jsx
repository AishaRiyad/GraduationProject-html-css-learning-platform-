import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Quiz from "../../components/StudentComponents/Quiz";
import axios from "axios";

export default function LessonViewer14() {
  const [lesson, setLesson] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const API = "http://localhost:5000";

  // 🔹 تحميل الدرس
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/40`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load Lesson 14", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  if (loading)
    return <div className="text-center text-gray-500 p-10">Loading lesson...</div>;
  if (!lesson)
    return <div className="text-center text-red-500 p-10">Lesson not found</div>;

  // 🧠 استخراج أداة الـ AI
  const aiTool = lesson.sections
    .flatMap((sec) => sec.content)
    .find((item) => item?.type === "ai-tool");

  return (
    <div className="min-h-screen bg-[#FFFDF6] py-10 px-6 md:px-16 relative">
      {/* 🔹 عنوان الدرس */}
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#A66300] mb-3">
          {lesson.title}
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto">{lesson.description}</p>
      </header>

      {/* 🔹 الأقسام */}
      <div className="space-y-8 max-w-4xl mx-auto">
        {lesson.sections.map((sec, i) => (
          <motion.div
            key={i}
             id={`section-${i}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-md border border-amber-200 overflow-hidden"
          >
            <button
              className="w-full text-left p-5 flex justify-between items-center hover:bg-amber-50"
              onClick={() =>
                setExpandedSection(expandedSection === i ? null : i)
              }
            >
              <h2 className="text-lg md:text-xl font-semibold text-[#A66300] flex items-center gap-2">
                {sec.title}
              </h2>
              <span className="text-amber-600">
                {expandedSection === i ? "−" : "+"}
              </span>
            </button>

            <AnimatePresence>
              {expandedSection === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="p-5 pt-0 border-t border-amber-100"
                >
                  {sec.content.map((block, j) => {
                    if (typeof block === "string") {
                      return (
                        <p
                          key={j}
                          className="text-gray-800 leading-relaxed mb-3 whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: block }}
                        />
                      );
                    }

                    if (block.type === "list") {
                      return (
                        <ul
                          key={j}
                          className="list-disc pl-6 text-gray-800 space-y-1"
                        >
                          {block.items.map((item, k) => (
                            <li key={k} dangerouslySetInnerHTML={{ __html: item }} />
                          ))}
                        </ul>
                      );
                    }

                    if (block.type === "code-demo") {
                      return (
                        <div
                          key={j}
                          className="my-4 bg-[#FFF9E8] border border-amber-200 rounded-xl p-4 font-mono text-sm relative"
                        >
                          <pre className="overflow-x-auto">
                            <code>{block.code}</code>
                          </pre>
                          {block.note && (
                            <p className="mt-3 text-sm text-[#A66300] italic">
                              💡 {block.note}
                            </p>
                          )}
                        </div>
                      );
                    }

                    if (block.type === "ai-tool") {
                      return (
                        <div
                          key={j}
                          className="p-4 bg-[#FFF8E1] border border-amber-300 rounded-xl mt-3"
                        >
                          <p className="text-sm text-[#A66300] mb-2">
                            🤖 {block.description}
                          </p>
                          <button
                            onClick={() => setShowChat(true)}
                            className="bg-[#A66300] text-white px-4 py-2 rounded-lg hover:bg-[#C47E00] transition text-sm font-semibold shadow-md"
                          >
                            💬 Open {block.name}
                          </button>
                        </div>
                      );
                    }

                    return null;
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* 🧾 كويز */}
      <div className="max-w-3xl mx-auto mt-16 bg-white rounded-2xl shadow-md border border-amber-200 p-6">
        <h3 className="text-2xl font-bold text-[#A66300] mb-6">🧠 Quiz Time</h3>

        {lesson.quiz && lesson.quiz.quiz ? (
          <LessonQuiz
            quizBlock={{ quiz: normalizeQuiz(lesson.quiz.quiz) }}
            quizPassed={quizPassed}
            setQuizPassed={setQuizPassed}
          />
        ) : (
          <p className="text-stone-600">No quiz found for this lesson.</p>
        )}

        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <button
            onClick={() =>
              (window.location.href = "http://localhost:3000/lesson-viewer/39")
            }
            className="px-5 py-2 rounded-full bg-amber-50 text-[#A66300] font-semibold hover:bg-amber-100 transition"
          >
            ⬅️ Previous Lesson
          </button>
          <button
            onClick={() =>
              quizPassed
                ? (window.location.href =
                    "http://localhost:3000/lesson-viewer/41")
                : null
            }
            disabled={!quizPassed}
            className={`px-5 py-2 rounded-full font-semibold shadow-md transition
              ${
                quizPassed
                  ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:opacity-90"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            Next Lesson ➡️
          </button>
        </div>
      </div>

      {/* 🏁 زر العودة */}
      <div className="text-center mt-12">
        <a
          href="/lessons"
          className="inline-block px-6 py-2.5 rounded-full border border-[#A66300] text-[#A66300] font-semibold hover:bg-[#A66300] hover:text-white transition"
        >
          ← Back to Lessons
        </a>
      </div>

      {/* 💬 نافذة الشات الجانبية */}
      {aiTool && (
        <AccessibilityChatSidebar
          show={showChat}
          onClose={() => setShowChat(false)}
          endpoint={aiTool.endpoint}
          placeholder={aiTool.placeholder}
        />
      )}
            {/* 🟡 Floating Table of Contents Button */}
      {lesson.sections && (
        <FloatingTOC sections={lesson.sections} />
      )}

    </div>
  );
}
// ==========================
// 🟡 مكون جدول المحتويات العائم
// ==========================
function FloatingTOC({ sections }) {
  const [open, setOpen] = useState(false);

  const scrollToSection = (index) => {
    const el = document.getElementById(`section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* الزر الدائري */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:bg-amber-600 transition"
        title="Table of Contents"
      >
        📚
      </button>

      {/* القائمة العائمة */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 left-0 bg-white border border-amber-200 rounded-2xl shadow-xl p-4 w-60"
          >
            <h4 className="text-[#A66300] font-bold mb-2 text-center">
              Lesson Sections
            </h4>
            <ul className="space-y-2">
              {sections.map((sec, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollToSection(i)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 text-sm text-gray-800"
                  >
                    {sec.title.replace(/^[^a-zA-Z0-9]+/, "")}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ✅ الكويز
function normalizeQuiz(raw) {
  const questions = Array.isArray(raw) ? raw : raw?.questions || [];
  return {
    questions: questions.map((q) => {
      if (typeof q.answer === "number") return q;
      const correctIndex = (q.options || []).findIndex(
        (opt) =>
          String(opt).trim().toLowerCase() ===
          String(q.answer).trim().toLowerCase()
      );
      return { ...q, answer: correctIndex !== -1 ? correctIndex : 0 };
    }),
  };
}

// ✅ عرض الكويز
function LessonQuiz({ quizBlock, quizPassed, setQuizPassed }) {
  const questions = quizBlock?.quiz?.questions || [];
  if (!questions.length)
    return <p className="text-stone-600">No questions found.</p>;

  return (
    <div className="bg-[#FFF8E1] border border-amber-200 rounded-2xl p-5">
      <Quiz
        lessonId={40}
        questions={questions}
        totalQuestions={questions.length}
        onPassed={() => setQuizPassed(true)}
      />
      <p className="mt-3 text-sm text-[#A66300]">
        {quizPassed
          ? "🎉 Excellent! You passed the quiz and unlocked the next lesson."
          : "Complete the quiz to unlock the next lesson."}
      </p>
    </div>
  );
}

// 💬 الشات الجانبي
function AccessibilityChatSidebar({ show, onClose, endpoint, placeholder }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!question.trim()) return;
    const userMsg = { from: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        question,
      });
      const aiMsg = { from: "ai", text: res.data.answer || "No reply." };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ Error connecting to AI assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[350px] bg-white border-l border-amber-200 shadow-xl transition-transform duration-300 z-50 flex flex-col
      ${show ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* Header */}
      <div className="bg-[#A66300] text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold text-sm">💬 Accessibility Helper Chat</h3>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-lg"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto bg-[#FFFDF6]">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[85%] ${
              m.from === "user"
                ? "ml-auto bg-amber-200 text-[#4A2E00]"
                : "bg-[#FFF8E1] text-[#4A2E00]"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <p className="text-xs text-gray-500 italic">Assistant is typing...</p>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-amber-200 p-3 flex items-center gap-2 bg-white">
        <input
          type="text"
          placeholder={placeholder}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 border border-amber-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-400"
        />
        <button
          onClick={sendMessage}
          className="bg-[#A66300] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#C47E00] transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
