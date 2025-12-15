import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Quiz from "../../components/StudentComponents/Quiz";


// ===============================
// 🤖 AI Embed Helper (Memoized)
// ===============================
const AIEmbedHelperSection = React.memo(function AIEmbedHelperSection({ prompt, exampleResponse }) {
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await axios.post("http://localhost:5000/api/ai-local/embed-generator", {
        question,
      });
      setAnswer(res.data.answer || "No response received.");
    } catch (err) {
      console.error(err);
      setAnswer("⚠️ Error: Could not connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100 rounded-3xl p-8 border border-amber-200 shadow-lg mt-10 max-w-4xl mx-auto">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type your question here... (e.g., How can I embed a YouTube playlist?)"
        className="w-full p-4 border border-amber-300 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-[16px] resize-none"
        rows={3}
      ></textarea>

      <button
        onClick={askAI}
        disabled={loading}
        className="mt-4 bg-[#F5B700] hover:bg-[#E5A400] text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300 disabled:opacity-60"
      >
        {loading ? "Asking AI..." : "Ask AI 🤔"}
      </button>

      {answer && (
        <div className="mt-6 bg-white border border-amber-200 rounded-xl p-5 shadow-inner">
          <h3 className="text-lg font-semibold text-[#064F54] mb-2">AI Response:</h3>
          <pre className="bg-[#f9f9f9] p-3 rounded-lg text-[15px] font-mono text-gray-800 overflow-x-auto">
            {answer}
          </pre>

          {answer.includes("<iframe") && (
            <div className="mt-4 bg-[#fffbe6] border border-amber-100 rounded-lg p-4 flex justify-center">
              <iframe
                srcDoc={answer}
                title="AI Embed Preview"
                loading="lazy"
                className="w-full h-[350px] rounded-lg border-none"
                sandbox="allow-scripts allow-same-origin"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ===============================
// 🧭 Practical Examples Slider (Memoized)
// ===============================
const ExamplesSlider = React.memo(function ExamplesSlider({ title, content }) {
  const [idx, setIdx] = React.useState(0);

  const examples = useMemo(
    () =>
      Array.isArray(content)
        ? content.filter(
            (x) =>
              x?.type === "code-demo" &&
              !(x?.note || "").toLowerCase().includes("local")
          )
        : [],
    [content]
  );

  if (examples.length === 0) return null;
  const current = examples[idx];

  const next = () => setIdx((p) => (p + 1) % examples.length);
  const prev = () => setIdx((p) => (p === 0 ? examples.length - 1 : p - 1));

  return (
    <motion.div

      key={idx}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#fffaf0] border border-amber-200 shadow-xl rounded-3xl p-8 mt-10 mb-14 max-w-5xl mx-auto relative"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-[#064F54] mb-2 flex justify-center items-center gap-2">
          {title}
        </h2>
        <p className="text-gray-700 text-lg">Explore how iframes are used in real-world examples!</p>
      </div>

      <div className="relative bg-white border border-amber-200 shadow-md rounded-2xl p-6">
        <h3 className="text-xl font-bold text-[#C47F00] mb-4">{current?.note}</h3>

        <pre className="bg-[#0d1117] text-[#EAEAEA] rounded-lg p-4 text-left text-sm font-mono overflow-x-auto mb-4">
          {current?.code || ""}
        </pre>

        <div className="bg-[#fff8e1] p-4 rounded-xl flex justify-center">
          <iframe
            srcDoc={current?.code || ""}
            title={`iframe-example-${idx}`}
            loading="lazy"
            className="w-full h-[400px] rounded-lg border-none"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allowFullScreen
          />
        </div>

        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#F5B700] hover:bg-[#E5A400] text-white rounded-full p-3 shadow-lg transition-transform hover:scale-110"
        >
          ⬅
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#F5B700] hover:bg-[#E5A400] text-white rounded-full p-3 shadow-lg transition-transform hover:scale-110"
        >
          ➡
        </button>
      </div>

      <div className="flex justify-center mt-6 gap-2">
        {examples.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === idx ? "bg-[#F5B700] scale-110" : "bg-amber-200"
            }`}
          ></div>
        ))}
      </div>
    </motion.div>
  );
});

// ===============================
// 📘 Main Lesson Page
// ===============================
export default function LessonViewer11() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizPassed, setQuizPassed] = useState(false);
  const API = "http://localhost:5000";
// ✅ IDs لكل قسم لتفعيل التنقل من الفهرس
const slugify = (txt = "", fallback = "section") =>
  (txt || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

const [sectionIds, setSectionIds] = useState([]);

useEffect(() => {
  if (!lesson?.sections) return;
  const ids = lesson.sections.map((sec, i) => {
    if (sec.quiz) return "quiz-section";
    const base = slugify(sec.title || `section-${i + 1}`, `section-${i + 1}`);
    return `${base}-${i + 1}`;
  });
  setSectionIds(ids);
}, [lesson]);

// ✅ دالة التمرير
const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 50;
  window.scrollTo({ top: y, behavior: "smooth" });
};


  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/37`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load Lesson 11", e);
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

  // ===============================
  // 🧾 Render Section Content
  // ===============================
  const renderContent = (section, idx) => {
    if (section?.title?.includes("Practical Embedding Examples")) {
      return <ExamplesSlider key={idx} title={section.title} content={section.content} />;
    }

    return (
      <motion.div
        id={sectionIds[idx]}
        key={idx}
        className="relative backdrop-blur-md bg-white/70 shadow-lg rounded-3xl p-8 mb-10 border border-white/40 hover:scale-[1.01] transition-transform"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold text-teal-800 mb-4">{section.title}</h2>

        {Array.isArray(section.content) &&
          section.content.map((item, i) => {
            if (typeof item === "string") {
              return (
                <p
                  key={i}
                  className="text-[17px] leading-relaxed text-gray-800 mb-4 whitespace-pre-line break-words"
                  dangerouslySetInnerHTML={{
                    __html: item.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                  }}
                />
              );
            }

            if (item.type === "list") {
              return (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                  {item.items.map((line, index) => {
                    const [property, description] = line.split("–").map((s) => s.trim());
                    return (
                      <div
                        key={index}
                        className="group relative bg-white shadow-md border border-amber-200 rounded-2xl p-6 transition-transform transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer overflow-hidden"
                      >
                        <h4 className="text-amber-700 font-semibold text-lg mb-2 text-center">
                          {property}
                        </h4>
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-900 flex items-center justify-center text-center text-sm px-5 py-4 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 rounded-2xl font-medium">
                          {description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (item.type === "code-demo") {
              const previewHTML = `
<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>html,body{margin:0;padding:0;background:transparent;}
.resp{position:relative;width:100%;aspect-ratio:16/9;background:#000;}
.resp iframe, .resp video, .resp object, .resp embed{
position:absolute;inset:0;border:0;width:100% !important;height:100% !important;
max-width:100% !important;max-height:100% !important;display:block;}
</style></head><body><div class="resp">${item.code}</div></body></html>`.trim();

              return (
                <div
                  key={i}
                  className="bg-[#0d1117] text-gray-100 rounded-2xl p-6 my-8 shadow-xl border border-gray-800"
                >
                  <pre className="text-[15px] leading-relaxed whitespace-pre-wrap mb-4 text-amber-50">
                    {item.code}
                  </pre>

                  <div className="rounded-2xl overflow-hidden">
                    <iframe
                      title={`preview-${i}`}
                      srcDoc={previewHTML}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      allowFullScreen
                      className="block w-full"
                      style={{
                        width: "100%",
                        height: "400px",
                        border: "none",
                        background: "transparent",
                      }}
                    />
                  </div>

                  {item.note && <p className="text-sm text-amber-200 mt-4 italic">{item.note}</p>}
                </div>
              );
            }

            if (item.type === "ai-section") {
              return (
                <AIEmbedHelperSection
                  key={i}
                  prompt={item.prompt}
                  exampleResponse={item.exampleResponse}
                />
              );
            }

            return null;
          })}
      </motion.div>
    );
  };

  // ===============================
  // 🧩 Quiz Section
  // ===============================
  const renderQuiz = (quizSection) => {
    const processedQuestions = quizSection.quiz.questions.map((q) => {
      if (typeof q.answer === "number") return q;
      const answerIndex = q.options.findIndex(
        (opt) => opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
      );
      return { ...q, answer: answerIndex !== -1 ? answerIndex : 0 };
    });

    return (
      <motion.div
       id="quiz-section"
        className="bg-white/80 backdrop-blur-md border border-teal-200 rounded-3xl p-8 shadow-xl mb-16"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center text-teal-800 mb-6">{quizSection.heading}</h2>

        <Quiz
          lessonId={37}
          questions={processedQuestions}
          totalQuestions={processedQuestions.length}
          onPassed={() => setQuizPassed(true)}
        />

        <div className="flex justify-center gap-6 mt-10">
          <button
            onClick={() => (window.location.href = "http://localhost:3000/lesson-viewer/36")}
            className="px-6 py-2 bg-[#E0F2F1] hover:bg-[#C8E6C9] text-[#004D40] font-semibold rounded-full shadow-sm transition"
          >
            ⬅️ Previous Lesson
          </button>

          <button
            onClick={() =>
              quizPassed ? (window.location.href = "http://localhost:3000/lesson-viewer/38") : null
            }
            disabled={!quizPassed}
            className={`px-6 py-2 rounded-full font-semibold shadow-md transition ${
              quizPassed
                ? "bg-gradient-to-r from-teal-600 to-amber-500 text-white hover:opacity-90"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next Lesson ➡️
          </button>
        </div>

        <p className="text-center mt-4 text-sm text-gray-500 italic">
          {quizPassed
            ? "🎉 You passed! The next lesson is now unlocked."
            : "Finish and pass the quiz to unlock the next lesson."}
        </p>
      </motion.div>
    );
  };

  // ===============================
  // 🏁 Final Render
  // ===============================
   return (
   <div className="relative min-h-screen bg-gradient-to-br from-[#FFFDE7] via-[#FFF9C4] to-[#FFF59D] py-16 px-5 md:px-16 overflow-x-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.4)_0%,transparent_60%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.3)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* 🔙 Back Button */}
        <div className="flex justify-start mb-8">
          <button
            onClick={() => (window.location.href = "http://localhost:3000/lessons")}
            className="bg-[#064F54] text-white px-6 py-2 rounded-full font-semibold shadow-md hover:bg-[#046A70] transition"
          >
            ⬅️ Back to Lessons
          </button>
        </div>

        {/* 📑 Table of Contents */}
        <div className="bg-white/80 border border-amber-200 rounded-3xl shadow-md p-6 mb-10">
          <h2 className="text-2xl font-bold text-[#064F54] mb-4 text-center">
            📑 Lesson Sections
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {lesson.sections.map((sec, i) => (
            <button
  key={i}
  onClick={() => scrollToSection(sectionIds[i])}
  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-[#5D4037] font-medium rounded-full shadow-sm transition"
>
  {sec.title || sec.heading || (sec.quiz ? "Quiz" : `Section ${i + 1}`)}
</button>

            ))}
          </div>
        </div>

        {/* 🏷️ Lesson Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-teal-900 drop-shadow-lg mb-10">
          {lesson.title}
        </h1>
        <p className="text-lg text-center text-gray-700 mb-14 leading-relaxed max-w-3xl mx-auto">
          {lesson.description}
        </p>

        {lesson.sections.map((sec, i) =>
          sec.quiz ? renderQuiz(sec) : renderContent(sec, i)
        )}
      </div>
    </div>
  );
}