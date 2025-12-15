import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import LiveCodeBox from "../../components/StudentComponents/LiveCodeBox";
import InteractiveFlexPlayground from "../../components/StudentComponents/InteractiveFlexPlayground";
import Quiz from "../../components/StudentComponents/Quiz";



// ================================
// 💬 Floating HTML Assistant
// ================================
function FloatingHTMLAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
const [width, setWidth] = React.useState(800); // 🔹 العرض الابتدائ


  const sendQuestion = async () => {
    if (!question.trim()) return;
    setMessages([...messages, { from: "user", text: question }]);
    setQuestion("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai-local/html-assistant", {
        question,
      });
      setMessages((m) => [...m, { from: "ai", text: res.data.answer }]);
    } catch {
      setMessages((m) => [...m, { from: "ai", text: "⚠️ Error reaching AI Assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-[#F5B700] hover:bg-[#F1A500] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl z-50 transition-all"
      >
        💬
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 w-80 bg-white shadow-2xl rounded-2xl overflow-hidden border border-yellow-200 z-50"
        >
          <div className="bg-[#F5B700] text-white font-bold text-center py-2">
            🤖 HTML Assistant
          </div>
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm ${
                  m.from === "user"
                    ? "bg-[#FFF9E5] text-right text-yellow-800 ml-8"
                    : "bg-[#F9FAFB] text-left text-gray-700 mr-8"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <p className="text-center text-sm text-gray-400">Thinking...</p>}
          </div>
          <div className="flex border-t">
            <input
              type="text"
              placeholder="Ask about HTML..."
              className="flex-grow px-3 py-2 text-sm outline-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
            />
            <button
              onClick={sendQuestion}
              className="bg-[#F5B700] text-white px-4 font-semibold hover:bg-[#F1A500] transition"
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
function MediaQueryDemo() {
  const [width, setWidth] = React.useState(300);

  return (
    <div className="mt-8 bg-gradient-to-br from-[#FFFDF8] via-[#FFFBE6] to-[#FFF3C0] border border-yellow-200 rounded-2xl shadow-md p-8">
      {/* 🧱 Example Code */}
      <h3 className="text-lg font-bold text-[#5D4037] mb-3 flex items-center justify-center gap-2">
        💻 Example Code:
      </h3>
      <pre className="bg-[#E3F2FD] border border-blue-200 rounded-lg text-left p-4 text-sm font-mono text-[#1A237E] whitespace-pre-wrap shadow-inner mb-6">
{`@media (max-width: 600px) {
  body {
    background-color: lightblue;
  }
}`}
      </pre>

      {/* 🌈 Try Section */}
      <div className="border-t border-yellow-300 pt-6">
        <h4 className="text-[#4E342E] font-semibold mb-4 flex items-center justify-center gap-2">
          🌈 Try resizing the box below using the slider!
        </h4>

        {/* 🎚️ Slider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-sm text-gray-700 font-medium">
            📏 Width: <span className="text-[#F5B700] font-semibold">{width}px</span>
          </span>
          <input
            type="range"
            min="300"
            max="900"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-64 accent-yellow-500 cursor-pointer"
          />
        </div>

        {/* 📦 Demo Box */}
        <div
          className="mx-auto rounded-2xl overflow-hidden shadow-lg border border-yellow-300 transition-all duration-300 flex items-center justify-center"
          style={{
            width: `${width}px`,
            height: "180px",
            backgroundColor: width <= 600 ? "#ADD8E6" : "#FFF",
          }}
        >
          <div className="text-[#4E342E] text-lg font-semibold text-center">
            Resize the width ↓
            <div className="mt-2 text-base font-bold flex items-center justify-center gap-2">
              <span
                className={`inline-block w-4 h-4 rounded ${
                  width <= 600 ? "bg-[#ADD8E6]" : "bg-[#E1BEE7]"
                }`}
              ></span>
              {width <= 600 ? "Light Blue (small screen)" : "Normal (desktop view)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticalExampleDemo({ description }) {
  const [width, setWidth] = React.useState(300);

  return (
    <div className="bg-gradient-to-br from-[#FFFDF8] via-[#FFFBE6] to-[#FFF3C0] border border-yellow-200 rounded-2xl shadow-md p-10 text-center">
      {/* 🧱 العنوان */}
      <h2 className="text-3xl font-extrabold text-[#4E342E] mb-6 flex items-center justify-center gap-2">
        🧱 Practical Example: Two Columns to One
      </h2>

      {/* 🧾 الشرح النصي من JSON */}
      {description && (
        <p className="text-gray-800 text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
          {description}
        </p>
      )}

      {/* 💻 مربع الكود */}
      <div className="bg-[#E3F2FD] border border-blue-200 rounded-xl p-5 text-left font-mono text-sm text-[#1A237E] shadow-inner mb-8 whitespace-pre-wrap">
{`<style>
  .container { display: flex; }
  .box { flex: 1; padding: 20px; background: #eee; margin: 5px; }

  @media (max-width: 600px) {
    .container { flex-direction: column; }
  }
</style>

<div class="container">
  <div class="box">Box 1</div>
  <div class="box">Box 2</div>
</div>`}
      </div>

      {/* 🧠 تعليم المستخدم */}
      <div className="text-[#4E342E] font-medium text-lg mb-3">
        👇 Try it yourself: Drag the slider to resize and watch the layout change!
      </div>

      {/* 🎚️ السلايدر */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="text-sm text-gray-700 font-medium">
          📏 Width: <span className="text-[#F5B700] font-semibold">{width}px</span>
        </span>
        <input
          type="range"
          min="300"
          max="900"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-64 accent-yellow-500 cursor-pointer"
        />
      </div>

      {/* 📦 النتيجة التفاعلية */}
      <div
        className="mx-auto border border-yellow-200 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 bg-white flex justify-center"
        style={{
          width: `${width}px`,
          flexDirection: width <= 600 ? "column" : "row",
        }}
      >
        <div className="flex-1 p-6 m-2 bg-[#FFE082] text-[#4E342E] font-bold text-lg rounded-xl shadow-sm">
          Box 1
        </div>
        <div className="flex-1 p-6 m-2 bg-[#FFB74D] text-[#4E342E] font-bold text-lg rounded-xl shadow-sm">
          Box 2
        </div>
      </div>

      {/* 💬 التوضيح الختامي */}
      <p className="mt-8 text-gray-700 text-md italic max-w-2xl mx-auto">
        💡 When the width goes below 600px, the boxes stack vertically —
        demonstrating how <code>@media</code> queries create responsive layouts.
      </p>
    </div>
  );
}

function CompareDevicesDemo({ currentIndex }) {
  const [device, setDevice] = React.useState("laptop");

  React.useEffect(() => {
    setDevice("mobile");
  }, [currentIndex]);

  const getDeviceConfig = () => {
    switch (device) {
      case "mobile":
        return { width: 360, layout: "column", height: 480 };
      case "laptop":
        return { width: 850, layout: "row", height: 420 };
      case "desktop":
        return { width: 1000, layout: "row", height: 440 };
      default:
        return {};
    }
  };

  const { width, layout, height } = getDeviceConfig();

  return (
    <div className="bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E1] to-[#FFF3B0] border border-yellow-200 rounded-[2rem] shadow-lg p-10 text-center">
      <h2 className="text-3xl font-extrabold text-[#4E342E] mb-4 flex items-center justify-center gap-2">
        💻 Compare Design on Devices
      </h2>

      <p className="text-gray-800 text-lg leading-relaxed mb-6">
        Choose a device to visualize how the responsive layout adapts.
      </p>

      {/* 📱 Device Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        {["mobile", "laptop", "desktop"].map((type) => (
          <button
            key={type}
            onClick={() => setDevice(type)}
            className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
              device === type
                ? type === "mobile"
                  ? "bg-[#FFB74D] text-white shadow-md scale-105"
                  : type === "laptop"
                  ? "bg-[#4FC3F7] text-white shadow-md scale-105"
                  : "bg-[#81C784] text-white shadow-md scale-105"
                : "bg-[#FFF5CC] hover:bg-[#FFE88F] text-[#4E342E]"
            }`}
          >
            {type === "mobile" && "📱 Mobile"}
            {type === "laptop" && "💻 Laptop"}
            {type === "desktop" && "🖥️ Desktop"}
          </button>
        ))}
      </div>

      {/* 🪟 Preview Frame */}
      <div
        className="mx-auto border border-yellow-300 rounded-2xl shadow-2xl overflow-hidden transition-all duration-700"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "#fffef9",
        }}
      >
        {/* Navbar */}
        <div className="h-10 bg-gradient-to-r from-[#F5A300] to-[#FBC02D] flex items-center justify-center text-white font-semibold relative shadow-md">
          <div className="absolute left-4 flex gap-2">
            <span className="w-3 h-3 bg-red-400 rounded-full"></span>
            <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
          </div>
          {device === "mobile" && "📱 Mobile (360px)"}
          {device === "laptop" && "💻 Laptop (1024px)"}
          {device === "desktop" && "🖥️ Desktop (1440px)"}
        </div>

        {/* Layout */}
        <div
          className="flex transition-all duration-700"
          style={{
            flexDirection: layout === "column" ? "column" : "row",
            height: "calc(100% - 40px)",
          }}
        >
          {/* Sidebar */}
          <motion.div
            key={device + "sidebar"}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className={`${
              device === "mobile" ? "order-2 w-full" : "w-1/4"
            } bg-[#FFF9C4] border-r border-yellow-200 flex flex-col justify-center gap-3 p-5 text-left shadow-inner`}
          >
            <p className="text-[#4E342E] font-semibold flex items-center gap-2">
              🏠 Home
            </p>
            <p className="text-[#4E342E] font-semibold flex items-center gap-2">
              📄 Articles
            </p>
            <p className="text-[#4E342E] font-semibold flex items-center gap-2">
              ⚙️ Settings
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            key={device + "content"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex-1 grid gap-4 p-5 transition-all duration-500 ${
              device === "mobile"
                ? "grid-cols-1"
                : device === "laptop"
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
            style={{
              backgroundColor: device === "desktop" ? "#F3F4F6" : "#FFF8E1",
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-yellow-100 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-center items-center"
              >
                <div className="w-12 h-12 bg-[#FFD54F] rounded-full mb-3 shadow-sm"></div>
                <p className="font-medium text-[#4E342E]">Card {i}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 💡 Description */}
      <p className="mt-8 text-gray-700 text-md italic max-w-2xl mx-auto">
        {device === "mobile" && (
          <>
            <span className="text-[#F57C00] font-semibold">📱 Mobile:</span>{" "}
            Sidebar moves below content, and cards stack vertically for small screens.
          </>
        )}
        {device === "laptop" && (
          <>
            <span className="text-[#0288D1] font-semibold">💻 Laptop:</span>{" "}
            Sidebar stays on the left, and cards arrange into two columns.
          </>
        )}
        {device === "desktop" && (
          <>
            <span className="text-[#2E7D32] font-semibold">🖥️ Desktop:</span>{" "}
            Wider layout fits three cards with extra spacing for a clean look.
          </>
        )}
      </p>
    </div>
  );
}


// ================================
// 📘 Lesson Viewer 8
// ================================
export default function LessonViewer8() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const API = "http://localhost:5000";
    const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/34`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load lesson 8", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  if (loading) return <div className="text-center text-gray-500 p-10">Loading lesson...</div>;
  if (!lesson) return <div className="text-center text-red-500 p-10">Lesson not found</div>;

  const totalSections = lesson.sections.length;
  const section = lesson.sections[currentIndex];
  const progress = ((currentIndex + 1) / totalSections) * 100;

  const next = () => {
    if (currentIndex < totalSections - 1) setCurrentIndex(currentIndex + 1);
  };
  const back = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // ✨ دالة ترسم البطاقة حسب نوع القسم
  const renderSection = (section) => {
    const { heading, content } = section;

    if (heading.includes("Responsive Images")) {
      return (
        <div className="bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E1] to-[#FFF3B0] border border-yellow-200 rounded-[2rem] shadow-xl p-10">
          <h2 className="text-3xl font-extrabold text-[#4E342E] mb-5 flex items-center gap-2">
             {heading}
          </h2>
          <p className="text-gray-800 text-lg leading-relaxed mb-4">
            Images should scale automatically to fit their containers. Use CSS properties like width:
            100% or max-width: 100%.
          </p>
          <LiveCodeBox
            initialCode={`<img src="/mountain.jpg" style="max-width: 100%; height: auto;">`}
          />
        </div>
      );
    }

    if (heading.includes("Fluid Layouts")) {
      return (
        <div className="bg-gradient-to-r from-[#FFF8DC] to-[#FFF5B5] border border-yellow-300 rounded-[2rem] shadow-lg p-10">
          <h2 className="text-3xl font-extrabold text-[#4E342E] mb-6"> {heading}</h2>
          <p className="text-gray-800 text-lg leading-relaxed mb-5">
            Fluid layouts use flexible widths that adapt to screen size. Try dragging the boxes below
            vertically or horizontally.
          </p>
          <InteractiveFlexPlayground />
        </div>
      );
    }

if (heading.includes("viewport")) {
  return (
    <div className="bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E1] to-[#FFF3B0] border border-yellow-200 rounded-[2rem] shadow-xl p-10 text-left">
      <h2 className="text-3xl font-extrabold text-[#4E342E] mb-4 flex items-center gap-2">
         {heading}
      </h2>

      {/* 🧾 المحتوى من ملف JSON */}
     {content && content.split("\n").map((line, i) => (

        <p key={i} className="text-gray-800 text-lg leading-relaxed mb-4">
          {line.trim()}
        </p>
      ))}

      {/* 🧩 كود الميتا فيو بورت */}
      <div className="bg-[#FFFBEA] border border-yellow-300 rounded-xl p-4 font-mono text-sm text-[#4E342E] shadow-inner mt-4">
        &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
      </div>

      {/* 💡 النص الثابت */}
      <p className="mt-5 text-gray-700 text-md italic">
        💡 Tip: Always include this line inside the <code>&lt;head&gt;</code> section of your HTML document to make your design responsive.
      </p>
    </div>
  );
}
if (heading.includes("Media Queries")) {
  return (
    <div className="bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E1] to-[#FFF3B0] border border-yellow-200 rounded-[2rem] shadow-lg p-10 text-center">
      <h2 className="text-3xl font-extrabold text-[#4E342E] mb-6 flex items-center justify-center gap-2">
         {heading}
      </h2>

      {content && content.split("\n").map((line, i) => (

        <p key={i} className="text-gray-800 text-lg leading-relaxed mb-4 max-w-3xl mx-auto">
          {line.trim()}
        </p>
      ))}

      {/* 🔹 المكوّن التفاعلي */}
      <MediaQueryDemo />

      <p className="mt-8 text-gray-700 text-md italic max-w-2xl mx-auto">
        💡 As you slide below 600px, the box background turns light blue —
        showing how <code>@media</code> rules adapt your design for small screens.
      </p>
    </div>
  );
}
if (heading.includes("Practical Example")) {
  return <PracticalExampleDemo description={content} />;
}
if (heading.includes("Compare Design")) {
  return <CompareDevicesDemo currentIndex={currentIndex} />;
}

if (heading.includes("Quiz")) {
  const quiz = section.quiz;

  const processedQuestions =
    quiz && quiz.questions
      ? quiz.questions.map((q) => {
          const answerIndex = q.options.findIndex(
            (opt) => opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
          );
          return { ...q, answer: answerIndex !== -1 ? answerIndex : 0 };
        })
      : [];

  return (
    <div className="bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E1] to-[#FFF3B0] border border-yellow-200 rounded-[2rem] shadow-xl p-10 text-center">
      <h2 className="text-3xl font-extrabold text-[#4E342E] mb-6 flex items-center justify-center gap-2">
        {heading}
      </h2>

      {/* 🧩 الكويز */}
      {processedQuestions.length > 0 ? (
        <Quiz
          lessonId={34}
          questions={processedQuestions}
          totalQuestions={processedQuestions.length}
          onPassed={() => setQuizPassed(true)} // ✅ يستخدم الحالة من المكون الرئيسي
        />
      ) : (
        <p className="text-gray-600 italic">⚠️ No quiz questions found.</p>
      )}

      {/* 🟡 الأزرار بعد الكويز */}
      <div className="flex justify-center gap-6 mt-10">
        <button
          onClick={() => (window.location.href = "http://localhost:3000/lesson-viewer/33")}
          className="px-6 py-2 bg-[#FFF5CC] hover:bg-[#FFE88F] text-[#4E342E] font-semibold rounded-full shadow-sm transition"
        >
          ⬅️ Previous Lesson
        </button>

        <button
          onClick={() =>
            quizPassed
              ? (window.location.href = "http://localhost:3000/lesson-viewer/35")
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

      <p className="text-center mt-4 text-sm text-gray-500 italic">
        {quizPassed
          ? "🎉 You passed! The next lesson is now unlocked."
          : "Finish and pass the quiz to unlock the next lesson."}
      </p>
    </div>
  );
}





    // باقي الأقسام عادية
    return (
      <div className="bg-gradient-to-br from-[#FFFDF5] via-[#FFF8DC] to-[#FFF3B0] border border-yellow-200 rounded-[2rem] shadow-md p-10">
        <h2 className="text-3xl font-extrabold text-[#4E342E] mb-5">{heading}</h2>
        {content && content.split("\n").map((line, i) => (

          <p key={i} className="text-gray-800 text-lg leading-relaxed mb-3">
            {line.trim()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF2] via-[#FFF8E1] to-[#FFF1B8] font-sans">
      {/* 📊 Progress Bar */}
      <div className="w-full h-2 bg-gray-200 fixed top-0 left-0 z-50">
        <div
          className="h-full bg-[#F5B700] transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
{/* 🔙 Back Button */}
<button
  onClick={() => (window.location.href = "http://localhost:3000/lessons")}
  className="absolute top-20 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-[#fff9e6cc] hover:bg-[#fff3c4] text-[#5D4037] font-semibold rounded-full shadow-md backdrop-blur-sm transition-all duration-300"
>
  ⬅️ Back to Lessons
</button>

{/* 📚 Floating Lesson Navigator */}
<motion.div
  className="fixed bottom-6 left-6 z-50"
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
>
  <div className="relative group">
    {/* 🔘 الزر الرئيسي */}
    <button className="w-14 h-14 bg-[#F5B700] hover:bg-[#F1A500] text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300">
      📚
    </button>

    {/* 📜 القائمة الجانبية */}
    <div className="absolute left-16 bottom-0 w-56 bg-white border border-yellow-200 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transform transition-all duration-300 p-3">
      <h3 className="text-[#5D4037] font-bold mb-2 text-center">Lesson Sections</h3>
      <ul className="space-y-2">
        {lesson.sections.map((sec, i) => (
          <li key={i}>
            <button
             onClick={() => setCurrentIndex(i)}

              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-yellow-100 transition"
            >
              {sec.heading.replace(/^[^a-zA-Z]+/, "")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
</motion.div>

      {/* 🎓 Header */}
      <div className="text-center py-14 bg-gradient-to-r from-[#FFF3C4] to-[#FFF9E5] shadow-sm mb-8">
        <h1 className="text-5xl font-extrabold text-[#5D4037] mb-4">{lesson.title}</h1>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">{lesson.description}</p>
      </div>

      {/* 📚 Section Renderer */}
      <div className="max-w-4xl mx-auto p-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {renderSection(section)}

            {/* 🔘 Navigation */}
            <div className="flex justify-between mt-10">
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
      </div>

      {/* 💬 Floating Assistant */}
      <FloatingHTMLAssistant />
    </div>
  );
}
