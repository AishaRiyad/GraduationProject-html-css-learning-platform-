import React, { useEffect, useState } from "react";
import axios from "axios";
import Quiz from "../../components/StudentComponents/QuizLesson4.jsx";
import { useNavigate } from "react-router-dom";


export default function LessonViewer4() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiDesc, setAiDesc] = useState("");
  const [aiCode, setAiCode] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

const handleGoBack = () => {
  navigate("/lessons");
};

  const [activeSection, setActiveSection] = useState("intro-section");
  // 🧭 أقسام الصفحة للفهرس الجانبي
const tocItems = [
  { id: "intro-section", label: "Introduction" },
  { id: "build-section", label: "Build Table" },
  { id: "gallery-section", label: "Attributes & Examples" },
  { id: "ai-section", label: "AI Table Generator" },
  { id: "quiz-section", label: "Quick Quiz" },
];
useEffect(() => {
  const handleScroll = () => {
    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveSection(item.id);
        }
      }
    });
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  // 🧭 Load Lesson Data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/lessons/content/4", {
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

  // 🟡 Handle Loading States
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading lesson...
      </div>
    );

  if (!lesson || !lesson.content)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        Lesson not found.
      </div>
    );

  // ✅ تأكيد وجود الأقسام قبل الاستخدام
  const sections = lesson.content?.sections || [];
  const assets = lesson.content?.assets || {};
  const gallery = sections?.[2] || {};
  const intro = sections?.[0];
  const build = sections?.[1];
  const aiGen = sections?.[3];
  const quiz = lesson.content?.quiz;



  // 🗺️ خريطة الصور (بعد ما نتأكد من وجودها)
  const imageMap = {};
  assets?.images?.forEach((img) => {
    imageMap[img.id] = img.filename;
  });

  // 🧩 إدراج أجزاء الجدول
  function insertSnippet(prev = "", snippet = "") {
    let code = prev || "";
    if (/<table[^>]*>\s*<\/table>/i.test(code)) {
      return code.replace(/<table[^>]*>\s*<\/table>/i, `<table>\n${snippet}\n</table>`);
    }
    if (/<\/table>/i.test(code) && !/<table[^>]*>\s*<\/table>/i.test(code)) {
      return code.replace(/<\/table>/i, `${snippet}\n</table>`);
    }
    const isTableTag = /<\s*table[\s>]/i.test(snippet);
    if (!isTableTag) {
      return `<table>\n${snippet}\n</table>`;
    }
    return (code ? code + "\n" : "") + snippet;
  }

  // 🤖 AI Table Generator
  const handleGenerateTable = async () => {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai-local/table-generator", {
        description: aiDesc,
      });
      setAiCode(res.data.code || "");
      setEditorCode(res.data.code || "");
    } catch (err) {
      console.error("AI table generation error:", err);
      alert("Failed to generate table.");
    }
    setAiLoading(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF5] to-[#FFF6D3] text-gray-800 px-6 py-10 md:px-16">
      {/* 🔹 Title */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[#064F54] mb-2 drop-shadow-sm">
          {lesson.content.title || "Lesson"}
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Master how to create and style HTML tables with ease.
        </p>
      </header>
      {/* 🔹 TOC Sidebar */}
<aside className="fixed top-20 left-5 hidden xl:block z-40">
  <div className="bg-white/80 backdrop-blur-md border border-yellow-100 rounded-2xl shadow-md w-64 p-5">
    <h3 className="text-lg font-semibold text-[#064F54] mb-3 text-center">
      📘 Table of Contents
    </h3>
    <ul className="space-y-2 text-sm text-gray-700">
      {tocItems.map((item) => (
        <li key={item.id}>
          <button
  onClick={() => {
    const el = document.getElementById(item.id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }}
  className={`w-full text-left px-3 py-2 rounded-lg transition-all font-medium ${
    activeSection === item.id
      ? "bg-[#F4C430]/20 border-l-4 border-[#F4C430] text-[#064F54]"
      : "hover:bg-[#FFF8CC]"
  }`}
>
  {item.label}
</button>

        </li>
      ))}
    </ul>
  </div>
</aside>
{/* 🔙 زر الرجوع */}
<button
  onClick={handleGoBack}
  className="fixed top-20 right-6 bg-[#064F54] text-white px-4 py-2 rounded-full shadow-md hover:bg-[#076a6f] transition-all z-50"
>
  ← Back to Lessons
</button>


      {/* 🔸 INTRO */}
      {intro && (
        <section id="intro-section" className="max-w-4xl mx-auto bg-[#ffffffaa] backdrop-blur-md rounded-2xl p-8 shadow-sm mb-10">
          <h2 className="text-2xl font-semibold text-[#064F54] mb-4">
            {intro.heading}
          </h2>
          <div
            className="leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: intro.html || "" }}
          />
        </section>
      )}

      {/* 🔸 BUILD TABLE */}
      {build && (
        <section id="build-section" className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md border border-yellow-100 p-8 mb-10">
          <h2 className="text-2xl font-semibold text-[#064F54] mb-3">
            {build.heading}
          </h2>
          <p className="text-gray-600 mb-5">{build.instructions}</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {build.cards?.map((card, idx) => (
              <button
                key={idx}
                className="bg-[#FAFAE6] border border-[#E5E5B5] rounded-xl px-4 py-3 text-left hover:shadow-md transition-all"
                onClick={() => setEditorCode((prev) => insertSnippet(prev, card.snippet))}
              >
                <p className="font-mono text-[#064F54] font-semibold">{card.label}</p>
                <p className="text-sm text-gray-600">{card.explain}</p>
              </button>
            ))}
          </div>

          <textarea
            className="border border-gray-300 w-full p-3 font-mono rounded-lg focus:ring-2 focus:ring-yellow-300"
            rows={8}
            placeholder="Start building your table..."
            value={editorCode}
            onChange={(e) => setEditorCode(e.target.value)}
          />

          <div
            className="mt-6 bg-[#FFFDF5] border border-yellow-100 rounded-xl p-5 overflow-x-auto"
            dangerouslySetInnerHTML={{
              __html: `
                <style>
                  table { border-collapse: collapse; width: 100%; margin-top: 10px; background: #fff; }
                  th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: center; }
                  th { background: #f7f2b9; color: #064F54; font-weight: bold; }
                  caption { caption-side: top; font-weight: bold; margin-bottom: 6px; color: #333; }
                  tbody tr:nth-child(odd) { background: #fafafa; }
                  tbody tr:hover { background: #f1f7ff; }
                </style>
                ${editorCode || ""}
              `,
            }}
          />
        </section>
      )}

      {/* 🔸 GALLERY */}
{gallery && (
  <section id="gallery-section" className="max-w-6xl mx-auto bg-gradient-to-br from-[#fffef7] to-[#fffbe7] rounded-3xl p-10 shadow-sm border border-yellow-100 mb-10">
    <h2 className="text-3xl font-extrabold text-[#064F54] mb-8 text-center">
      {gallery.heading}
    </h2>
    <p className="text-gray-700 text-center mb-10">{gallery.note}</p>

    {/* شبكة الخصائص */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {gallery.properties?.map((prop, idx) => (
        <button
          key={idx}
          onClick={() => setOpenIndex(idx)} // 👈 فتح خاصية وحدة فقط
          className="bg-[#fffdf3] hover:bg-[#fdf6cf] border border-yellow-200 shadow-sm hover:shadow-md rounded-xl p-5 text-left flex justify-between items-center transition-all duration-300"
        >
          <span className="text-[#064F54] font-semibold text-lg">{prop.name}</span>
          <span className="text-gray-500">▼</span>
        </button>
      ))}
    </div>

    {/* 🔹 النافذة المنبثقة */}
    {openIndex !== null && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-[90%] p-8 relative shadow-2xl border border-yellow-100 overflow-y-auto max-h-[90vh] animate-fadeIn">
          {/* زر الإغلاق */}
          <button
            onClick={() => setOpenIndex(null)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ✕
          </button>

          {/* محتوى الخاصية */}
          {(() => {
            const prop = gallery.properties[openIndex];
            const imageFile =
              imageMap[prop.imageId] ||
              (prop.imageId.startsWith("tables_") ? prop.imageId : `tables_${prop.imageId}.png`);

            return (
              <>
                <h3 className="text-2xl font-bold text-[#064F54] mb-3">
                  {prop.name}
                </h3>
                <p className="text-gray-600 mb-5 leading-relaxed">{prop.desc}</p>

                <div className="bg-[#fffde8] text-xs p-4 overflow-x-auto border border-yellow-100 rounded-lg font-mono text-gray-700 mb-6 whitespace-pre-wrap">
                  {prop.code}
                </div>

                {imageFile && (
                  <div className="flex justify-center bg-[#fffefb] p-4 rounded-xl border border-gray-100 shadow-sm">
                    <img
                      src={`${process.env.PUBLIC_URL}/images/lessons/tables/${imageFile}`}
                      alt={prop.name}
                      className="rounded-lg object-contain max-h-[420px] transition-transform duration-300 hover:scale-[1.05]"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="text-xs text-center text-gray-500 italic mt-4">
                  {prop.type?.toUpperCase()}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    )}
  </section>
)}


{/* 🔸 AI TABLE GENERATOR */}
{aiGen && (
  <section id="ai-section" className="max-w-5xl mx-auto bg-white rounded-2xl p-8 shadow-md border border-yellow-100 mb-10">
    <h2 className="text-2xl font-semibold text-[#064F54] mb-3">
      {aiGen.heading || "Generate a Styled HTML Table with AI"}
    </h2>
    <p className="text-gray-600 mb-4">
      Type your table description below, and the AI will generate an HTML + CSS table.
    </p>

    {/* إدخال الوصف */}
    <textarea
      className="border w-full p-3 rounded-md focus:ring-2 focus:ring-yellow-300"
      rows={3}
      placeholder={aiGen.ui?.placeholder || "Example: A table with 4 students and their grades."}
      value={aiDesc}
      onChange={(e) => setAiDesc(e.target.value)}
    />

    {/* زر التوليد */}
    <button
      onClick={handleGenerateTable}
      disabled={aiLoading}
      className="bg-[#F4C430] hover:brightness-95 text-[#064F54] px-6 py-2 rounded-lg mt-4 font-semibold transition disabled:opacity-70"
    >
      {aiLoading ? "Generating..." : aiGen.ui?.buttonText || "Generate Code"}
    </button>

    {/* 🔹 منطقة النتيجة (تظهر بعد الرد) */}
    <div className="mt-8">
      {aiCode ? (
        <>
          <h3 className="text-lg font-semibold text-[#064F54] mb-3">
            Generated HTML + CSS Code:
          </h3>

          <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg mb-4">
            <div className="flex justify-between items-center bg-[#2d2d2d] px-4 py-2 text-sm text-gray-300">
              <span>AI Generated Code</span>
              <button
                onClick={() => {
                  const previewFrame = document.getElementById("ai-table-preview");
                  if (previewFrame) {
                    const doc =
                      previewFrame.contentDocument || previewFrame.contentWindow.document;
                    doc.open();
                    doc.write(aiCode);
                    doc.close();
                  }
                }}
                className="bg-[#F4C430] text-[#064F54] px-3 py-1 rounded-md font-semibold hover:brightness-95 transition"
              >
                ▶ Run
              </button>
            </div>

            <textarea
              className="w-full bg-[#1e1e1e] text-[#dcdcdc] font-mono text-sm p-4 border-none focus:outline-none resize-none"
              rows={12}
              value={aiCode}
              onChange={(e) => setAiCode(e.target.value)}
            />
          </div>

          <h3 className="text-lg font-semibold text-[#064F54] mb-2">Preview:</h3>
          <div className="border border-yellow-200 bg-[#fffef5] rounded-xl p-4 overflow-x-auto">
            <iframe
              id="ai-table-preview"
              title="AI Table Preview"
              className="w-full h-[400px] rounded-lg border-none"
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500 italic mt-4">
          🧠 Enter a description and click <b>Generate Code</b> to create your table.
        </p>
      )}
    </div>
  </section>
)}


      {/* 🔸 QUIZ */}
      {quiz && (
        <section id="quiz-section"  className="max-w-3xl mx-auto bg-[#FAFAE6] rounded-2xl p-8 shadow-inner text-center">
          <h2 className="text-2xl font-semibold text-[#064F54] mb-5">{quiz.heading}</h2>
          <Quiz quizData={quiz} onPassed={() => setQuizCompleted(true)} />
          {quizCompleted && (
            <div className="mt-4 text-green-700 font-semibold text-lg">
              🎉 {quiz.onPass?.message}
            </div>
          )}
        </section>
      )}
    {/* 🔸 Navigation Buttons */}
<div className="max-w-3xl mx-auto flex justify-between mt-8">
  <button
    onClick={() => (window.location.href = "http://localhost:3000/lesson-viewer/3")}
    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg shadow-md transition"
  >
    ← Previous Lesson
  </button>

  <button
    onClick={() => quizCompleted && (window.location.href = "http://localhost:3000/lesson-viewer/5")}
    className={`font-semibold px-6 py-2 rounded-lg shadow-md transition ${
      quizCompleted
        ? "bg-[#F4C430] hover:brightness-95 text-[#064F54]"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }`}
  >
    Next Lesson →
  </button>
</div>


    </div>
  );
  
}
