import React, { useEffect, useState } from "react";
import axios from "axios";
import Quiz from "../../components/StudentComponents/Quiz";
import { useNavigate } from "react-router-dom";

export default function LessonViewer2() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiResponses, setAiResponses] = useState([]);
  const [aiVisible, setAiVisible] = useState({}); // 👈 للتحكم بعرض/إخفاء إجابات AI
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [aiThinkingIndex, setAiThinkingIndex] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false); // 👈 تتبع إنهاء الكويز

  const navigate = useNavigate();
function MiniProjectSection({ sec }) {
  const [userCode, setUserCode] = useState("");
  const [aiReview, setAiReview] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);

  const handleReview = async () => {
    if (!userCode.trim()) {
      alert("Please write some HTML code first!");
      return;
    }

    setShowCongrats(false);
    setAiReview("🤖 Thinking...");

    const question = `Review this beginner HTML code and give suggestions:\n${userCode}`;

    try {
      const res = await fetch("http://localhost:5000/api/ai-local/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setAiReview(result);
      }

      setShowCongrats(true);
    } catch (err) {
      console.error(err);
      setAiReview("⚠️ Failed to connect to AI. Please try again.");
    }
  };


  return (
    <div className="bg-[#FFFCEB] border border-gray-200 rounded-2xl p-8 shadow-inner max-w-4xl mx-auto">
      <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        ✏️ Write your HTML code below:
      </h4>

      <textarea
        className="w-full h-48 border border-gray-300 rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none mb-6 resize-none bg-gray-50"
        placeholder={`<h1>My First Web Page</h1>\n<p>Hello World!</p>\n<img src="image.jpg">\n<a href="#">Visit me</a>`}
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
      ></textarea>

      <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-100 text-gray-700 text-sm font-semibold py-2 text-center border-b border-gray-300">
          🌐 Live Preview
        </div>
        <iframe className="w-full h-64 bg-white" title="HTML Preview" srcDoc={userCode}></iframe>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-700 mb-3 text-base">
          Want feedback on your HTML page? Let the AI review it 👇
        </p>
        <button
          onClick={handleReview}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-full shadow-md transition-all duration-300"
        >
          🤖 Review with AI
        </button>

        {aiReview && (
          <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-gray-800 whitespace-pre-line text-left max-w-3xl mx-auto shadow-inner">
            {aiReview}
          </div>
        )}

        {/* ✅ التهنئة تظهر فقط بعد انتهاء المراجعة */}
        {showCongrats && (
          <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm text-center transition-all duration-500 animate-fadeIn">
            <p className="text-gray-800 text-lg font-semibold mb-2">🌟 Congratulations!</p>
            <p className="text-gray-700 text-base">
              You just built your first HTML web page — and used AI to review it!  
              Keep experimenting and adding new elements 💪
            </p>
          </div>
        )}
      </div>
    </div>
  );
}




  // 🔸 Sidebar (Ask AI)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  // 🟡 تحميل التقدم من localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem("lesson2_progress");
    if (savedProgress) {
      setCurrentSectionIndex(parseInt(savedProgress));
    }
  }, []);

  const handleStartLesson = () => {
    setCurrentSectionIndex(0);
    localStorage.setItem("lesson2_progress", "0");
  };

  // 🟢 حفظ التقدم عند كل تغيير
  useEffect(() => {
    if (currentSectionIndex >= 0) {
      localStorage.setItem("lesson2_progress", currentSectionIndex.toString());
    }
  }, [currentSectionIndex]);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/lessons/content/2", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data);
      } catch (err) {
        console.error("Error loading lesson:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, []);

  // 🔹 وظيفة الذكاء الاصطناعي حسب كل قسم
  const handleAiAskSection = async (prompt, i) => {
    if (!prompt) return;
    setAiThinkingIndex(i);
    setAiResponses((prev) => {
      const copy = [...prev];
      copy[i] = "🤖 Thinking...";
      return copy;
    });

    try {
      const res = await fetch("http://localhost:5000/api/ai-local/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setAiResponses((prev) => {
          const copy = [...prev];
          copy[i] = result;
          return copy;
        });
      }
      setAiThinkingIndex(null);
    } catch (err) {
      console.error(err);
      setAiResponses((prev) => {
        const copy = [...prev];
        copy[i] = "⚠️ Failed to connect to AI.";
        return copy;
      });
      setAiThinkingIndex(null);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading lesson...</p>;
  if (!lesson) return <p className="text-center text-red-500 mt-10">Lesson not found.</p>;

  return (
    
    <div className="bg-[#FFFCEB] min-h-screen relative overflow-hidden">
      {/* 🔙 زر العودة إلى صفحة الدروس */}
<button
  onClick={() => navigate("/lessons")}
  className="absolute top-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-5 py-2 rounded-full shadow-md flex items-center gap-2 transition-all duration-300 z-50"
>
  ← Back
</button>

     {/* 🌟 شريط التقدّم الجانبي المحسّن */}
<div className="fixed left-6 top-28 flex flex-col items-start bg-white/70 backdrop-blur-md border border-yellow-200 rounded-2xl shadow-lg px-4 py-5 w-52 max-h-[80vh] overflow-y-auto z-40">
  <h3 className="text-orange-600 font-bold text-lg mb-4 text-center w-full">
    Lesson Progress
  </h3>

  <div className="flex flex-col space-y-4 w-full">
    {lesson.content?.sections.slice(1, -1).map((sec, i) => {
      const isActive = i === currentSectionIndex;
      const isCompleted = i < currentSectionIndex;
      return (
        <button
          key={i}
          onClick={() => {
            setCurrentSectionIndex(i);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex items-center gap-3 w-full text-left transition-all duration-300 rounded-lg px-3 py-2 hover:bg-yellow-50 ${
            isActive
              ? "bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 font-semibold"
              : isCompleted
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          {/* الدائرة الصغيرة */}
          <div
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              isActive
                ? "bg-yellow-400 border-yellow-500"
                : isCompleted
                ? "bg-green-400 border-green-500"
                : "border-gray-300"
            }`}
          ></div>

          {/* اسم القسم */}
          <span className="text-sm font-medium leading-tight truncate">
            {sec.heading}
          </span>
        </button>
      );
    })}
  </div>

  {/* ✅ نسبة التقدّم أسفل الشريط */}
  <div className="mt-5 w-full text-center border-t border-yellow-200 pt-3">
    <p className="text-sm text-gray-600 font-medium">
      Progress:{" "}
      <span className="text-orange-600 font-bold">
        {Math.round(
          ((currentSectionIndex + 1) /
            lesson.content.sections.slice(1, -1).length) *
            100
        )}
        %
      </span>
    </p>
  </div>
</div>


      <div className="max-w-5xl mx-auto py-10 px-5 space-y-12">
        {/* 🔶 مقدمة الدرس */}
        <section className="relative bg-gradient-to-r from-[#FFF9E6] to-[#FFFCEB] rounded-3xl shadow-xl p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200 opacity-30 rounded-full blur-3xl translate-x-16 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-200 opacity-30 rounded-full blur-3xl -translate-x-12 translate-y-12"></div>

          <div className="md:w-1/2 relative z-10 text-center md:text-left space-y-6">
            <h1 className="text-5xl font-extrabold text-orange-600 leading-tight drop-shadow-sm">
              {lesson.title}
            </h1>
            <p className="text-gray-700 text-lg leading-relaxed">
              {lesson.content?.sections[0]?.text}
            </p>
            <button
              onClick={handleStartLesson}
              className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-7 py-3 rounded-full shadow-lg transition-all duration-300"
            >
              Start Lesson
            </button>
          </div>

          <div className="md:w-1/2 flex justify-center relative z-10 mt-10 md:mt-0">
            <img
              src="/images/html_intro_illustration.png"
              alt="HTML Intro Illustration"
              className="max-h-80 w-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </section>

        {/* 🔹 عرض الأقسام */}
        {lesson.content?.sections?.slice(1, -1).map((sec, i) => {
            if (i !== currentSectionIndex) return null;

          return (
            <section
              key={sec.id || i}
              className="bg-[#FFFCEB] p-8 rounded-3xl shadow-lg mb-8 border border-yellow-100 transition-all duration-300 hover:shadow-xl"
            >
              {/* 🔹 عرض باقي محتوى الدرس حسب نوع القسم */}
           {(sec.id === "tag-intro" || sec.heading === "What Are HTML Tags?") && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    {/* العنوان */}
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-6 flex items-center justify-center gap-2">
      🏷️ {sec.heading}
    </h3>

    {/* الوصف */}
    <div className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      {sec.text}
    </div>

    {/* مثال المقارنة + النتيجة معًا */}
    <div className="bg-[#FFFCEB] border border-gray-200 rounded-2xl p-10 shadow-inner text-center max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
        {/* بدون وسم */}
        <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-5 hover:shadow-md transition-all duration-300">
          <h4 className="text-red-600 font-semibold mb-2">Without Tag</h4>
          <p className="font-mono text-base text-gray-800">Hello World!</p>
          <p className="text-sm text-gray-500 italic mt-2">Plain text without structure</p>
        </div>

        {/* السهم */}
        <div className="text-yellow-500 text-3xl font-bold">→</div>

        {/* مع وسم */}
        <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-5 hover:shadow-md transition-all duration-300">
          <h4 className="text-green-700 font-semibold mb-2">With &lt;p&gt; Tag</h4>
          <p className="font-mono text-base text-green-800">&lt;p&gt;Hello World!&lt;/p&gt;</p>
          <p className="text-sm text-green-600 italic mt-2">
            The text becomes a paragraph element
          </p>
        </div>
      </div>

      {/* النتيجة */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center shadow-sm max-w-md mx-auto">
        <p className="text-gray-800 text-lg font-semibold mb-1">Rendered Output:</p>
        <p className="text-2xl text-green-700 font-bold">Hello World!</p>
      </div>
    </div>
  </div>
)}



{sec.id === "tag-structure" && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    {/* العنوان */}
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-6 flex items-center justify-center gap-2">
      🧩 {sec.heading}
    </h3>

    {/* الوصف */}
    <div className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      {sec.text}
    </div>

    {/* المقارنة */}
    <div className="bg-[#FFFCEB]  border border-gray-200 rounded-2xl p-8 shadow-inner text-center max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        {/* بدون وسم */}
        <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-5 hover:shadow-md transition-all duration-300">
          <h4 className="text-red-600 font-semibold mb-2">Without Tag</h4>
          <p className="font-mono text-base text-gray-800">This is a paragraph</p>
          <p className="text-sm text-gray-500 italic mt-2">Just plain text, no formatting.</p>
        </div>

        {/* السهم */}
        <div className="text-yellow-500 text-3xl font-bold">→</div>

        {/* مع وسم */}
        <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-5 hover:shadow-md transition-all duration-300">
          <h4 className="text-green-700 font-semibold mb-2">With &lt;p&gt; Tag</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-3 font-mono text-sm mb-2">
            <code>{sec.example}</code>
          </div>
          <p className="text-gray-700">
            <b>Rendered Output:</b>{" "}
            <span className="text-gray-800">This is a paragraph</span>
          </p>
        </div>
      </div>

      {/* الشرح البصري التفصيلي */}
      <div className="mt-8 text-center">
        <p className="text-gray-700 text-lg mb-4 font-medium">
          A basic HTML tag includes <b>three main parts:</b>
        </p>

        {/* التوضيح مع الأسهم والعناوين */}
        <div className="flex flex-col items-center justify-center gap-4">
          {/* التوضيحات */}
          <div className="flex justify-center gap-16 text-sm text-gray-600 font-medium">
            <span>🟢 Opening Tag</span>
            <span>🟡 Content</span>
            <span>🔴 Closing Tag</span>
          </div>

          {/* المثال */}
          <div className="inline-flex flex-wrap justify-center items-center gap-2 font-mono text-base">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg border border-green-200">
              &lt;p&gt;
            </span>
            <span className="bg-yellow-50 text-gray-800 px-3 py-1 rounded-lg border border-yellow-200">
              This is a paragraph
            </span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg border border-red-200">
              &lt;/p&gt;
            </span>
          </div>

        
        </div>
      </div>
    </div>
  </div>
)}



              {sec.id === "empty-tags" && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    {/* العنوان */}
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-6 flex items-center justify-center gap-2">
      🪄 {sec.heading}
    </h3>

    {/* الوصف */}
    <div className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      {sec.text}
    </div>

    {/* المحتوى */}
    <div className="bg-[#FFFCEB]  border border-gray-200 rounded-2xl p-8 shadow-inner text-center max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        {/* مثال بدون أي محتوى داخلي */}
        <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
          <h4 className="text-blue-700 font-semibold mb-3">Self-Closing Tags Example</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-3 font-mono text-sm mb-3">
            <code>{sec.example}</code>
          </div>
          <p className="text-sm text-gray-600 italic">
            These tags don’t have inner content — they close themselves.
          </p>
        </div>

        {/* السهم */}
        <div className="text-yellow-500 text-3xl font-bold">→</div>

        {/* المعاينة */}
        <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
          <h4 className="text-green-700 font-semibold mb-3">Rendered Preview</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="mb-2">
              <b>&lt;img&gt;</b> → displays an image (if available)
            </p>
            <hr className="my-3 border-gray-300" />
            <p>
              <b>&lt;br&gt;</b> → adds a line break
            </p>
            <br />
            <p>
              <b>&lt;hr&gt;</b> → adds a horizontal line
            </p>
          </div>
        </div>
      </div>

      {/* الشرح البصري للأوسمة الفارغة */}
      <div className="mt-8 text-center">
        <p className="text-gray-700 text-lg mb-4 font-medium">
          These are called <b>empty tags</b> because they contain no content — the tag itself does all the work!
        </p>

        <div className="flex flex-wrap justify-center gap-4 font-mono text-base">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
            &lt;img /&gt;
          </span>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg border border-green-200">
            &lt;br /&gt;
          </span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg border border-yellow-200">
            &lt;hr /&gt;
          </span>
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg border border-pink-200">
            &lt;input /&gt;
          </span>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg border border-purple-200">
            &lt;meta /&gt;
          </span>
        </div>
      </div>
    </div>
  </div>
)}

{sec.id === "nested-tags" && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    {/* العنوان */}
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-6 flex items-center justify-center gap-2">
      🧱 {sec.heading}
    </h3>

    {/* الوصف */}
    <div className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      {sec.text}
    </div>

    {/* المقارنة */}
    <div className="bg-[#FFFCEB] border border-gray-200 rounded-2xl p-8 shadow-inner text-center max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        {/* بدون تداخل */}
        <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
          <h4 className="text-red-600 font-semibold mb-3">Without Nesting</h4>
          <p className="font-mono text-base text-gray-800">This is bold text.</p>
          <p className="text-sm text-gray-600 italic mt-2">No tag applied — plain text only.</p>
        </div>

        {/* السهم */}
        <div className="text-yellow-500 text-3xl font-bold">→</div>

        {/* مع تداخل */}
        <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
          <h4 className="text-green-700 font-semibold mb-3">With Nested Tag</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-3 font-mono text-sm mb-3">
            <code>{sec.example}</code>
          </div>
          <p className="text-gray-700">
            <b>Rendered Output:</b>{" "}
            <span className="text-gray-800">
              This is <b>bold</b> text.
            </span>
          </p>
        </div>
      </div>

      {/* الشرح البصري للتداخل */}
      <div className="mt-8 text-center">
        <p className="text-gray-700 text-lg mb-4 font-medium">
          Think of nested tags like <b>boxes inside boxes</b> 🧩
        </p>

        <div className="flex flex-col items-center justify-center gap-4">
          {/* التوضيحات */}
          <div className="flex justify-center gap-16 text-sm text-gray-600 font-medium">
            <span>🟢 Outer Tag</span>
            <span>🟡 Inner Tag</span>
            <span>🔵 Content</span>
          </div>

          {/* المثال التوضيحي */}
          <div className="relative bg-yellow-50 border border-yellow-200 rounded-2xl p-6 inline-block text-left shadow-sm font-mono text-base">
            <div className="bg-green-100 border border-green-300 rounded-xl p-4 mb-2">
              &lt;p&gt; This is{" "}
              <span className="bg-blue-100 border border-blue-300 rounded-lg px-2 py-1 inline-block">
                &lt;b&gt;bold&lt;/b&gt;
              </span>{" "}
              text. &lt;/p&gt;
            </div>
            <p className="text-sm text-gray-600 italic mt-2 text-center">
              The &lt;b&gt; tag is nested inside the &lt;p&gt; tag.
            </p>
          </div>

          
        </div>
      </div>
    </div>
  </div>
)}

{sec.id === "common-tags" && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    {/* العنوان */}
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-6 flex items-center justify-center gap-2">
      🧠 {sec.heading}
    </h3>

    {/* الوصف */}
    <div className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      {sec.text}
    </div>

    {/* البطاقات الخاصة بالوسوم */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {sec.tags.map((tagItem, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          {/* اسم الوسم */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl font-bold text-orange-500">&lt;{tagItem.tag}&gt;</span>
            <span className="text-gray-600 text-sm">({tagItem.desc})</span>
          </div>

          {/* مثال الوسم */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm mb-4 shadow-inner">
            <code>{tagItem.example}</code>
          </div>

          {/* مخرجات الوسم */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm shadow-sm">
            <p className="text-gray-700 mb-1 font-semibold">Rendered Output:</p>
            <div className="text-gray-800">
              {tagItem.tag === "h1" && <h1 className="text-2xl font-bold text-orange-600">Title</h1>}
              {tagItem.tag === "p" && <p className="text-gray-700">Text here</p>}
              {tagItem.tag === "a" && (
                <a href="#" className="text-blue-600 underline hover:text-blue-800 transition-all">
                  Click me
                </a>
              )}
              {tagItem.tag === "img" && (
                <img
                  src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
                  alt="example"
                  className="w-20 h-20 mx-auto mt-2 rounded-lg shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* فقرة ختامية */}
    <div className="mt-10 text-center text-gray-700 text-lg">
      <p>
        These are some of the <b>most common</b> HTML tags you'll use to structure web pages.
        Each tag plays a unique role in defining the page’s content and layout 🌐
      </p>
    </div>
  </div>
)}

{sec.id === "block-inline" && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    {/* العنوان */}
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-6 flex items-center justify-center gap-2">
      🧩 {sec.heading}
    </h3>

    {/* الوصف */}
    <div className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      {sec.text}
    </div>

    {/* المقارنة بين block و inline */}
    <div className="bg-[#FFFCEB] border border-gray-200 rounded-2xl p-8 shadow-inner text-center max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* العناصر البلوكية */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
          <h4 className="text-red-600 font-semibold mb-4 text-lg">Block Elements</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm mb-3">
            <code>{sec.exampleBlock}</code>
          </div>

          {/* المعاينة */}
          <div className="border border-gray-300 rounded-lg p-3 mt-3 bg-gray-50">
            <div className="bg-red-300 text-white py-2 mb-2 rounded-md">Block 1</div>
            <div className="bg-red-400 text-white py-2 rounded-md">Block 2</div>
          </div>

          <p className="text-sm text-gray-600 italic mt-3">
            Each block element starts on a new line and takes up the full width.
          </p>
        </div>

        {/* العناصر الإنلاين */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
          <h4 className="text-green-700 font-semibold mb-4 text-lg">Inline Elements</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 font-mono text-sm mb-3">
            <code>{sec.exampleInline}</code>
          </div>

          {/* المعاينة */}
          <div className="border border-gray-300 rounded-lg p-3 mt-3 bg-gray-50 text-center">
            <span className="bg-green-300 text-white px-3 py-1 rounded-md inline-block mr-2">
              Inline 1
            </span>
            <span className="bg-green-400 text-white px-3 py-1 rounded-md inline-block">
              Inline 2
            </span>
          </div>

          <p className="text-sm text-gray-600 italic mt-3">
            Inline elements stay within the same line, only taking up as much space as needed.
          </p>
        </div>
      </div>

      {/* توضيح إضافي */}
      <div className="mt-10 text-center">
        <p className="text-gray-800 text-lg font-medium mb-3">
          Think of it like this:
        </p>
        <p className="text-gray-600 italic text-base">
          Block = a paragraph box 🧱 (full width)  
          <br />
          Inline = a word inside the sentence ✍️ (fits beside others)
        </p>
      </div>
    </div>
  </div>
)}

             {sec.id === "attributes" && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    {/* العنوان */}
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-6 flex items-center justify-center gap-2">
      🏷️ {sec.heading}
    </h3>

    {/* الوصف */}
    <div className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      {sec.text}
    </div>

    {/* المحتوى */}
    <div className="bg-[#FFFCEB]  border border-gray-200 rounded-2xl p-8 shadow-inner text-center max-w-4xl mx-auto">
      {/* كود المثال */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm mb-6 text-left shadow-sm">
        <code>{sec.example}</code>
      </div>

      {/* المعاينة */}
      <div className="bg-gray-100 border border-gray-300 rounded-xl p-6 mb-6 flex flex-col items-center justify-center">
        <h4 className="text-gray-800 font-semibold mb-3 text-lg">
          Rendered Output:
        </h4>
        <img
          src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
          alt="cute dog"
          className="w-28 h-28 object-contain rounded-xl shadow-md border border-gray-200 mb-3"
        />
        <p className="text-sm text-gray-600 italic">
          The <b>src</b> defines the image file, and <b>alt</b> appear if the image not apload.
        </p>
      </div>

      {/* توضيح الأجزاء */}
      <div className="mt-6 text-center">
        <p className="text-gray-700 text-lg font-medium mb-4">
          Let's break down the attributes 👇
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 font-mono text-base">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
            <b>&lt;img</b>
          </div>
          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-200 shadow-sm">
            src="dog.jpg"
          </div>
          <div className="bg-pink-50 text-pink-700 px-4 py-2 rounded-lg border border-pink-200 shadow-sm">
            alt="cute dog"
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 shadow-sm">
            /&gt;
          </div>
        </div>

        {/* الأسهم التوضيحية */}
        <div className="flex justify-center gap-16 text-yellow-500 text-lg mt-2">
          <span>Tag name</span>
          <span> Attribute</span>
          <span> Attribute</span>
          <span> Closing</span>
        </div>
      </div>

      {/* فقرة ختامية */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
        <p className="text-gray-800 text-base leading-relaxed">
          Attributes are like <b>extra details</b> you give to a tag to make it work better.  
          For example, in an <b>&lt;img&gt;</b> tag,  
          <b>src</b> tells the browser where the image is,  
          and <b>alt</b> provides alternative text if the image fails to load.
        </p>
      </div>
    </div>
  </div>
)}
{sec.id === "comments" && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    {/* العنوان */}
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-6 flex items-center justify-center gap-2">
      💬 {sec.heading}
    </h3>

    {/* الوصف */}
    <div className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      {sec.text}
    </div>

    {/* محتوى الدرس */}
    <div className="bg-[#FFFCEB] border border-gray-200 rounded-2xl p-8 shadow-inner text-center max-w-4xl mx-auto">
      {/* الكود */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm mb-6 text-left shadow-sm">
        <code>{sec.example}</code>
      </div>

      {/* التوضيح العملي */}
      <div className="grid md:grid-cols-2 gap-8 mb-6">
        {/* التعليق في الكود */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
          <h4 className="text-blue-700 font-semibold mb-3">In the Code</h4>
          <p className="font-mono text-sm bg-white border border-gray-200 rounded-lg p-3 text-gray-800 mb-3">
            &lt;!-- This is a comment --&gt;  
            <br />
            &lt;p&gt;Visible text&lt;/p&gt;
          </p>
          <p className="text-sm text-gray-600 italic">
            Comments are written inside <b>&lt;!-- --&gt;</b> and are not shown in the browser.
          </p>
        </div>

        {/* النتيجة في المتصفح */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
          <h4 className="text-green-700 font-semibold mb-3">Browser Output</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-800">
            <p>Visible text</p>
          </div>
          <p className="text-sm text-gray-600 italic mt-3">
            Only the visible content appears — comments are completely ignored.
          </p>
        </div>
      </div>

      {/* الشرح البصري */}
      <div className="mt-6 text-center">
        <p className="text-gray-700 text-lg font-medium mb-3">
          Comments are useful for leaving notes for yourself or teammates 🧠
        </p>

        <div className="flex flex-wrap justify-center gap-4 font-mono text-base">
          <span className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg border border-yellow-200 shadow-sm">
            &lt;!-- Reminder: Update footer later --&gt;
          </span>
          <span className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 shadow-sm">
            &lt;p&gt;Hello world&lt;/p&gt;
          </span>
        </div>
      </div>

      {/* فقرة ختامية */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm text-gray-800">
        <p>
          💡 <b>Tip:</b> Comments help make your HTML more readable and maintainable — browsers
          skip them completely, but developers will thank you later!
        </p>
      </div>
    </div>
  </div>
)}
{sec.id === "best-practices" && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    {/* العنوان */}
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-8 flex items-center justify-center gap-2">
      🌟 {sec.heading}
    </h3>

    {/* مقدمة بسيطة */}
    <p className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      Let’s look at some common mistakes and how to fix them properly 👇
    </p>

    {/* مقارنة بين الخطأ والصواب */}
    <div className="bg-[#FFFCEB] border border-gray-200 rounded-2xl p-8 shadow-inner text-center max-w-4xl mx-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-yellow-100 border-b border-yellow-200 text-gray-800">
            <th className="py-3 text-lg font-semibold">❌ Incorrect</th>
            <th className="py-3 text-lg font-semibold">✅ Correct</th>
          </tr>
        </thead>
        <tbody>
          {sec.items.map((item, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 hover:bg-yellow-50 transition-all duration-300"
            >
              {/* الخطأ */}
              <td className="py-4 px-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 font-mono text-base text-red-700 shadow-sm">
                  {item.bad}
                </div>
              </td>

              {/* الصواب */}
              <td className="py-4 px-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 font-mono text-base text-green-700 shadow-sm">
                  {item.good}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* فقرة ختامية */}
      <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm text-gray-800 text-base leading-relaxed">
        <p className="font-semibold mb-2 text-center text-orange-700">
          💡 Remember:
        </p>
        <ul className="list-disc list-inside text-left space-y-2">
          <li>Always close your tags properly — browsers can get confused otherwise.</li>
          <li>Use lowercase tag names for clean and consistent code.</li>
          <li>Write clear and readable HTML — future you will thank you!</li>
        </ul>
      </div>
    </div>
  </div>
)}
{sec.id === "mini-project" && (
  <div className="relative bg-[#FFFCEB] border border-yellow-200 rounded-3xl shadow-lg p-10 mb-10 transition-all duration-500 hover:shadow-xl">
    <h3 className="text-center text-3xl font-extrabold text-orange-600 mb-6 flex items-center justify-center gap-2">
      🚀 {sec.heading}
    </h3>

    <p className="text-center text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
      {sec.task}
    </p>

    <MiniProjectSection sec={sec} />
  </div>
)}


              {/* 🔸 زر الذكاء الاصطناعي */}
              {sec.aiPrompt && (
                <div className="flex flex-col gap-3 mt-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAiAskSection(sec.aiPrompt, i)}
                      className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all"
                    >
                      🔍 Explain with AI
                    </button>

                    {/* 👇 زر إخفاء/إظهار إجابات AI */}
                    {aiResponses[i] && (
                      <button
                        onClick={() =>
                          setAiVisible((prev) => ({ ...prev, [i]: !prev[i] }))
                        }
                        className="text-yellow-600 underline text-sm hover:text-yellow-800"
                      >
                        {aiVisible[i] ? "Hide AI Answer" : "Show AI Answer"}
                      </button>
                    )}
                  </div>

                  {aiResponses[i] && aiVisible[i] && (
                    <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-300 p-4 rounded-lg text-sm text-gray-800 whitespace-pre-line">
                      {aiResponses[i]}
                    </div>
                  )}
                </div>
              )}

             {/* 🔸 أزرار التنقل بين الأقسام */}
<div className="flex justify-between mt-6">
  {/* زر Previous - يظهر فقط إذا لم نكن في أول قسم */}
  {currentSectionIndex > 0 && (
    <button
      onClick={() => setCurrentSectionIndex(currentSectionIndex - 1)}
      className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-semibold px-6 py-2 rounded-full shadow-md transition"
    >
      ← Previous
    </button>
  )}

  {/* زر Next - يظهر فقط إذا لم نكن في آخر قسم */}
  {currentSectionIndex < lesson.content.sections.slice(1, -1).length - 1 && (
    <button
      onClick={() => setCurrentSectionIndex(currentSectionIndex + 1)}
      className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-semibold px-6 py-2 rounded-full shadow-md transition ml-auto"
    >
      Next →
    </button>
  )}
</div>

            </section>
          );
        })}

{/* ✅ الكويز يظهر فقط بعد آخر قسم تعليمي */}
{currentSectionIndex === lesson.content.sections.slice(1, -1).length - 1 && (
  <section className="mt-10">
    <Quiz
      lessonId={2}
      totalQuestions={lesson.content?.sections.at(-1)?.quiz?.length || 0}
      questions={lesson.content?.sections.at(-1)?.quiz || []}
      onPassed={() => setQuizCompleted(true)}
    />

    {/* ✅ الأزرار بعد إنهاء الكويز */}
    {quizCompleted && (
      <div className="flex justify-between mt-10">
        <button
          onClick={() => navigate("/lesson-viewer/1")}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-3 rounded-full shadow-md transition"
        >
          ← Previous Lesson
        </button>

        <button
          onClick={() => navigate("/lesson-viewer/3")}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-full shadow-md transition"
        >
          Next Lesson →
        </button>
      </div>
    )}
  </section>
)}



      </div>

      {/* 🔸 زر عائم للـ AI */}
      <button
  onClick={() => setIsSidebarOpen(true)}
  className="fixed bottom-6 right-6 bg-orange-300 hover:bg-orange-400 text-white p-5 rounded-full shadow-lg text-3xl transition-all duration-300"
  title="Ask AI"
>
  🤖
</button>


  {/* 🔹 الشريط الجانبي للـ AI */}
{isSidebarOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
    <div className="w-96 bg-white h-full shadow-2xl p-6 flex flex-col rounded-l-3xl relative">
      {/* 🔸 الرأس */}
      <div className="flex justify-between items-center mb-5 border-b pb-3">
        <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
          🤖 Ask AI
        </h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ✕
        </button>
      </div>

      {/* 🟡 زر محادثة جديدة */}
      <button
        onClick={() => {
          setAiResponses([]); 
          setAiQuestion(""); 
          setAiAnswer("");
        }}
        className="mb-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-sm font-semibold py-2 rounded-full transition-all"
      >
        🆕 New Chat
      </button>

      {/* 🧠 منطقة المحادثة */}
      <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 shadow-inner">
        {aiResponses.length > 0 ? (
          aiResponses.map((msg, index) => (
            <div key={index}>
              <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm text-sm">
                <b className="text-gray-600">You:</b> {msg.question}
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-line shadow-sm">
                <b className="text-orange-600">AI:</b> {msg.answer}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center italic text-gray-400 mt-10">
            Ask me something and I’ll explain it here 👇
          </p>
        )}
      </div>

      {/* 📝 إدخال السؤال */}
      <div className="mt-5">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Your Question
        </label>
        <textarea
          value={aiQuestion}
          onChange={(e) => setAiQuestion(e.target.value)}
          placeholder="Ask about any HTML tag..."
          className="w-full border border-yellow-300 rounded-xl p-3 text-sm resize-none h-24 focus:ring-2 focus:ring-yellow-400 focus:outline-none shadow-sm"
        />

        <button
          onClick={async () => {
            if (!aiQuestion.trim()) return alert("Please type a question!");
            const newMessage = { question: aiQuestion, answer: "🤖 Thinking..." };
            setAiResponses((prev) => [...prev, newMessage]);
            setAiQuestion("");

            try {
              const res = await fetch("http://localhost:5000/api/ai-local/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: newMessage.question }),
              });

              const reader = res.body.getReader();
              const decoder = new TextDecoder();
              let result = "";

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                result += decoder.decode(value);
                setAiResponses((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1].answer = result;
                  return updated;
                });
              }
            } catch (err) {
              setAiResponses((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].answer = "⚠️ Failed to connect to AI.";
                return updated;
              });
              console.error(err);
            }
          }}
          className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full shadow-lg flex items-center justify-center gap-2 font-semibold text-base transition-all"
        >
          🔍 Explain
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}
