// File: src/pages/LessonViewer9.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import LiveCodeBox from "../../components/StudentComponents/LiveCodeBox";
import Quiz from "../../components/StudentComponents/Quiz";

export default function LessonViewer9() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showContents, setShowContents] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false); 
  const API = "http://localhost:5000";

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/35`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load lesson 9", e);
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

  const totalSections = lesson.sections.length;
  const section = lesson.sections[currentIndex];
  const progress = ((currentIndex + 1) / totalSections) * 100;

  const next = () => {
    if (currentIndex < totalSections - 1) setCurrentIndex(currentIndex + 1);
  };
  const back = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // ==========================================
  // ⚡️ AI Smart List Builder
  // ==========================================
  const generateList = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await axios.post(`${API}/api/ai-local/generate-list`, {
        topic: aiInput,
      });
      setAiResult(res.data.code || "⚠️ No result from AI");
    } catch (err) {
      setAiResult("❌ Error connecting to AI");
    } finally {
      setAiLoading(false);
    }
  };
// 🧠 مكوّن صغير للفصل بين الحالة والـre-render
const SmartListAI = ({ aiTask, API }) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await axios.post(`${API}/api/ai-local/generate-list`, {
        topic: input,
      });
      setResult(res.data.code || "⚠️ No result");
    } catch {
      setResult("❌ Error generating list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#FFF9E5] to-[#FFF3C4] border border-yellow-300 rounded-2xl p-6 shadow-inner">
      <p className="text-[#5D4037] font-medium mb-3">{aiTask.instruction}</p>

      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder={aiTask.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow px-4 py-2 border border-yellow-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="px-5 py-2 rounded-full bg-[#F5B700] hover:bg-[#F1A500] text-white font-semibold shadow-md transition"
        >
          {loading ? "⏳ Generating..." : aiTask.buttonLabel}
        </button>
      </div>

      {result && (
        <div className="mt-5">
          <LiveCodeBox initialCode={result} />
        </div>
      )}
    </div>
  );
};

  // ==========================================
  // 🧩 Section Renderer
  // ==========================================
  const renderSection = (sec) => {
    const { title, content, example, interaction, aiTask, table, quiz } = sec;

    // 🎨 Styled container
    const Container = ({ children }) => (
  <motion.div
    layout       // 👈 يفعّل “smart layout animation” بدل ما يعيد التحريك من الصفر
    transition={{ duration: 0.3 }}
    className="bg-white/70 backdrop-blur-md border border-yellow-100 rounded-3xl p-8 shadow-lg text-left"
  >
    {children}
  </motion.div>
);


    // 📊 Table Section
    if (table) {
      return (
        <Container>
          <h2 className="text-3xl font-extrabold text-[#5D4037] mb-4">{title}</h2>
          <p className="text-gray-800 text-lg leading-relaxed mb-6">{content}</p>
          <div className="overflow-x-auto rounded-xl border border-yellow-200 shadow-inner">
            <table className="w-full text-center border-collapse">
              <thead className="bg-[#FFF8E1] text-[#4E342E] font-bold">
                <tr>
                  {table.headers.map((h, i) => (
                    <th key={i} className="px-4 py-2 border border-yellow-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-[#FFFDF0]"}
                  >
                    {r.map((c, j) => (
                      <td
                        key={j}
                        className="px-4 py-2 border border-yellow-100 text-gray-700"
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      );
    }

    // 💡 Example Section
    if (example) {
      return (
        <Container>
          <h2 className="text-3xl font-extrabold text-[#4E342E] mb-3">{title}</h2>
          <p className="text-gray-800 text-lg leading-relaxed mb-6">{content}</p>
          <LiveCodeBox initialCode={example.code} />
        </Container>
      );
    }

    // ⚡ AI Smart List Builder Section
   if (aiTask) {
  return (
    <Container>
      <h2 className="text-3xl font-extrabold text-[#5D4037] mb-3">{title}</h2>
      <p className="text-gray-800 text-lg leading-relaxed mb-4">{content}</p>
      <SmartListAI aiTask={aiTask} API={API} />
    </Container>
  );
}


    // 🧩 Quiz Section
    if (quiz) {
  const processedQuestions = quiz.map((q) => {
    const answerIndex = q.options.findIndex(
      (opt) => opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
    );
    return { ...q, answer: answerIndex !== -1 ? answerIndex : 0 };
  });

  return (
    <Container>
      <h2 className="text-3xl font-extrabold text-[#4E342E] mb-4 text-center">
        {title}
      </h2>

      {/* 🧠 مكون الكويز */}
      <Quiz
        lessonId={35}
        questions={processedQuestions}
        totalQuestions={processedQuestions.length}
        onPassed={() => {
          setQuizPassed(true); // ✅ يحدث الحالة العالمية
        }}
      />

      {/* 🟡 أزرار التنقل بعد الكويز */}
      <div className="flex justify-center gap-6 mt-10">
        {/* 🔙 زر الدرس السابق */}
        <button
          onClick={() => (window.location.href = "http://localhost:3000/lesson-viewer/34")}
          className="px-6 py-2 bg-[#FFF5CC] hover:bg-[#FFE88F] text-[#4E342E] font-semibold rounded-full shadow-sm transition"
        >
          ⬅️ Previous Lesson
        </button>

        {/* 🔜 زر الدرس التالي */}
        <button
          onClick={() =>
            quizPassed
              ? (window.location.href = "http://localhost:3000/lesson-viewer/36")
              : null
          }
          disabled={!quizPassed}
          className={`px-6 py-2 rounded-full font-semibold shadow-md transition ${
            quizPassed
              ? "bg-[#F5B700] hover:bg-[#F1A500] text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next Lesson ➡️
        </button>
      </div>

      {/* 💬 ملاحظة صغيرة */}
      <p className="text-center mt-4 text-sm text-gray-500 italic">
        {quizPassed
          ? "🎉 You passed! The next lesson is now unlocked."
          : "Finish and pass the quiz to unlock the next lesson."}
      </p>
    </Container>
  );
}


    // 📝 Default Section
    return (
      <Container>
        <h2 className="text-3xl font-extrabold text-[#5D4037] mb-3">{title}</h2>
        <p className="text-gray-800 text-lg leading-relaxed mb-4">{content}</p>
      </Container>
    );
  };

  // ==========================================
  // 🖼️ Page Layout
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF2] via-[#FFF8E1] to-[#FFF2C1] font-sans relative">
         {/* 🔙 Back to Lessons */}
      <button
        onClick={() => (window.location.href = "http://localhost:3000/lessons")}
        className="fixed top-20 right-6 z-50 px-5 py-2.5 bg-[#FFF9E5] hover:bg-[#FFF3C4] text-[#5D4037] font-semibold rounded-full shadow-md border border-yellow-200 transition-all"
      >
        ⬅️ Back to Lessons
      </button>

      {/* 📚 Contents Button */}
      <div className="fixed top-20 left-6 z-50">
        <button
          onClick={() => setShowContents(!showContents)}
          className="px-5 py-2 bg-[#F5B700] hover:bg-[#F1A500] text-white font-semibold rounded-full shadow-md transition"
        >
          📚 Lesson Contents
        </button>

        {/* 🧭 Contents Menu */}
        <AnimatePresence>
          {showContents && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-20 left-0 bg-white border border-yellow-200 rounded-2xl shadow-xl w-64 p-3"
            >
              <h3 className="text-[#5D4037] font-bold text-center mb-2">
                Sections
              </h3>
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {lesson.sections.map((sec, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        setCurrentIndex(i);
                        setShowContents(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                        i === currentIndex
                          ? "bg-[#FFF5CC] text-[#5D4037] font-semibold"
                          : "text-gray-700 hover:bg-yellow-100"
                      }`}
                    >
                      {sec.title.replace(/^[^a-zA-Z]+/, "")}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gray-200 z-50">
        <div
          className="h-full bg-[#F5B700] transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Header */}
      <header className="py-14 text-center bg-gradient-to-r from-[#FFF3C4] to-[#FFF9E5] shadow-sm">
        <h1 className="text-5xl font-extrabold text-[#5D4037] mb-3">
          {lesson.title}
        </h1>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          {lesson.description}
        </p>
      </header>

      {/* Lesson Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.6 }}
          >
            {renderSection(section)}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-10">
              <button
                onClick={back}
                disabled={currentIndex === 0}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  currentIndex === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#FFF5CC] hover:bg-[#FFE88F] text-[#4E342E] shadow-sm"
                }`}
              >
                ⬅️ Back
              </button>

              {currentIndex < totalSections - 1 && (
                <button
                  onClick={next}
                  className="px-6 py-2 bg-[#F5B700] hover:bg-[#F1A500] text-white font-semibold rounded-full shadow-md transition"
                >
                  Next ➡️
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
