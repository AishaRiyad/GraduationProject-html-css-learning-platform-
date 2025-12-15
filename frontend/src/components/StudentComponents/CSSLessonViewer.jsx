// File: src/components/CSSLessonViewer.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

const API = "http://localhost:5000";

export default function CSSLessonViewer({ lessonId, onNext, onPrev, hasNext, hasPrev }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/css-lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data);
      } catch (err) {
        console.error("❌ Error fetching CSS lesson:", err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      setLoading(true);
      fetchLesson();
    }
  }, [lessonId]);

  if (loading) return <p className="text-center mt-10">Loading lesson...</p>;
  if (!lesson) return <p className="text-center mt-10 text-gray-500">Lesson not found.</p>;

  return (
    <div className="bg-white shadow-xl rounded-2xl p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">{lesson.title}</h1>

      {lesson.sections?.map((section, idx) => (
        <div key={idx} className="mb-10">
          {/* 🔹 عنوان القسم */}
          {section.heading && (
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              {section.heading}
            </h2>
          )}

          {/* 🔹 المحتوى النصي */}
          {section.content && (
  <div
    className="text-gray-700 leading-relaxed mb-4"
    dangerouslySetInnerHTML={{ __html: section.content }}
  ></div>
)}


          {/* 🔹 عرض الصور (مثل مخطط CSS Syntax) */}
          {section.image && (
            <div className="my-5 flex justify-center">
              <img
                src={section.image}
                alt="Example"
                className="rounded-xl shadow-md w-full max-w-[600px]"
              />
            </div>
          )}

          {/* 🔹 عرض الفيديو إن وجد */}
          {section.video && (
            <div className="my-5 flex justify-center">
              <video
                controls
                className="rounded-xl shadow-md w-full max-w-[700px]"
                src={section.video}
              />
            </div>
          )}

          {/* 🔹 عرض الكود الرئيسي */}
          {section.code && (
            <div className="bg-gray-50 border rounded-xl p-5 mb-5">
              <h3 className="text-lg font-semibold text-blue-700 mb-3">💻 Code Example:</h3>
              <SyntaxHighlighter
                language={section.code.language || "html"}
                style={atomOneLight}
                customStyle={{ borderRadius: "8px", fontSize: "14px" }}
              >
                {section.code.content}
              </SyntaxHighlighter>
            </div>
          )}

          {/* 🔹 عرض كود فرعي مثل ملف CSS منفصل */}
          {section.sub_example && (
            <div className="bg-gray-50 border rounded-xl p-5 mb-5">
              <h3 className="text-lg font-semibold text-green-700 mb-3">
                📄 {section.sub_example.heading}
              </h3>
              <SyntaxHighlighter
                language={section.sub_example.language || "css"}
                style={atomOneLight}
                customStyle={{ borderRadius: "8px", fontSize: "14px" }}
              >
                {section.sub_example.content}
              </SyntaxHighlighter>
            </div>
          )}

          {/* 🔹 عرض تجربة مباشرة (Live Result) */}
          {/* 🔹 عرض تجربة مباشرة (HTML + CSS + النتيجة) */}
{/* 🔹 عرض تجربة تفاعلية (HTML + CSS + النتيجة الديناميكية) */}
{section.type === "code-demo" && (
  <div className="bg-gray-50 border rounded-xl p-6 mt-5">
    <h3 className="text-lg font-bold mb-4 text-indigo-700">🎨 Example & Live Result</h3>

    {/* 🔸 HTML Code */}
    {section.html && (
      <div className="mb-5">
        <h4 className="font-semibold text-blue-700 mb-2">💻 HTML Code:</h4>
        <SyntaxHighlighter
          language="html"
          style={atomOneLight}
          customStyle={{ borderRadius: "8px", fontSize: "14px" }}
        >
          {section.html}
        </SyntaxHighlighter>
      </div>
    )}

    {/* 🔸 CSS Code */}
    {(section.css || section.cssVariants?.length > 0) && (
      <div className="mb-5">
        <h4 className="font-semibold text-green-700 mb-2">🎨 CSS Code:</h4>

        {/* 🔘 أزرار التبديل بين الأنماط */}
        {section.cssVariants?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {section.cssVariants.map((variant, i) => (
              <button
                key={i}
                onClick={() => {
                  const frame = document.getElementById(`demo-${idx}`);
                  if (frame) {
                    frame.contentWindow.postMessage(
                      { type: "change-style", css: variant.css },
                      "*"
                    );
                  }
                  // تحديث الكود المعروض على الشاشة
                  document.getElementById(`css-code-${idx}`).innerText = variant.css;
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-semibold"
              >
                {variant.name || `Style ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* 🔹 كود CSS المعروض */}
        <pre
          id={`css-code-${idx}`}
          className="bg-white border rounded-lg p-3 text-sm overflow-x-auto"
        >
          {section.css || section.cssVariants?.[0]?.css || ""}
        </pre>
      </div>
    )}

    {/* 🔸 Live Result */}
    <h4 className="font-semibold text-indigo-700 mb-3">🧩 Live Result:</h4>
    <iframe
      id={`demo-${idx}`}
      title={`demo-${idx}`}
      sandbox="allow-scripts allow-same-origin"
      className="w-full h-[400px] border rounded-lg bg-white"
      srcDoc={`<html>
        <head>
          <style id="lesson-style">
            ${section?.css || section?.cssVariants?.[0]?.css || ""}
          </style>
          <script>
            // 🔁 استقبال التحديث من الزر
            window.addEventListener('message', (event) => {
              if (event.data.type === 'change-style') {
                const styleTag = document.getElementById('lesson-style');
                if (styleTag) styleTag.innerHTML = event.data.css;
              }
            });
          </script>
          <style>
            body { font-family: Arial; padding: 10px; }
            button { background: #4CAF50; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; margin-right: 6px; }
            button:hover { background: #45a049; }
          </style>
        </head>
        <body>
          ${section?.html || ""}
        </body>
      </html>`}
    ></iframe>
  </div>
)}



          {/* 🔹 ملاحظات إضافية */}
          {section.note && (
            <p className="mt-4 text-sm text-gray-600 italic">{section.note}</p>
          )}
        </div>
      ))}

      {/* 🔹 أزرار التنقل */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={`px-5 py-2 rounded-lg font-semibold shadow-md ${
            hasPrev
              ? "bg-gray-200 hover:bg-gray-300"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`px-5 py-2 rounded-lg font-semibold shadow-md ${
            hasNext
              ? "bg-yellow-400 hover:bg-yellow-500"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
