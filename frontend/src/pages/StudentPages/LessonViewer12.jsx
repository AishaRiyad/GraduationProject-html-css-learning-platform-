import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Brain,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import Quiz from "../../components/StudentComponents/Quiz";

// ===============================
// 🧠 الكومبوننت الرئيسي
// ===============================
export default function LessonViewer12() {
  const [lesson, setLesson] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const API = "http://localhost:5000";

  // 🔹 تحميل محتوى الدرس
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/38`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load Lesson 12", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500 p-10">Loading lesson...</div>
    );
  if (!lesson)
    return (
      <div className="text-center text-red-500 p-10">Lesson not found</div>
    );

  // ✅ الشرائح = جميع الأقسام + بطاقة الكويز من المستوى الأعلى
  const slides = [...lesson.sections, { quiz: lesson.quiz }];

  // 🔸 التنقل بين البطاقات
  const nextSlide = () =>
    setCurrentIndex((i) => (i + 1 < slides.length ? i + 1 : i));
  const prevSlide = () =>
    setCurrentIndex((i) => (i - 1 >= 0 ? i - 1 : i));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-br from-yellow-50 via-white to-amber-100 overflow-hidden relative">
  {/* 🟡 شريط علوي للتنقل بين الأقسام */}
<div className="w-full flex justify-between items-center mb-6 px-4 md:px-10">
  {/* زر الرجوع إلى صفحة الدروس */}
  <button
    onClick={() => (window.location.href = "http://localhost:3000/lessons")}
    className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-semibold rounded-full shadow-sm transition"
  >
    <ChevronLeft className="w-4 h-4" />
    Back
  </button>

  {/* قائمة الأقسام + الكويز */}
  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
    {lesson.sections.map((section, i) => (
      <button
        key={i}
        onClick={() => setCurrentIndex(i)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          currentIndex === i
            ? "bg-amber-500 text-white shadow-md"
            : "bg-amber-100 text-amber-700 hover:bg-amber-200"
        }`}
      >
        {section.title}
      </button>
    ))}

    {/* 🔸 زر الكويز */}
    <button
      onClick={() => setCurrentIndex(lesson.sections.length)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
        currentIndex === lesson.sections.length
          ? "bg-amber-500 text-white shadow-md"
          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
      }`}
    >
      🧩 Quiz
    </button>
  </div>
</div>


      {/* عنوان الدرس */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-amber-700 flex justify-center gap-2 items-center">
          <Code2 className="w-8 h-8 text-amber-500" />
          {lesson.title}
        </h1>
        <p className="text-stone-700 text-lg mt-2 max-w-2xl mx-auto">
          {lesson.description}
        </p>
      </div>

      {/* الأسهم */}
      <button
        onClick={prevSlide}
        disabled={currentIndex === 0}
        className={`fixed left-8 top-1/2 -translate-y-1/2 z-50 bg-amber-400 hover:bg-amber-500 text-white p-4 rounded-full shadow-lg transition ${
          currentIndex === 0 ? "opacity-40 cursor-not-allowed" : ""
        }`}
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={nextSlide}
        disabled={currentIndex === slides.length - 1}
        className={`fixed right-8 top-1/2 -translate-y-1/2 z-50 bg-amber-400 hover:bg-amber-500 text-white p-4 rounded-full shadow-lg transition ${
          currentIndex === slides.length - 1
            ? "opacity-40 cursor-not-allowed"
            : ""
        }`}
      >
        <ChevronRight size={28} />
      </button>

      {/* عرض البطاقة الحالية */}
      <div className="relative w-full max-w-4xl h-[600px] overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 p-10 overflow-y-auto"
          >
            {renderSlide(slides[currentIndex], currentIndex, setQuizPassed, quizPassed)
            }
          </motion.div>
        </AnimatePresence>
      </div>

      {/* نقاط التقدم */}
      <div className="flex justify-center mt-6 gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${
              i === currentIndex ? "bg-amber-600 scale-125" : "bg-amber-300"
            } transition-all`}
          />
        ))}
      </div>
    </div>
  );
}

// ==================================================
// 🧱 عرض البطاقة الواحدة (قسم أو كويز)
// ==================================================
function renderSlide(sec, index, setQuizPassed, quizPassed) {
  // 🎯 بطاقة الكويز (من المستوى الأعلى)
  if (sec.quiz) {
    const processedQuestions = sec.quiz.questions.map((q) => {
      if (typeof q.answer === "number") return q; // جاهزة
      const correctIndex = q.options.findIndex(
        (opt) => opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
      );
      return { ...q, answer: correctIndex !== -1 ? correctIndex : 0 };
    });

    return (
      <motion.div
        key="quiz"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center h-full text-center"
      >
        <h2 className="text-3xl font-bold text-amber-700 mb-6 flex items-center gap-2 justify-center">
          <Sparkles className="w-6 h-6 text-amber-600" /> 🧩 Quick Quiz
        </h2>

        <Quiz
          lessonId={38}
          questions={processedQuestions}
          totalQuestions={processedQuestions.length}
          onPassed={() => setQuizPassed(true)}
        />

        <p className="mt-4 text-sm text-stone-500">
          {quizPassed
            ? "🎉 Great job! You passed the quiz and unlocked the next lesson."
            : "Complete the quiz to unlock the next lesson."}
        </p>

        {/* 🔹 أزرار التنقل */}
        <div className="flex justify-center gap-6 mt-10">
          {/* زر العودة للدرس السابق */}
          <button
            onClick={() =>
              (window.location.href = "http://localhost:3000/lesson-viewer/37")
            }
            className="px-6 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold rounded-full shadow-sm transition"
          >
            ⬅️ Previous Lesson
          </button>

          {/* زر الدرس التالي */}
          <button
            onClick={() =>
              quizPassed
                ? (window.location.href =
                    "http://localhost:3000/lesson-viewer/39")
                : null
            }
            disabled={!quizPassed}
            className={`px-6 py-2 rounded-full font-semibold shadow-md transition ${
              quizPassed
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white hover:opacity-90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next Lesson ➡️
          </button>
        </div>
      </motion.div>
    );
  }

  // 🧠 الأقسام العادية
  return <InteractiveLessonCard sec={sec} />;
}


// ==================================================
// 🎨 بطاقة القسم التفاعلية
// ==================================================
function InteractiveLessonCard({ sec }) {
  const [showCode, setShowCode] = useState(false);

  return (
    <motion.div
      className="p-8 rounded-3xl shadow-xl border border-amber-200 bg-gradient-to-br from-yellow-50 via-white to-amber-100 relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4 }}
    >
      {/* العنوان */}
      <h2 className="text-3xl font-extrabold text-amber-800 flex items-center gap-2 mb-4">
        <Code2 className="text-amber-600 w-7 h-7" />
        {sec.title}
      </h2>

      {/* النص */}
      {Array.isArray(sec.content)
        ? sec.content.map((item, i) => {
            if (typeof item === "string") {
              return (
                <motion.p
                  key={i}
                  className="text-stone-800 leading-relaxed text-[17px] mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {item}
                </motion.p>
              );
            }

            if (item.type === "code-demo") {
              return (
                <div key={i} className="mt-4">
                  <button
                    onClick={() => setShowCode((prev) => !prev)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all font-medium shadow-md"
                  >
                    {showCode ? "Hide Example" : "Show Example"}
                  </button>
                  <AnimatePresence>
                    {showCode && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm"
                      >
                        <pre className="text-sm text-stone-800 whitespace-pre-wrap">
                          {item.code}
                        </pre>
                        {item.note && (
                          <p className="text-sm text-amber-700 mt-2 italic flex items-center gap-1">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            {item.note}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            if (item.type === "table") {
              return (
                <div key={i} className="overflow-x-auto mt-6">
                  <table className="w-full border border-amber-200 rounded-xl shadow-md bg-gradient-to-br from-yellow-50 via-white to-amber-50">
                    <thead>
                      <tr className="bg-amber-100 text-amber-800">
                        {item.headers.map((h, hi) => (
                          <th
                            key={hi}
                            className="p-3 text-left font-bold text-[16px] border-b border-amber-200"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {item.rows.map((row, ri) => (
                        <tr
                          key={ri}
                          className={`border-t border-amber-100 ${
                            ri % 2 === 0 ? "bg-white/70" : "bg-amber-50/60"
                          } hover:bg-amber-100/60 transition`}
                        >
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              className="p-3 text-stone-800 align-top text-[15px]"
                            >
                              {typeof cell === "string" &&
                              cell.trim().startsWith("<meta") ? (
                                <div className="bg-stone-50 border border-amber-200 rounded-lg p-2 font-mono text-[13px] text-amber-800 shadow-sm">
                                  <pre className="whitespace-pre-wrap">
                                    {cell}
                                  </pre>
                                </div>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            return null;
          })
        : typeof sec.content === "string" && (
            <p className="text-stone-800 leading-relaxed text-[17px]">
              {sec.content}
            </p>
          )}

      {/* 🤖 AI Meta Tag Generator */}
      {sec.ai_feature && (
        <div className="mt-6">
          <AIMetaGenerator />
        </div>
      )}
    </motion.div>
  );
}

// ==================================================
// 🤖 AI Meta Tag Generator
// ==================================================
function AIMetaGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generateMeta = async () => {
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai-local/meta-generator",
        { title, description }
      );
      setResult(res.data.code || "No response received.");
    } catch (err) {
      console.error(err);
      setResult("⚠️ Error: Could not connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="mt-6 p-6 bg-white rounded-2xl shadow-md border border-amber-200"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold text-amber-800 flex items-center gap-2 mb-3">
        <Brain className="w-5 h-5 text-amber-600" /> AI Meta Tag Generator
      </h3>
      <p className="text-stone-700 mb-4">
        Type your page <strong>title</strong> and <strong>description</strong>,
        and let AI generate all meta tags automatically.
      </p>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter page title..."
          className="border border-amber-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Enter page description..."
          className="border border-amber-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <button
          onClick={generateMeta}
          disabled={loading}
          className="bg-amber-500 text-white px-5 py-2 rounded-lg hover:bg-amber-600 transition-all w-fit"
        >
          {loading ? "Generating..." : "Generate Meta Tags 🚀"}
        </button>
      </div>

      {result && (
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-lg p-4 font-mono text-sm text-stone-800 whitespace-pre-wrap">
          {result}
        </div>
      )}
    </motion.div>
  );
}
