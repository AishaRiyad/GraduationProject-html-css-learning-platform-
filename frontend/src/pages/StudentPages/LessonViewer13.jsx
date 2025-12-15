// src/pages/LessonViewer13.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Quiz from "../../components/StudentComponents/Quiz";
import BoxVisualizer from "../../components/StudentComponents/BoxVisualizer";
import { ChevronLeft } from "lucide-react";

// ==================================================
// 🌟 LessonViewer13 — Live Page Layout View
// - Reads from /data/basic_13.json
// - Layout: <header> / <main> / <aside> / <footer>
// - Quiz in footer; Next button enabled after pass
// - AI Smart Layout Builder in <aside>
// ==================================================
export default function LessonViewer13() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizPassed, setQuizPassed] = useState(false);

  const API = "http://localhost:5000";

  // 🔹 تحميل الدرس من قاعدة البيانات
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/39`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load Lesson 13", e);
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

 let contentSections = [];
let quizBlock = null;

if (lesson) {
  const sectionsWithoutQuiz = (lesson.sections || []).filter((sec) => {
    if (sec.quiz) {
      quizBlock = { quiz: normalizeQuiz(sec.quiz) };
      return false;
    }
    return true;
  });

  if (!quizBlock && lesson.quiz) {
    quizBlock = { quiz: normalizeQuiz(lesson.quiz) };
  }

  contentSections = sectionsWithoutQuiz;
}

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-100">
      {/* ======= Top Nav ======= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 flex items-center justify-between">
        <button
          onClick={() => (window.location.href = "http://localhost:3000/lessons")}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-semibold rounded-full shadow-sm transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <span className="text-xs md:text-sm text-amber-700/80">
          HTML Layout & Containers — Live Structure View
        </span>
      </div>

      {/* ======= PAGE LAYOUT CONTAINERS ======= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {/* <header> */}
        <LabeledContainer label="<header>" className="mt-6">
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-200

 text-white rounded-3xl shadow-md p-8 relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/15 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-sm">
              {lesson.title}
            </h1>
            <p className="text-amber-50/90 text-base md:text-lg max-w-3xl mt-3">
              {lesson.description}
            </p>
          </motion.header>
        </LabeledContainer>

      {/* main + aside grid */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
  {/* <main> */}
  <LabeledContainer label="<main>" className="lg:col-span-8">
    <main className="space-y-6">
      {contentSections.map((sec, i) => (
        <div id={`section-${i}`} key={i} className="scroll-mt-28">
          <SectionCard sec={sec} index={i} />
        </div>
      ))}

      {/* لو عندنا Visualizer كبلاسيهولدر */}
      {/* مكان عرض BoxVisualizer لو بدك تركبيه لاحقًا */}
    </main>
  </LabeledContainer>

  {/* <aside> */}
  <LabeledContainer label="<aside>" className="lg:col-span-4">
    <AsidePanel
      lesson={lesson}
      onSelectSection={(index) => {
        const el = document.getElementById(`section-${index}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    />
  </LabeledContainer>
</div>


        {/* <footer> with Quiz */}
        <LabeledContainer label="<footer>" className="mt-6">
          <motion.footer
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-white/70 backdrop-blur-xl border border-amber-200 shadow-[0_0_30px_rgba(250,204,21,0.15)] p-6"
          >
            <h2 className="text-2xl font-extrabold text-amber-700 mb-3">🧠 Quiz Time</h2>
            {!quizBlock ? (
              <p className="text-stone-600">No quiz found for this lesson.</p>
            ) : (
              <LessonQuiz quizBlock={quizBlock} quizPassed={quizPassed} setQuizPassed={setQuizPassed} />
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => (window.location.href = "http://localhost:3000/lesson-viewer/38")}
                className="px-5 py-2 rounded-full bg-amber-100 text-amber-800 font-semibold hover:bg-amber-200 transition"
              >
                ⬅️ Previous Lesson
              </button>
              <button
                onClick={() =>
                  quizPassed ? (window.location.href = "http://localhost:3000/lesson-viewer/40") : null
                }
                disabled={!quizPassed}
                className={`px-5 py-2 rounded-full font-semibold shadow-md transition
                  ${quizPassed
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-white hover:opacity-90"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
              >
                Next Lesson ➡️
              </button>
            </div>
          </motion.footer>
        </LabeledContainer>
      </div>
    </div>
  );
}

/* ================================
   Small helpers
================================ */
function normalizeQuiz(raw) {
  // نقبل شكلين: [{question, options, answer}, ...] أو {questions:[...]}
  const questions = Array.isArray(raw) ? raw : raw?.questions || [];
  // إن احتاج تحويل answer إلى index:
  return {
    questions: questions.map((q) => {
      if (typeof q.answer === "number") return q;
      const correctIndex = (q.options || []).findIndex(
        (opt) => String(opt).trim().toLowerCase() === String(q.answer).trim().toLowerCase()
      );
      return { ...q, answer: correctIndex !== -1 ? correctIndex : 0 };
    }),
  };
}

/* ================================
   Labeled container (header/main/aside/footer)
================================ */
function LabeledContainer({ label, className = "", children }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute -top-3 left-4 z-10 text-[12px] md:text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-300 rounded-full px-3 py-0.5 shadow-sm">
        {label}
      </span>
      <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-amber-200 shadow-[0_0_30px_rgba(250,204,21,0.1)] p-3 md:p-4">
        {children}
      </div>
    </div>
  );
}

/* ================================
   Section Card renderer
================================ */
function SectionCard({ sec, index }) {
  const [showCodeIndex, setShowCodeIndex] = useState(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className="bg-white/80 rounded-2xl border border-amber-200 p-6 shadow-[0_6px_20px_rgba(250,204,21,0.12)]"
    >
      <h3 className="text-2xl font-extrabold text-amber-800 mb-3 flex items-center gap-2">
        {sec.title}
      </h3>

      {/* نص بسيط */}
      {typeof sec.content === "string" && (
        <p className="text-stone-800 leading-relaxed whitespace-pre-line">{sec.content}</p>
      )}

      {/* مصفوفة محتوى */}
      {Array.isArray(sec.content) &&
        sec.content.map((item, i) => {
          // جدول
          if (item.type === "table") {
            return (
              <div key={i} className="overflow-x-auto my-4">
                <table className="w-full border border-amber-300 rounded-xl">
                  <thead className="bg-amber-100">
                    <tr>
                      {item.columns.map((col, j) => (
                        <th
                          key={j}
                          className="border border-amber-200 py-2 px-3 text-left text-amber-900 font-semibold"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {item.rows.map((row, r) => (
                      <tr
                        key={r}
                        className="odd:bg-yellow-50 even:bg-white hover:bg-yellow-100/60 transition"
                      >
                        {row.map((cell, c) => (
                          <td key={c} className="border border-amber-200 py-2 px-3 text-stone-800">
                            <code>{cell}</code>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          // ✅ كود ديمو
          if (item.type === "code-demo") {
            const isOpen = showCodeIndex === i;
            return (
              <div key={i} className="my-4">
                <button
                  onClick={() => setShowCodeIndex(isOpen ? null : i)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all font-medium shadow-md"
                >
                  {isOpen ? "Hide Example" : item.title || "Show Example"}
                </button>

                <AnimatePresence>
                  {isOpen && (
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // أداة AI (تُعرض بالـ aside)
          if (item.type === "ai-tool") {
            return (
              <div key={i} className="text-amber-700/80 italic text-sm">
                (AI tool is available in the sidebar)
              </div>
            );
          }

          // بلاسيهولدر للـ Visualizer
         if (item.type === "interactive" && item.component === "BoxVisualizer") {

  return (
    <div key={i} className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
      <BoxVisualizer />
    </div>
  );
}

          // نص افتراضي
          if (typeof item === "string") {
            return (
              <p key={i} className="text-stone-800 leading-relaxed whitespace-pre-line mt-2">
                {item}
              </p>
            );
          }

          return null;
        })}
    </motion.section>
  );
}

/* ================================
   Aside Panel (AI + TOC)
================================ */
function AsidePanel({ lesson }) {
  // نحاول إيجاد تعريف أداة AI من داخل الأقسام:
  const aiConfig = useMemo(() => {
    for (const sec of lesson.sections || []) {
      if (Array.isArray(sec.content)) {
        for (const item of sec.content) {
          if (item?.type === "ai-tool") return item;
        }
      }
    }
    // افتراضي:
    return {
      endpoint: "/api/ai-local/smart-layout-builder",
      placeholder:
        "Example: Create a page with a header, main section, sidebar on the right, and a footer.",
    };
  }, [lesson]);

  // 🟡 دالة التنقل السلس إلى القسم المحدد
  const scrollToSection = (index) => {
    const el = document.getElementById(`section-${index}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="space-y-6">
      {/* TOC صغير */}
      <div className="rounded-2xl bg-white/80 border border-amber-200 p-5 shadow-sm">
        <h4 className="text-amber-800 font-bold mb-3">📚 Sections</h4>
        <ul className="space-y-2 text-sm">
         {(lesson.sections || []).map((s, i) => (
  <li
    key={i}
    onClick={() => scrollToSection(i)}
    className="flex items-start gap-2 cursor-pointer hover:text-amber-600 transition"
  >
    <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 inline-block" />
    <span className="text-stone-800">{s.title}</span>
  </li>
))}

        </ul>
      </div>

      {/* AI Smart Layout Builder */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-100 p-5 border border-amber-200 shadow-inner"
      >
        <h4 className="font-semibold text-amber-800 mb-3 text-lg">🧠 Smart Layout Builder</h4>
        <AISmartBuilder
          endpoint={aiConfig.endpoint}
          placeholder={aiConfig.placeholder}
        />
      </motion.div>
    </aside>
  );
}


/* ================================
   Quiz Block
================================ */
function LessonQuiz({ quizBlock, quizPassed, setQuizPassed }) {
  const questions = quizBlock?.quiz?.questions || [];
  if (!questions.length) return <p className="text-stone-600">No questions found.</p>;

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
      <Quiz
        lessonId={39}
        questions={questions}
        totalQuestions={questions.length}
        onPassed={() => setQuizPassed(true)}
      />
      <p className="mt-3 text-sm text-stone-600">
        {quizPassed
          ? "🎉 Great job! You passed the quiz and unlocked the next lesson."
          : "Complete the quiz to unlock the next lesson."}
      </p>
    </div>
  );
}

/* ================================
   AI Smart Layout Builder
================================ */
function AISmartBuilder({ endpoint, placeholder }) {
  const [description, setDescription] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const buildLayout = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, { description });

      setOutput(res.data.layout || "No response from AI.");
    } catch (err) {
      setOutput("⚠️ Error connecting to AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        className="w-full p-3 border-2 border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 text-stone-800"
        placeholder={placeholder}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        onClick={buildLayout}
        className="mt-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-5 rounded-xl shadow transition"
      >
        {loading ? "Building..." : "Build My Layout"}
      </button>

      {output && (
        <div className="mt-4 bg-white border border-amber-200 rounded-xl p-4 shadow-sm overflow-x-auto">
          <h5 className="font-semibold text-amber-700 mb-1">🧱 Generated Layout Code:</h5>
          <pre className="text-sm text-stone-700 whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
