// File: src/pages/LessonViewer10.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Quiz from "../../components/StudentComponents/Quiz";

function ImageFrame({ src, alt = "lesson visual" }) {
  const [error, setError] = React.useState(false);

  if (error || !src) {
    return (
      <div className="aspect-video w-full grid place-items-center rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-700 text-sm">
        No image available
      </div>
    );
  }

  return (
    <figure className="group relative">
      <div className="rounded-2xl p-[2px] bg-gradient-to-br from-amber-400/60 to-yellow-500/40">
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="aspect-video w-full rounded-xl object-cover ring-1 ring-amber-200 bg-white"
        />
      </div>
      <figcaption className="mt-2 text-xs text-amber-700/80 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {alt}
      </figcaption>
    </figure>
  );
}

export default function LessonViewer10() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Journey
  const [aiMessages, setAiMessages] = useState([]);
  const [userChoice, setUserChoice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Quiz
  const [quizPassed, setQuizPassed] = useState(false);

  // UI
  const [openIdx, setOpenIdx] = useState(null);
  const [progress, setProgress] = useState(0);
  const sectionsRefs = useRef({});
// 🔹 لحفظ حالة إظهار النتيجة لكل قسم
const [showResults, setShowResults] = useState({});

// 🔹 لحفظ الـ iframe لكل قسم
const iframeRefs = useRef({});

  const API = "http://localhost:5000";

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/36`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load lesson 10", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, scrolled)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const quiz = useMemo(() => {
  if (!lesson) return [];
  const quizSection = lesson.sections.find((s) => s.quiz);
  if (quizSection?.quiz?.questions) {
    return quizSection.quiz.questions;
  }
  return Array.isArray(quizSection?.quiz) ? quizSection.quiz : [];
}, [lesson]);

// ✅ حل نهائي: حوّل answer (اللي رقم) إلى نص الخيار الصحيح
const normalizedQuiz = useMemo(() => {
  if (!quiz || quiz.length === 0) return [];

  return quiz.map((q) => {
    const options = q.options || [];
    const answerIndex =
      typeof q.answer === "number"
        ? q.answer
        : options.findIndex(
            (opt) =>
              String(opt).trim().toLowerCase() ===
              String(q.answer).trim().toLowerCase()
          );

    const correctText =
      answerIndex >= 0 && answerIndex < options.length
        ? options[answerIndex]
        : options[0];

    return {
      question: q.question,
      options,
      answer: correctText, // 👈 النص الصحيح مش الرقم
      correctAnswer: correctText,
      correct: correctText,
    };
  });
}, [quiz]);




  const handleAiJourney = async () => {
    if (!userChoice.trim()) return;
    setAiLoading(true);
    try {
      setAiMessages((prev) => [...prev, { from: "user", text: userChoice }]);
      const res = await axios.post(`${API}/api/ai-local/navbar-journey`, {
        step,
        userChoice,
      });
      const aiMsg = (res.data.message || "").trim();
      setAiMessages((prev) => [...prev, { from: "ai", text: aiMsg }]);
      setUserChoice("");
      setStep((s) => s + 1);
    } catch (err) {
      console.error("AI Journey Error:", err);
      setAiMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ AI connection error. Try again later." },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center bg-amber-50 text-amber-700">
        Loading lesson...
      </div>
    );
  if (!lesson)
    return (
      <div className="min-h-screen grid place-items-center bg-amber-50 text-red-500">
        Lesson not found
      </div>
    );

  const contentSections = lesson.sections.filter((s) => !s.quiz);
  const ids = contentSections.map((s, i) =>
    (s.title || `section-${i}`).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
  );

  const scrollTo = (id) => {
    const el = sectionsRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // 🔧 يزيل الثلاث شِرَط ``` ولغة البلوك من بداية/نهاية الكود
const sanitizeCode = (code = "") =>
  code.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");

// 🧱 HTML افتراضي للمعاينة إذا كانت اللغة CSS فقط
const defaultNavbarHtml = `
<nav>
  <ul>
    <li><a href="#home">Home</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="#services">Services</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</nav>`;

// 🧪 يبني مستند كامل للـiframe حسب اللغة
const buildPreviewDocument = ({ language, code, htmlOverride }) => {
  const cleaned = sanitizeCode(code);
  const hasFA =
    /class\s*=\s*["'][^"']*\bfa[ -]/i.test(cleaned) ||
    /class\s*=\s*["'][^"']*\bfa[ -]/i.test(htmlOverride || "");

  const FA_LINK = hasFA
    ? `<link rel="stylesheet"
         href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
         referrerpolicy="no-referrer" />`
    : "";

  // ⭐ CSS-only block → نزود HTML (إن لزم) ونحقن الـCSS
  if (language === "css") {
    const html = htmlOverride || defaultNavbarHtml;
    return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${FA_LINK}
<style>
${cleaned}
html,body{margin:0;padding:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif}
</style>
</head>
<body>
${html}
</body>
</html>`;
  }

  // ⭐ HTML block → لو كان snippet، نغلّفه ونضيف FA
  if (language === "html") {
    const needsWrapper = !/<!doctype|<html/i.test(cleaned);
    if (!needsWrapper) return cleaned; // صفحة كاملة جاهزة

    return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${FA_LINK}
<style>
html,body{margin:0;padding:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif}
</style>
</head>
<body>
${cleaned}
</body>
</html>`;
  }

  // باقي اللغات (JS… إلخ) نرجّع الكود كما هو
  return cleaned;
};

// ✅ ضعي هذا مباشرة بعد buildPreviewDocument
function renderStringWithFences(text, secTitle, keyIndex) {
  const fenceRe = /```(\w+)?\n([\s\S]*?)```/m; // language + code
  const m = text.match(fenceRe);

  if (!m) {
    return (
      <p key={`p-${keyIndex}`} className="text-[17px] text-stone-700 leading-relaxed mb-5 whitespace-pre-line">
        {text}
      </p>
    );
  }

  const lang = (m[1] || "html").toLowerCase();
  const codeRaw = m[2] || "";
  const before = text.slice(0, m.index).trim();
  const after  = text.slice(m.index + m[0].length).trim();

  return (
    <div key={`f-${keyIndex}`} className="my-6 space-y-4">
      {before && (
        <p className="text-[17px] text-stone-700 leading-relaxed whitespace-pre-line">{before}</p>
      )}

      <CodePlayground
        lang={lang}
        rawCode={sanitizeCode(codeRaw)}
        secTitle={secTitle}
        indexKey={keyIndex}
      />

      {after && (
        <p className="text-[15px] text-stone-600 whitespace-pre-line">{after}</p>
      )}
    </div>
  );
}

// ================================
// 🎛️ Reusable Code Playground
// ================================
function CodePlayground({ lang, rawCode, secTitle, indexKey, htmlOverride }) {
  const [tab, setTab] = React.useState("result"); // "code" | "result"
  const [autoRun, setAutoRun] = React.useState(true);
  const [height, setHeight] = React.useState(260);
  const [edited, setEdited] = React.useState(rawCode || "");
  const iframeRef = React.useRef(null);

  const run = React.useCallback(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
    doc.open();
    const payload = buildPreviewDocument({
      language: (lang || "html").toLowerCase(),
      code: edited,
      htmlOverride: htmlOverride || null,
    });
    doc.write(payload);
    doc.close();
  }, [edited, lang, htmlOverride]);

  // أول تحميل + أوتو رن
  React.useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-run عند الكتابة
  React.useEffect(() => {
    if (!autoRun) return;
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, [edited, autoRun, run]);

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(edited); } catch {}
  };

  return (
    <div className="rounded-2xl ring-1 ring-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 md:p-5 shadow-sm">
      {/* Tabs + Controls */}
      <div className="flex flex-wrap items-center gap-2 justify-between mb-3">
        <div className="inline-flex rounded-lg overflow-hidden ring-1 ring-amber-200">
          <button
            onClick={() => setTab("code")}
            className={`px-3 py-1.5 text-sm ${tab==="code" ? "bg-white text-stone-900" : "bg-amber-100/50 text-stone-700"} transition`}
          >
            Code
          </button>
          <button
            onClick={() => setTab("result")}
            className={`px-3 py-1.5 text-sm ${tab==="result" ? "bg-white text-stone-900" : "bg-amber-100/50 text-stone-700"} transition`}
          >
            Result
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-stone-700">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="accent-amber-500"
            />
            Auto-run
          </label>

          <button
            onClick={run}
            className="px-3 py-1.5 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition"
            title="Run (Ctrl+Enter)"
          >
            Run
          </button>

          <button
            onClick={copyCode}
            className="px-3 py-1.5 text-sm rounded-lg bg-white ring-1 ring-amber-200 hover:bg-amber-100 transition"
            title="Copy code"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Panels */}
      {tab === "code" ? (
        <textarea
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") run(); }}
          className="w-full min-h-[180px] font-mono text-sm leading-6 bg-white rounded-xl p-3 ring-1 ring-amber-200 outline-none focus:ring-amber-400"
          spellCheck={false}
        />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-stone-600">Live Preview</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-600">Height</span>
              <input
                type="range"
                min={180}
                max={480}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="accent-amber-500"
              />
            </div>
          </div>
          <div className="bg-white rounded-xl ring-1 ring-amber-300 overflow-hidden">
            <iframe
              ref={iframeRef}
              title={`preview-${secTitle}-${indexKey}`}
              className="w-full border-none"
              style={{ height }}
            />
          </div>
        </div>
      )}

      {/* Note for CSS blocks */}
      {lang?.toLowerCase() === "css" && (
        <p className="mt-3 text-xs text-amber-800/90">
          This CSS is previewed on a default navbar HTML scaffold so you can instantly see the styling.
        </p>
      )}
    </div>
  );
}

const renderBlocks = (blocks, secTitle) => {
  if (!Array.isArray(blocks)) return null;

  return blocks.map((block, i) => {
    if (!block) return null;

    // 🔹 نص عادي أو نص فيه ```code```
    if (typeof block === "string" && !block.type) {
      return renderStringWithFences(block, secTitle, i);
    }

    // 2) بطاقات (لو موجودة)
    if (block.type === "cards" && Array.isArray(block.items)) {
      return (
        <div key={i} className="grid sm:grid-cols-2 gap-5 mb-5">
          {block.items.map((item, j) => (
            <motion.div
              key={j}
              whileHover={{ scale: 1.03 }}
              className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl bg-amber-500 text-white rounded-lg px-2 py-1 font-bold">
                  {j + 1}
                </span>
                <h4 className="font-semibold text-stone-900">{item.label}</h4>
              </div>
              <p className="text-[15px] text-stone-700">{item.description}</p>
            </motion.div>
          ))}
        </div>
      );
    }

    // 3) عرض كود حي (code-demo)
    if (block.type === "code-demo") {
  const lang = (block.language || "html").toLowerCase();
  const uniqueKey = `${secTitle}-${i}`;

  return (
    <motion.div
      key={uniqueKey}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="my-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-bold text-lg text-stone-900">Example</h3>
        <span className="text-xs px-2 py-0.5 rounded bg-amber-200 text-amber-900 ring-1 ring-amber-300">
          {lang.toUpperCase()}
        </span>
      </div>

      <CodePlayground
        lang={lang}
        rawCode={sanitizeCode(block.code)}
        htmlOverride={block.html}   // إن وجد في JSON
        secTitle={secTitle}
        indexKey={uniqueKey}
      />

      {block.note && (
        <p className="text-[15px] text-stone-600 mt-3 flex items-center gap-2">
          <span className="text-amber-500 text-lg">💡</span> {block.note}
        </p>
      )}
    </motion.div>
  );
}

    return null;
  });
};
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white text-stone-800">
      {/* ⏫ Sticky progress */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-amber-100 z-[60]">
        <div
          className="h-full bg-amber-500 transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-amber-100 bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-24 w-72 h-72 rounded-full bg-amber-100 blur-3xl opacity-70" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-yellow-100 blur-3xl opacity-70" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900">
                {lesson.title}
              </h1>
              <p className="mt-3 text-lg text-stone-600 max-w-3xl">
                {lesson.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => scrollTo(ids[0])}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 font-medium transition"
                >
                  Start Lesson
                </button>
                <button
                  onClick={() => scrollTo("ai-journey")}
                  className="rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 px-5 py-2.5 font-medium border border-amber-200 transition"
                >
                  Try AI Journey
                </button>
              </div>
            </div>
            <aside className="hidden md:block w-64 shrink-0">
              <div className="rounded-2xl bg-white ring-1 ring-amber-200 p-4 sticky top-6">
                <h3 className="text-sm font-semibold text-stone-900">Contents</h3>
                <ul className="mt-3 space-y-2 text-[15px] text-stone-700">
                  {contentSections.map((s, i) => (
                    <li key={i}>
                      <button
                        onClick={() => scrollTo(ids[i])}
                        className="group w-full text-left flex items-center gap-2 hover:text-stone-900"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 group-hover:scale-110 transition" />
                        <span>{s.title}</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => scrollTo("quiz")}
                      className="group w-full text-left flex items-center gap-2 hover:text-stone-900"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 group-hover:scale-110 transition" />
                      <span>Quiz</span>
                    </button>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-14">
        <div className="space-y-8">
          {contentSections.map((sec, idx) => {
            const id = ids[idx];

            // ✅ القسم الأول (مقدمة فقط)
           // ✅ القسم الأول (مقدمة بتصميم خاص + قابل للفتح)
if (idx === 0) {
  return (
    <motion.section
      key={id}
      id={id}
      ref={(el) => (sectionsRefs.current[id] = el)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true, margin: "-80px" }}
      className="rounded-3xl ring-1 ring-amber-200 overflow-hidden bg-gradient-to-br from-amber-50 via-white to-yellow-50 shadow-sm"
    >
      {/* 🔹 Header */}
      <button
        onClick={() => setOpenIdx((v) => (v === idx ? null : idx))}
        className="w-full flex items-center justify-between px-6 py-5 transition hover:bg-amber-100/50"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl"></span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900">
            {sec.title}
          </h2>
        </div>
        <span
          className={`ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200 text-amber-700 transition-transform duration-300 ${
            openIdx === idx ? "bg-amber-100 rotate-180" : "bg-white"
          }`}
        >
          ▼
        </span>
      </button>

      {/* 🔸 Body */}
      <div
        className={`px-8 pb-8 grid ${
          openIdx === idx ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        } transition-[grid-template-rows] duration-500 ease-out`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8 pt-4">
            <div className="flex-1">
              <div className="h-1 w-16 bg-amber-500 rounded-full mb-4" />
              <p className="text-lg leading-relaxed text-stone-700 whitespace-pre-line">
  {Array.isArray(sec.content)
    ? sec.content.filter((b) => typeof b === "string").join("\n\n")
    : typeof sec.content === "string"
    ? sec.content
    : ""}
</p>

            </div>

            {sec.media && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="flex-1 max-w-md"
              >
                <div className="rounded-2xl p-[2px] bg-gradient-to-br from-amber-400/50 to-yellow-400/50">
                  <img
                    src={sec.media}
                    
                    className="w-full h-auto rounded-xl object-cover ring-1 ring-amber-200 shadow-md transition-transform duration-300 hover:scale-[1.03]"
                  />
                </div>
            
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}


            // 🟡 باقي الأقسام
            return (
              <motion.section
                key={id}
                id={id}
                ref={(el) => (sectionsRefs.current[id] = el)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                viewport={{ once: true, margin: "-80px" }}
                className="bg-white rounded-2xl ring-1 ring-amber-200 p-0 overflow-hidden"
              >
                {/* Accordion header */}
                <button
                  onClick={() => setOpenIdx((v) => (v === idx ? null : idx))}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-amber-50 transition"
                >
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-stone-900">
                      {sec.title}
                    </h2>
                    <div className="mt-2 h-1 w-14 bg-amber-500 rounded-full" />
                  </div>
                  <span
                    className={`ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-200 text-amber-700 transition ${
                      openIdx === idx ? "bg-amber-100 rotate-180" : "bg-white"
                    }`}
                    aria-hidden
                  >
                    ▼
                  </span>
                </button>

                {/* Body */}
                <div
                  className={`px-6 pb-6 pt-2 grid ${
                    openIdx === idx ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  } transition-[grid-template-rows] duration-300 ease-out`}
                >
                  <div className="overflow-hidden">
                  <div className="prose prose-stone max-w-none">
  {Array.isArray(sec.content)
    ? renderBlocks(sec.content, sec.title)
    : typeof sec.content === "string"
    ? renderStringWithFences(sec.content, sec.title, "single")
    : null}
</div>



                   

                    {sec.media && (
                      <img
                        src={sec.media}
                        alt="lesson visual"
                        className="rounded-xl mt-5 ring-1 ring-amber-200"
                      />
                    )}
                    {/* 🔙 Back Button */}
<button
  onClick={() => (window.location.href = "http://localhost:3000/lessons")}
  className="absolute top-20 right-8 flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-amber-100 text-amber-700 font-semibold rounded-full shadow-md border border-amber-200 backdrop-blur-sm transition-all duration-300 z-50"
>
  ⬅️ Back to Lessons
</button>


                    {/* AI Journey داخل القسم المناسب */}
                    {sec.title.includes("AI") && (
                      <div
                        id="ai-journey"
                        ref={(el) => (sectionsRefs.current["ai-journey"] = el)}
                        className="mt-6 border-t border-amber-200 pt-6"
                      >
                        <h3 className="text-base md:text-lg font-semibold text-stone-900 mb-3">
                          Interactive Navbar Journey
                        </h3>

                        <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-4 mb-4 max-h-64 overflow-y-auto">
                          {aiMessages.length === 0 && (
                            <p className="text-sm text-amber-800/80">
                              Start by typing your first choice (e.g., “Portfolio Website”)
                            </p>
                          )}
                          {aiMessages.map((msg, i) => (
                            <div
                              key={i}
                              className={`mb-2 max-w-[85%] rounded-lg px-3 py-2 text-[15px] leading-6 ${
                                msg.from === "ai"
                                  ? "bg-white ring-1 ring-amber-200 text-stone-800"
                                  : "bg-amber-500 text-white ml-auto"
                              }`}
                            >
                              {msg.text}
                            </div>
                          ))}
                          {aiLoading && (
                            <p className="text-sm italic text-amber-800/80">
                              AI is thinking…
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            placeholder="Type your answer…"
                            value={userChoice}
                            onChange={(e) => setUserChoice(e.target.value)}
                            className="flex-1 rounded-lg border border-amber-300 bg-white px-4 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                          <button
                            onClick={handleAiJourney}
                            disabled={aiLoading}
                            className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-2 font-medium text-white hover:bg-amber-600 transition disabled:opacity-60"
                          >
                            {aiLoading ? "Thinking…" : "Send"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            );
          })}

          {/* QUIZ */}
          
          <motion.section
            id="quiz"
            ref={(el) => (sectionsRefs.current["quiz"] = el)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl ring-1 ring-amber-200 p-6 md:p-7"
          >
            
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-stone-900">
                Navigation Bar Quiz
              </h2>
              <div className="mt-2 h-1 w-16 bg-amber-500 rounded-full" />
            </div>

  <Quiz
  lessonId={36}
  questions={quiz}
  totalQuestions={quiz.length}
  onPassed={() => setQuizPassed(true)}
/>



           {quizPassed && (
  <div className="flex justify-center gap-6 mt-10">
    <button
      onClick={() =>
        (window.location.href = "http://localhost:3000/lesson-viewer/35")
      }
      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
    >
      ⬅️ Previous Lesson
    </button>

    <button
      onClick={() =>
        (window.location.href = "http://localhost:3000/lesson-viewer/37")
      }
      className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg transition"
    >
      Next Lesson ➡️
    </button>
  </div>
)}


            <p className="mt-3 text-sm text-stone-500">
              {quizPassed
                ? "Great job! You passed the quiz and unlocked the next lesson."
                : "Complete the quiz to unlock the next lesson."}
            </p>
          </motion.section>
        </div>
      </main>
    </div>
  );
}

