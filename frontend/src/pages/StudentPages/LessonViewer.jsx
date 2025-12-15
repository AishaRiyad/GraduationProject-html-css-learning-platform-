import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

import Quiz from "../../components/StudentComponents/Quiz";
//import ElementExplorer from "../components/ElementExplorer";
import ProgressBar from "../../components/StudentComponents/ProgressBar";
import TOC from "../../components/StudentComponents/TOC";
import HtmlStructureBuilder from "../../components/StudentComponents/HtmlStructureBuilder";
import LessonVideo from "../../components/StudentComponents/LessonVideo";


export default function LessonViewer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [nav, setNav] = useState({ prevId: null, nextId: null });
  const [loading, setLoading] = useState(true);
  const [canGoNext, setCanGoNext] = useState(false);
  const [code, setCode] = useState(""); // ← محرر الأكواد يبدأ فاضي
  const [activeIndex, setActiveIndex] = useState(null);
  const [quizPassedAt, setQuizPassedAt] = useState(0);





  // ⬅️ الأقسام
  const sectionsDef = useMemo(
    () => [
      { id: "section-video", label: "Video" },
      { id: "section-intro", label: "Intro" },
      { id: "section-elements", label: "Elements" },
      { id: "section-quiz", label: "Quiz" },
    ],
    []
  );

  const [activeId, setActiveId] = useState("section-video");
  const [seenSections, setSeenSections] = useState([]);

  // 🟡 تحميل بيانات الدرس
 useEffect(() => {
  const loadLesson = async () => {
    try {
      setLoading(true);
      setLesson(null);           // ✅ تصفير بيانات الدرس السابق
      setCanGoNext(false);       // ✅ تصفير إمكانية الانتقال
      setActiveIndex(null);      // ✅ إخفاء أي عناصر تايملاين مفتوحة
      setSeenSections([]);       // ✅ تصفير التقدم
      setCode("");               // ✅ إعادة تعيين الكود في الـ HTML builder

      const token = localStorage.getItem("token");

      const [cRes, nRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/lessons/content/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/lessons/nav/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (cRes.data.quizPassed) {
        setCanGoNext(true);
      }

      setLesson(cRes.data);
      
      setNav(nRes.data);
      setActiveId("section-video");
      window.scrollTo(0, 0);
    } catch (e) {
      console.error("❌ Load lesson failed:", e);
    } finally {
      setLoading(false);
    }
  };

  loadLesson();
}, [lessonId]);


  // 🧠 مراقبة التمرير لتحديث شريط التقدم
  useEffect(() => {
    if (!lesson) return;

    const handleScroll = () => {
      let currentSection = "section-video";
      const newSeen = [];

      sectionsDef.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= 100) {
            currentSection = section.id;
          }
          if (rect.top < window.innerHeight * 0.9) {
            newSeen.push(section.id);
          }
        }
      });

      setActiveId(currentSection);
      setSeenSections([...new Set(newSeen)]);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lesson, sectionsDef]);

  const progressPercent = useMemo(() => {
    const total = sectionsDef.length;
    return Math.round((seenSections.length / total) * 100);
  }, [seenSections, sectionsDef]);

  if (loading) return <p className="text-center mt-10">Loading lesson...</p>;
  if (!lesson)
    return <p className="text-center mt-10 text-red-500">Lesson not found.</p>;

  const intro = lesson.content?.intro;
  const history = lesson.content?.history || [];
  const elements = lesson.content?.elements || [];
  const playground = lesson.content?.playground;
  const quiz = lesson.content?.quiz || [];




 
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-50 to-yellow-100">
      {/* ✅ شريط التقدم الثابت بالأعلى */}
      <div className="sticky top-0 z-50 bg-yellow-50/95 backdrop-blur-md border-b border-yellow-200 shadow-md px-6 py-3">
        <ProgressBar
          percent={progressPercent}
          sections={sectionsDef}
          activeId={activeId}
        />
      </div>

      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
  onClick={() => {
    // ✅ يرجع المستخدم إلى صفحة الدروس نفسها
    navigate("/lessons", { replace: true });

    // ✅ تمرير معلومة أنه كان في مستوى محدد (اختياري إذا عندك نظام مستويات)
    localStorage.setItem("returnFromLesson", "true");
  }}
  className="px-6 py-2 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm shadow-sm transition flex items-center gap-1"
>
  ← Back
</button>

          <h1 className="text-3xl font-extrabold text-yellow-700 drop-shadow-sm">
            {lesson.title}
          </h1>
          <div className="w-24" />
        </div>

        {/* ✅ Table of Contents + Main */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <TOC sections={sectionsDef} activeId={activeId} />

          <div className="space-y-14">
         {/* 🎥 Section: Video */}
<LessonVideo />





            {/* 🌼 Section: Intro (تصميم محسّن وجذاب كما في الصورة) */}
<section id="section-intro">
  {intro && (
    <div className="bg-white shadow-lg rounded-3xl overflow-hidden ring-1 ring-yellow-100 hover:shadow-yellow-200/60 transition-all duration-500">
      <div className="flex flex-col md:flex-row">
        {/* الصورة */}
        {intro.image && (
          <div className="md:w-1/3 bg-yellow-50 flex items-center justify-center p-6">
            <img
              src={intro.image}
              alt="HTML intro"
              className="rounded-lg shadow-md max-h-56 object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* النص */}
        <div className="md:w-2/3 p-8">
          <h2 className="text-3xl font-extrabold text-yellow-700 mb-4 flex items-center gap-2">
            🌸 Introduction to HTML
          </h2>

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {intro.text}
          </p>

          {intro.bullets?.length > 0 && (
            <ul className="list-disc pl-6 text-gray-800 space-y-2">
              {intro.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}

          {/* ملاحظة داخل البطاقة */}
          <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-400 rounded-r-xl p-4 shadow-inner">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <span className="text-xl">💡</span>
              HTML isn’t a programming language — it’s a markup language that
              defines the structure of web content.
            </p>
          </div>
        </div>
      </div>
    </div>
  )}

{/* 🕓 HTML Interactive Timeline */}
{history.length > 0 && (
  <div className="mt-12 bg-gradient-to-br from-yellow-50 to-white p-8 rounded-3xl shadow-md ring-1 ring-yellow-100">
    <h3 className="text-2xl font-bold text-yellow-700 mb-8 flex items-center gap-2 justify-center">
      <span>🕓</span> Evolution of HTML
    </h3>

    {/* 🟡 الدوائر (السنوات) */}
    <div className="flex flex-wrap justify-center items-center gap-6 relative">
      {history.map((h, i) => (
        <div key={i} className="flex flex-col items-center relative">
          {/* الزر الدائري */}
          <button
            onClick={() =>
              setActiveIndex(i === activeIndex ? null : i)
            }
            className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
              i === activeIndex
                ? "bg-yellow-400 border-yellow-500 scale-125 shadow-lg"
                : "bg-gray-200 border-gray-300 hover:bg-yellow-200"
            }`}
          ></button>

          {/* السنة */}
          <p className="text-xs text-gray-600 mt-1">{h.year}</p>

          {/* الحدث */}
          {i === activeIndex && (
            <div className="absolute top-10 w-[180px] bg-yellow-50 border border-yellow-200 text-gray-800 text-sm p-3 rounded-xl shadow-md animate-fade-in text-center">
              {h.event}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

</section>


{/* 🌐 Section: Elements Builder */}
<section id="section-elements">
  <HtmlStructureBuilder onCodeUpdate={setCode} />
 
</section>


          
{/* Quiz Section */}
<section id="section-quiz">
  {quiz.length > 0 && (
    <Quiz
      lessonId={lesson.id}
      totalQuestions={quiz.length}
      questions={quiz}
      onPassed={() => {
        console.log("🔥 LessonViewer received onPassed()");
        setCanGoNext(true); // ✅ هذا يفعّل الزر فوراً
      }}
    />
  )}
</section>





            {/* Footer */}
           <div
  key={quizPassedAt} // 🧠 لما الطالب ينجح، يتغير الـ key فيعيد React رسم الـ Footer
  className="sticky bottom-0 bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 rounded-2xl p-4 ring-1 ring-yellow-100 shadow-sm transition-all duration-500"
>
              <div className="flex items-center justify-between">
                <button
                  disabled={!nav.prevId}
                  onClick={() =>
                    nav.prevId && navigate(`/lesson-viewer/${nav.prevId}`)
                  }
                  className={`px-5 py-2 rounded-full text-sm transition ${
                    nav.prevId
                      ? "bg-white hover:bg-yellow-50 border border-yellow-200 text-yellow-800"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  ← Previous
                </button>

              <div className="text-xs text-yellow-700/80 font-medium transition-all duration-500">
  {canGoNext ? (
    <span className="text-green-700 font-semibold">
      🎉 Great! You can go to the next lesson.
    </span>
  ) : (
    <span className="text-yellow-800/80">Pass the quiz to unlock Next.</span>
  )}
</div>

<button
  disabled={!canGoNext}
 onClick={() => navigate("/lesson-viewer/2")}
  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
    !canGoNext
      ? "bg-yellow-200 text-yellow-900/50 cursor-not-allowed"
      : "bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg animate-bounce"
  }`}
>
  Next →
</button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
