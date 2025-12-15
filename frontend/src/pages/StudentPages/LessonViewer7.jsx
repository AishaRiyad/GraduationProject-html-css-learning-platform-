import React, { useEffect, useState } from "react";
import axios from "axios";
import Quiz from "../../components/StudentComponents/Quiz"; // ✅ نفس كمبوننت الكويز المستخدم في الدرس 6
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

// 🎯 Floating ChatBot (Tag Tutor)
function FloatingChatBot() {
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);


  const sendTag = async () => {
    if (!tag.trim()) return;
    setMessages([...messages, { from: "user", text: tag }]);
    setTag("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai-local/tag-tutor", {
        tag,
      });
      setMessages((m) => [...m, { from: "ai", text: res.data.explanation }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "ai", text: "⚠️ Error connecting to AI tutor." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 💬 الزر العائم */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl z-50 transition-all"
      >
        💬
      </button>

      {/* 🧠 نافذة الشات */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-6 w-80 bg-white shadow-2xl rounded-2xl overflow-hidden border border-yellow-200 z-50"
        >
          <div className="bg-yellow-400 text-white font-bold text-center py-2">
            🤖 Tag Tutor
          </div>
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm ${
                  m.from === "user"
                    ? "bg-yellow-100 text-right text-yellow-800 ml-8"
                    : "bg-gray-100 text-left text-gray-700 mr-8"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <p className="text-center text-sm text-gray-400">Thinking...</p>
            )}
          </div>
          <div className="flex border-t">
            <input
              type="text"
              placeholder="Enter an HTML tag..."
              className="flex-grow px-3 py-2 text-sm outline-none"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendTag()}
            />
            <button
              onClick={sendTag}
              className="bg-yellow-400 text-white px-4 font-semibold hover:bg-yellow-500 transition"
            >
              Send
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}

// 🎨 AI Visualizer Component
function AIVisualizer() {
  const [htmlCode, setHtmlCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!htmlCode.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai-local/structure-visualizer",
        { htmlCode }
      );
      setOutput(res.data.structure);
    } catch (e) {
      setOutput("⚠️ Failed to analyze structure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#FFFBEA] to-[#FFF3C4] border border-yellow-300 rounded-2xl shadow-md p-6 mt-6">
      <h3 className="text-lg font-bold text-[#5D4037] mb-2 flex items-center gap-2">
        🧠 AI Activity: Structure Visualizer
      </h3>
      <p className="text-sm text-gray-700 mb-3">
        Paste your HTML code below and let the AI describe your page structure.
      </p>
      <textarea
        rows={6}
        value={htmlCode}
        onChange={(e) => setHtmlCode(e.target.value)}
        placeholder="<header><nav>...</nav></header><main>...</main><footer>...</footer>"
        className="w-full p-3 border rounded-lg text-sm mb-3 focus:ring-2 focus:ring-yellow-300 outline-none"
      ></textarea>
      <button
        onClick={analyze}
        disabled={loading}
        className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        {loading ? "Analyzing..." : "Analyze Structure"}
      </button>

      {output && (
        <div className="mt-4 bg-white border border-yellow-100 rounded-xl p-3 text-sm text-gray-800 whitespace-pre-line">
          {output}
        </div>
      )}
    </div>
  );
}

// 📘 Main Viewer for Lesson 7
export default function LessonViewer7() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [passed, setPassed] = useState(false);
  const { lessonId } = useParams();
  const API = "http://localhost:5000";
 // 🎧 AI Voice Explain for first two sections only
const [playingAudio, setPlayingAudio] = useState(null);
const [loadingVoice, setLoadingVoice] = useState(false);
const [activeSection, setActiveSection] = useState(null);

const handleVoiceExplain = async (heading, content, index) => {
  setActiveSection(index);
  setLoadingVoice(true);

  try {
    const res = await axios.post(`${API}/api/ai-local/voice-explain`, {
      heading,
      content,
    });

    const { audioBase64, text } = res.data;
    console.log("🧠 AI Explanation:", text);

    if (playingAudio) {
      playingAudio.pause();
    }

    const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
    audio.play();
    setPlayingAudio(audio);

    audio.onended = () => {
      setLoadingVoice(false);
      setActiveSection(null);
    };
  } catch (err) {
    console.error("❌ Voice explain failed:", err.message);
    alert("AI voice explanation failed. Please try again.");
    setLoadingVoice(false);
    setActiveSection(null);
  }
};


  // ✅ جلب المحتوى من السيرفر (نفس طريقة LessonViewer6)
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/33`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load lesson 7", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (!lesson)
    return (
      <div className="text-center text-gray-500 p-10">Loading lesson...</div>
    );
 
  const quizSection = lesson.sections.find((s) => s.quiz);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF2] via-[#FFF8E1] to-[#FFF1B8] font-sans relative p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-10">
        {/* 🎬 مقدمة */}
        <section
          id="intro"
          className="relative mb-12 rounded-3xl overflow-hidden shadow-lg"
        >
          <video
            className="w-full h-[500px] object-cover brightness-75"
            src="/videos/semanaticHtml.mp4"
            autoPlay
            loop
            muted
            playsInline
          ></video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000b3] via-[#00000080] to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-start px-14 text-white drop-shadow-xl">
            <h1 className="text-5xl font-extrabold mb-4 flex items-center gap-3">
              🧩 {lesson.title}
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed font-medium">
              {lesson.description}
            </p>
          </div>
        </section>

        {/* ✅ عرض الأقسام */}
    {/* 🔙 Back Button فوق الفيديو */}
<button
  onClick={() => (window.location.href = "http://localhost:3000/lessons")}
  className="absolute top-5 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-[#fff9e6cc] hover:bg-[#fff3c4] text-[#5D4037] font-semibold rounded-full shadow-md backdrop-blur-sm transition-all duration-300"
>
  ⬅️ Back to Lessons
</button>

{/* 🔵 Floating Lesson Navigator (left side) */}
<motion.div
  className="fixed bottom-6 left-6 z-50"
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
>
  {/* 🔘 الزر الرئيسي */}
  <div className="relative group">
    <button className="w-14 h-14 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300">
      📚
    </button>

    {/* 📜 القائمة الجانبية */}
    <div className="absolute left-16 bottom-0 w-56 bg-white border border-yellow-200 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transform transition-all duration-300 p-3">
      <h3 className="text-[#5D4037] font-bold mb-2 text-center">Lesson Sections</h3>
      <ul className="space-y-2">
        {lesson.sections.map((sec, i) => (
          <li key={i}>
            <button
              onClick={() => {
                const el = document.getElementById(`section-${i}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
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


          {lesson.sections.map((sec, i) => (
  <motion.section
    key={i}
    id={`section-${i}`}
    className="mb-10"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: i * 0.1 }}
  >
    {/* 🌟 القسم الأول والثاني (مع الصوت والتصميم الخاص) */}
    {i === 0 || i === 1 ? (
      <div className="bg-gradient-to-br from-[#FFFDF2] to-[#FFF7C0] border border-yellow-200 rounded-3xl shadow-lg p-8 transition-all duration-300 hover:shadow-2xl">
        {/* 🔹 العنوان + زر الصوت */}
        <div className="flex justify-between items-start mb-5">
          <h2 className="text-3xl font-extrabold text-[#5D4037] flex items-center gap-3">
            {sec.heading}
          </h2>
          <button
            onClick={() => handleVoiceExplain(sec.heading, sec.content, i)}
            disabled={loadingVoice && activeSection === i}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all duration-200 ${
              loadingVoice && activeSection === i
                ? "bg-yellow-300 text-white cursor-wait"
                : "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
            }`}
          >
            {loadingVoice && activeSection === i ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-yellow-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                🔊 <span>Listen</span>
              </>
            )}
          </button>
        </div>

        {/* 💡 محتوى القسم الأول والثاني */}
        {i === 0 ? (
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
            {sec.content}
          </p>
        ) : (
          <>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              {sec.content.split("\n")[0]}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {sec.content
                .split("\n")
                .slice(1)
                .filter((line) => line.trim() !== "")
                .map((line, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-3 bg-white/80 border border-yellow-100 rounded-2xl shadow-sm p-4 hover:bg-yellow-50 transition"
                  >
                    <div className="text-2xl">
                      {["🚀", "♿", "🧹", "🤝"][j] || "✨"}
                    </div>
                    <p className="text-gray-700 text-[15px] leading-snug">
                      {line.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    ) : i === 2 ? (
  /* 🧩 القسم الثالث التفاعلي (Common Semantic Elements) */
  <div className="bg-gradient-to-br from-[#FFFDF2] to-[#FFFBEA] border border-yellow-200 rounded-3xl shadow-lg p-8">
    <h2 className="text-3xl font-extrabold text-[#5D4037] flex items-center gap-3 mb-5">
      {sec.heading}
    </h2>

    {/* 🧠 قراءة المحتوى من ملف JSON */}
    {(() => {
      // تقسيم السطور من JSON
      const lines = sec.content.split("\n").filter((l) => l.trim() !== "");

      // أول سطر هو المقدمة
      const intro = lines[0];

      // باقي السطور تحتوي على التاج والوصف
      const tagLines = lines.slice(1);

      // تحويل كل سطر إلى كائن {tag, desc}
      const parsedTags = tagLines.map((line) => {
        const [tag, desc] = line.split(":").map((s) => s.trim());
        return { tag, desc };
      });

      return (
        <>
          <p className="text-gray-700 mb-6 text-[15px]">{intro}</p>

          {/* 🌟 عرض التاجات التفاعلية */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {parsedTags.map((el, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="relative group bg-white border border-yellow-100 rounded-2xl p-5 shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {["🧭", "🗺️", "📄", "🧩", "📰", "💡", "📍", "🖼️"][idx] || "✨"}
                  </span>
                  <code className="text-yellow-700 font-semibold text-lg">
                    {el.tag}
                  </code>
                </div>
                <p className="text-gray-700 text-sm">{el.desc}</p>

                {/* 🧠 نافذة تظهر عند hover لعرض مثال توضيحي */}
                <div className="absolute inset-0 bg-white/95 rounded-2xl shadow-lg p-4 text-[13px] text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-auto">
                  <p className="font-semibold mb-1 text-yellow-700">💡 Example:</p>
                  <pre className="bg-yellow-50 border border-yellow-100 rounded-md p-2 text-gray-800 whitespace-pre-wrap">
                    {`<${el.tag.replace(/[<>]/g, "")}>...</${el.tag.replace(/[<>]/g, "")}>`}
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      );
    })()}
  </div>

) : i === 3 ? (
  <div className="bg-gradient-to-br from-[#FFFDF2] to-[#FFFBEA] border border-yellow-200 rounded-3xl shadow-lg p-8">
    <h2 className="text-3xl font-extrabold text-[#5D4037] flex items-center gap-3 mb-5">
      {sec.heading}
    </h2>

    {/* 🧠 قراءة المحتوى من JSON */}
    {(() => {
      const lines = sec.content.split("\n").filter((l) => l.trim() !== "");
      const intro = lines[0]; // الجملة التعريفية
      const beforeIndex = lines.findIndex((l) => l.toLowerCase().includes("before"));
      const afterIndex = lines.findIndex((l) => l.toLowerCase().includes("after"));
      const beforeCode = lines.slice(beforeIndex + 1, afterIndex).join("\n");
      const afterCode = lines.slice(afterIndex + 1).join("\n");

      return (
        <>
          <p className="text-gray-700 mb-6 text-[15px]">{intro}</p>

          {/* 🧱 الصندوقين قبل وبعد */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* ❌ Before */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-[#FFF8F8] border border-red-200 rounded-2xl shadow-inner p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-500 text-xl">❌</span>
                <h3 className="text-lg font-semibold text-red-700">Before</h3>
              </div>
              <pre className="bg-white border border-red-100 rounded-lg p-3 text-sm text-gray-800 font-mono leading-relaxed overflow-x-auto">
                {beforeCode}
              </pre>
            </motion.div>

            {/* ✅ After */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-[#F9FFF6] border border-green-200 rounded-2xl shadow-inner p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-green-600 text-xl">✅</span>
                <h3 className="text-lg font-semibold text-green-700">After</h3>
              </div>
              <pre className="bg-white border border-green-100 rounded-lg p-3 text-sm text-gray-800 font-mono leading-relaxed overflow-x-auto">
                {afterCode}
              </pre>
            </motion.div>
          </div>

          {/* 🔘 زر مقارنة تفاعلي */}
          <div className="text-center mt-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() =>
                alert(
                  "Semantic tags replace generic <div> elements with meaningful structure!"
                )
              }
              className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all"
            >
              🔍 Compare the Difference
            </motion.button>
          </div>
        </>
      );
    })()}
  </div>
) :i === 4 ? (
  /* 🎨 القسم الخامس: Visual Page Layout Example */
  <div className="bg-gradient-to-br from-[#FFFDF2] to-[#FFFBEA] border border-yellow-200 rounded-3xl shadow-lg p-8">
    <h2 className="text-3xl font-extrabold text-[#5D4037] flex items-center gap-3 mb-5">
       {sec.heading}
    </h2>

    {/* 🧠 قراءة المحتوى من JSON */}
    {(() => {
      const lines = sec.content.split("\n").filter((l) => l.trim() !== "");
      const intro = lines[0];
      const outro = lines[lines.length - 1];

      return (
        <>
          <p className="text-gray-700 mb-6 text-[15px]">{intro}</p>

          {/* 🧩 المخطط البصري للصفحة */}
          <div className="w-full bg-white border border-yellow-100 rounded-2xl shadow-inner p-5 mb-6">
            {/* Header */}
            <div className="bg-yellow-200/60 border border-yellow-400 text-center text-yellow-800 font-semibold py-2 rounded-t-lg">
              &lt;header&gt;
            </div>

            {/* Body layout: nav, main, aside */}
            <div className="grid grid-cols-4 gap-2 my-2 text-center text-[14px] font-mono">
              <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 p-3 rounded-md col-span-1 flex items-center justify-center">
                &lt;nav&gt;
              </div>
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-md col-span-2 flex flex-col justify-center items-center">
                <span>&lt;main&gt;</span>
                <div className="w-3/4 h-[1px] bg-yellow-300 my-1"></div>
                <span className="text-xs opacity-70">content area</span>
              </div>
              <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 p-3 rounded-md col-span-1 flex items-center justify-center">
                &lt;aside&gt;
              </div>
            </div>

            {/* Footer */}
            <div className="bg-yellow-200/60 border border-yellow-400 text-center text-yellow-800 font-semibold py-2 rounded-b-lg">
              &lt;footer&gt;
            </div>
          </div>

          <p className="text-gray-700 italic text-[14px]">{outro}</p>
        </>
      );
    })()}
  </div>
) : (
  // باقي الأقسام العادية
  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md border border-yellow-100 p-6">
    <h2 className="text-2xl font-bold text-[#5D4037] mb-3">{sec.heading}</h2>
    <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed text-[15px]">
      {sec.content}
    </pre>
    {sec.aiVisualizer && <AIVisualizer />}
    {sec.quiz && (
      <Quiz
        lessonId={33}
        questions={sec.quiz.questions}
        totalQuestions={sec.quiz.questions.length}
        onPassed={() => {
          setQuizCompleted(true);
          setPassed(true);
        }}
        onFailed={() => {
          setQuizCompleted(true);
          setPassed(false);
        }}
      />
    )}
  </div>
)
}
  </motion.section>
))}



        {/* ✅ أزرار الانتقال بعد الكويز */}
        {quizCompleted && (
          <div className="flex justify-center gap-6 mt-10">
            <button
              onClick={() =>
                (window.location.href =
                  "http://localhost:3000/lesson-viewer/32")
              }
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
            >
              ⬅️ Previous Lesson
            </button>

            <button
              onClick={() => {
                if (passed)
                  window.location.href =
                    "http://localhost:3000/lesson-viewer/34";
              }}
              disabled={!passed}
              className={`px-6 py-3 font-semibold rounded-lg transition ${
                passed
                  ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next Lesson ➡️
            </button>
          </div>
        )}
      </div>

      {/* 💬 Floating ChatBot */}
      {lesson.aiChatFloating && <FloatingChatBot />}
    </div>
  );
}
