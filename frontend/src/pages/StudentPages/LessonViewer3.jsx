import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

import InlineQuiz from "../../components/StudentComponents/InlineQuiz";
import AIAltGenerator from "../../components/StudentComponents/AIAltGenerator";
import AICodeGenerator from "../../components/StudentComponents/AICodeGenerator";
import InteractiveLinkStyler from "../../components/StudentComponents/InteractiveLinkStyler";
import InteractiveImageResizer from "../../components/StudentComponents/InteractiveImageResizer";

// 🔸 دائرة التقدم
function CircularProgress({ value = 0, size = 120, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F7EAA3"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E6B800"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-[#064F54]">
          {Math.round(value)}%
        </span>
      </div>
    </div>
  );
}

export default function LessonViewer3() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
   const [userCode, setUserCode] = useState(`
<!DOCTYPE html>
<html>
  <head>
    <title>My Favorite Websites and Photos</title>
  </head>
  <body>
    <h1>My Favorite Websites and Photos</h1>
    <!-- Add your links and images here -->
  </body>
</html>
`);

  const navigate = useNavigate();

  // 🟡 تحميل بيانات الدرس الثالث
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/lessons/content/3", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data);
      } catch (err) {
        console.error("❌ Error loading lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  const totalQuestions = 4; // ✅ فقط 4 أسئلة في هذا الدرس
  const totalPoints = 100; // نفترض كل سؤال 25 نقطة
  const progressPct = useMemo(
    () => Math.min(100, (answeredCount / totalQuestions) * 100),
    [answeredCount, totalQuestions]
  );

  // ✅ عند الإجابة الصحيحة → تحديث قاعدة البيانات + فتح الدرس الرابع
  const handleCorrect = async (points) => {
    const newScore = score + points;
    const newAnswered = answeredCount + 1;
    setScore(newScore);
    setAnsweredCount(newAnswered);

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const lessonId = 3;

    // ✅ عند إنهاء جميع الأسئلة (4)
   if (newAnswered >= totalQuestions) {
  const quizScore = 100; // ✅ لأن المستخدم جاوب على كل 4 أسئلة
  const passed = true;

  try {
    // 🟢 إرسال البيانات إلى السيرفر لتحديث قاعدة البيانات وفتح الدرس التالي
    await axios.post(
      "http://localhost:5000/api/lessons/complete",
      {
        userId: Number(userId),
        lessonId: Number(lessonId),
        quiz_score: quizScore, // ✅ دايمًا 100 لما يخلص الكويز كله
        quiz_passed: passed ? 1 : 0,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Lesson 3 progress saved to DB and next lesson unlocked automatically");

    setQuizCompleted(true);
  } catch (err) {
    console.error("❌ Error updating lesson 3 progress:", err);
  }
}

  };

  if (loading)
    return <p className="p-10 text-center text-gray-600">Loading lesson...</p>;
  if (!lesson)
    return <p className="p-10 text-center text-red-500">Lesson not found</p>;


  const sections = lesson.content?.sections || [];
  return (
  <div className="min-h-screen bg-gradient-to-br from-[#FFFCF2] via-[#FFF7D6] to-[#FFF1B8] font-sans flex">
    {/* 🔹 الشريط الجانبي لتتبع التقدم */}
    <aside className="hidden lg:block w-64 bg-gradient-to-b from-[#FFFDF2] to-[#FFF9E6] border-r border-yellow-200 shadow-md rounded-r-2xl p-6 sticky top-0 h-screen overflow-y-auto">
      <h2 className="text-lg font-extrabold text-[#064F54] mb-6 flex items-center gap-2 border-b border-yellow-200 pb-2">
        📘 Lesson Progress
      </h2>

      <ul className="space-y-3">
       {lesson.content?.sections?.map((sec, i) => (
  <li
    key={i}
    onClick={() => {
      const el = document.getElementById(`section-${i}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }}
    className={`flex items-center gap-2 text-[15px] cursor-pointer transition-all duration-300 ${
      i < answeredCount
        ? "text-[#256D1B] font-semibold"
        : "text-gray-600 hover:text-[#967a0e]"
    }`}
  >
    <span
      className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
        i < answeredCount
          ? "bg-[#F4C430] border-[#F4C430] shadow-sm"
          : "bg-gray-100 border-gray-300"
      }`}
    ></span>
    <span className="truncate">{sec.heading || `Section ${i + 1}`}</span>
  </li>
))}

      </ul>
    </aside>

    {/* 🔸 المحتوى الرئيسي للدرس */}
    <div className="flex-1 flex flex-col">
      {/* رأس الصفحة */}
      <div className="sticky top-0 z-30 bg-[#FFF8D9]/80 backdrop-blur-md border-b border-[#F1E8B1]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-[#064F54] font-semibold">
            <span className="text-amber-700">{lesson.title}</span>
          </h1>
          <div className="flex items-center gap-3">
            <CircularProgress value={progressPct} />
            <div className="text-gray-700 text-sm font-semibold">
              🌟 {answeredCount}/{totalQuestions}
            </div>
          </div>
        </div>
      </div>

      {/* محتوى الدرس */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* نظرة عامة */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-white/90 border border-[#F1E8B1] shadow-[0_8px_30px_rgba(230,184,0,0.12)] p-8 mb-8"
        >
          <h2 className="text-4xl font-extrabold text-[#064F54] mb-3">
            Lesson Overview
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {lesson.description}
          </p>
          <div className="mt-4 w-full h-3 bg-amber-100 rounded-full shadow-inner">
            <div
              className="h-3 bg-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </motion.div>

        {/* الأقسام */}
        <div className="space-y-8">
          {lesson.content?.sections?.map((sec, i) => (
            
            <motion.section
              key={sec.id}
               id={`section-${i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="bg-white/90 border border-[#F1E8B1] rounded-3xl p-8 shadow-md hover:shadow-lg transition"
            >
              <h2 className="text-2xl font-bold text-[#064F54] mb-4 flex items-center gap-2">
                <span className="text-amber-600 text-3xl">▸</span>
                {sec.heading}
              </h2>

              {(() => {
  switch (sec.heading) {
    case "Creating Links with <a> Tag":
      return (
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <p className="text-gray-700 leading-relaxed mb-4">
            The <code className="bg-gray-100 px-1 rounded">&lt;a&gt;</code> tag defines a hyperlink used to link one page to another.
          </p>
          <h4 className="font-semibold text-[#967a0e] mt-4 mb-2">Basic Syntax:</h4>
          <pre className="bg-white border border-amber-200 text-red-500 rounded-xl p-4 overflow-x-auto text-sm">
            <code>{`<a href='https://www.example.com'>Visit Example</a>`}</code>
          </pre>
          <h4 className="font-semibold text-[#967a0e] mt-5 mb-2">Target Attribute:</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-white border border-amber-200 rounded-xl p-3 shadow-sm">
              <p className="font-mono text-[#064F54] text-sm mb-1">_self</p>
              <p className="text-gray-600 text-sm">Opens the link in the <b>same tab</b>.</p>
            </div>
            <div className="flex-1 bg-white border border-amber-200 rounded-xl p-3 shadow-sm">
              <p className="font-mono text-[#064F54] text-sm mb-1">_blank</p>
              <p className="text-gray-600 text-sm">Opens the link in a <b>new tab</b>.</p>
            </div>
          </div>
          <h4 className="font-semibold text-[#967a0e] mt-5 mb-2">Example:</h4>
          <pre className="bg-white border border-amber-200 text-red-500 rounded-xl p-4 overflow-x-auto text-sm mb-4">
            <code>{`<a href='https://www.wikipedia.org' target='_blank'>Open Wikipedia</a>`}</code>
          </pre>
          <div className="p-3 bg-white border border-amber-200 rounded-xl text-center">
            <a href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer" className="text-amber-700 font-semibold hover:underline hover:text-[#064F54] transition">
              🔗 Try it: Open Wikipedia
            </a>
          </div>
        </div>
      );

    case "Absolute vs Relative Paths":
      return (
        <div className="bg-gradient-to-br from-[#FFFBEA] via-[#FFF9D9] to-[#FFF6C7] border border-amber-200 rounded-3xl p-7 shadow-md hover:shadow-lg transition mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
              <h4 className="font-bold text-[#064F54] mb-2 flex items-center gap-2">🌍 <span>Absolute Path</span></h4>
              <p className="text-gray-700 mb-3">Points to the <b>full web address</b> of a file.</p>
              <pre className="bg-[#FFFDF5] text-[#1F2937] border border-amber-100 rounded-xl p-3 text-sm font-mono shadow-inner overflow-x-auto">
                {`<img src="https://example.com/images/pic.png" alt="Example Image">`}
              </pre>
              <p className="text-gray-600 text-sm mt-3 italic">✅ Used for files hosted on external websites.</p>
            </div>

            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition transform hover:-translate-y-1">
              <h4 className="font-bold text-[#064F54] mb-2 flex items-center gap-2">📁 <span>Relative Path</span></h4>
              <p className="text-gray-700 mb-3">Points to a <b>file inside your project folder</b>.</p>
              <pre className="bg-[#FFFDF5] text-[#1F2937] border border-amber-100 rounded-xl p-3 text-sm font-mono shadow-inner overflow-x-auto">
                {`<img src="images/pic.png" alt="Local Project Image">`}
              </pre>
              <p className="text-gray-600 text-sm mt-3 italic">⚡ Used for local files stored within your project.</p>
            </div>
          </div>
        </div>
      );
       case "Making Images Clickable":
        return ( <div className="bg-gradient-to-br from-[#FFFBEA] via-[#FFF9D9] to-[#FFF6C7] border border-amber-200 rounded-3xl p-7 shadow-md hover:shadow-lg transition">


    {/* 🔸 النص التوضيحي من JSON */}
    <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
      {sec.content}
    </p>

    {/* 🧩 الكود */}
    <h4 className="font-semibold text-[#967a0e] mb-2">HTML Example:</h4>
    <pre className="bg-[#FFFDF5] text-[#1F2937] border border-amber-100 rounded-xl p-4 text-sm font-mono shadow-inner overflow-x-auto mb-4">
{`<a href="https://www.google.com" target="_blank">
  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" 
       alt="Google Logo" 
       width="120">
</a>`}
    </pre>

    {/* 🧠 المعاينة المباشرة */}
    <div className="flex flex-col items-center justify-center bg-white border border-amber-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <p className="text-[#064F54] font-semibold mb-3">
        Live Preview:
      </p>
      <a
        href="https://www.google.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:scale-105 transition-transform duration-300"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
          alt="Google Logo"
          width="140"
          className="rounded-md"
        />
      </a>
      <p className="text-gray-500 text-sm mt-3">
        Click the image to open Google in a new tab.
      </p>
    </div>
  </div>);
      case "Best Practices for Links and Images":
      return (
        <div className="bg-gradient-to-br from-[#FFFDF2] via-[#FFF9E6] to-[#FFF4C4] border border-amber-200 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
         

          {/* 🟢 نستخدم العناصر من ملف JSON */}
          <ul className="space-y-4">
            {sec.items?.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-[#E6B800] text-xl mt-1">
                  {["✅", "📝", "🔗", "⚡", "📁"][index] || "✨"}
                </span>
                <p className="text-gray-700 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 bg-white border border-amber-200 rounded-2xl p-4 text-center text-gray-600 italic shadow-inner">
            🌟 Follow these tips to make your links and images more effective!
          </div>
        </div>
      );
    case "Mini Project: Favorite Websites Gallery":

  return (
    <div className="bg-gradient-to-br from-[#FFFDF2] via-[#FFF9E6] to-[#FFF4C4] border border-amber-200 rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300">
      <h3 className="text-2xl font-extrabold text-[#064F54] mb-4 flex items-center gap-2">
        🧩 Mini Project: Favorite Websites Gallery
      </h3>

      {/* 📝 التعليمات */}
      <div className="bg-white border border-amber-200 rounded-2xl p-6 mb-6 shadow-inner">
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {sec.task}
        </p>
      </div>

      {/* 💻 محرر الكود */}
      <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-md">
        <h4 className="text-[#064F54] font-bold mb-3">💻 Try it Yourself:</h4>
        <p className="text-gray-700 mb-4">
          Write your HTML code below and see it live instantly 👇
        </p>

        {/* محرر الكود */}
        <textarea
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          className="w-full h-64 border border-amber-200 rounded-xl p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition"
        />

        {/* المعاينة الحية */}
        <div className="mt-6">
          <h5 className="text-[#064F54] font-semibold mb-2 flex items-center gap-2">
            🌐 Live Preview
          </h5>
          <iframe
            srcDoc={userCode}
            title="HTML Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-80 border rounded-xl shadow-inner bg-white"
          ></iframe>
        </div>
      </div>

      {/* ✨ تلميح بسيط */}
      <p className="mt-6 text-sm text-gray-600 italic text-center">
        💡 Tip: You can experiment freely — your code updates automatically in the preview above!
      </p>
    </div>
  );




    default:
      return (
        <p className="text-gray-800 bg-yellow-50 rounded-2xl p-5 border border-amber-100 whitespace-pre-wrap leading-relaxed">
          {sec.content}
        </p>
      );
  }
})()}


             {sec.items && sec.heading !== "Best Practices for Links and Images" && (
  <ul className="list-disc pl-6 mt-4 space-y-1 text-gray-800">
    {sec.items.map((item, j) => (
      <li key={j}>{item}</li>
    ))}
  </ul>
)}


              {sec.quiz && (
                <div className="mt-6">
                  <InlineQuiz
                    data={sec.quiz}
                    onCorrect={(points) => handleCorrect(points)}
                  />
                </div>
              )}

              {sec.interactive?.type === "style-link" && (
                <div className="mt-6">
                  <InteractiveLinkStyler />
                </div>
              )}
              
              {sec.interactive?.type === "resize-image" && (
                <div className="mt-6">
                  <InteractiveImageResizer />
                </div>
              )}
              {sec.aiFeature === "alt-generator-inline" && (
                <div className="mt-6">
                  <AIAltGenerator endpoint="http://localhost:5000/api/ai-local/smart-image" />
                </div>
              )}

             {sec.aiFeature === "html-code-generator-inline" && (
  <div className="mt-8 bg-gradient-to-br from-[#FFFBEA] via-[#FFF8D6] to-[#FFF6C7] border border-amber-200 rounded-3xl p-7 shadow-md hover:shadow-lg transition">
    
    <p className="text-gray-700 leading-relaxed mb-5 whitespace-pre-wrap">
      {sec.task}
    </p>

    {/* مكون الذكاء الصناعي */}
    <AICodeGenerator endpoint="http://localhost:5000/api/ai-local/html-generator" />

    <p className="mt-6 text-sm text-gray-600 italic text-center">
      💡 Tip: You can upload an image or just paste a link — the AI will build the proper HTML tag for you!
    </p>
  </div>
)}


            </motion.section>
          ))}
        </div>

        {/* أزرار التنقل */}
        <div className="flex justify-between mt-12">
          <button
            onClick={() => navigate("/lessons")}
            className="px-6 py-3 rounded-xl bg-amber-100 border border-amber-300 hover:bg-amber-200 transition font-semibold text-[#064F54]"
          >
            ⬅ Back
          </button>

          <button
            disabled={!quizCompleted}
            onClick={() => navigate("/lesson-viewer/4")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              quizCompleted
                ? "bg-[#F4C430] hover:brightness-95 text-[#064F54]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next ➡
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
