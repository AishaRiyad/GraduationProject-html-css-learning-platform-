import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Quiz from "../../components/StudentComponents/Quiz";
import LiveCodeEditor from "../../components/StudentComponents/LiveCodeEditor";
import QuizLesson5 from "../../components/StudentComponents/QuizLesson5";


import {
  Type,
  AtSign,
  Lock,
  Hash,
  Calendar,
  Palette,
  SlidersHorizontal,
  Upload,
  CheckSquare,
  CircleDot,
  Send,
} from "lucide-react";




export default function LessonViewer5() {
    
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [weather, setWeather] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [aiReview, setAiReview] = useState("");
  const [quizPassed, setQuizPassed] = useState(false);
  const [completedSections, setCompletedSections] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
 const navigate = useNavigate();
 const [nextEnabled, setNextEnabled] = useState(false);



const handleAiAsk = async () => {
  if (!aiQuestion.trim()) return;
  setAiLoading(true);
  setAiAnswer("");

  try {
    const res = await axios.post(`${API}/api/ai-local/assist`, {
      question: `Generate only pure HTML code for a form using <${aiQuestion}> input type. 
                 Do not include any explanation or text, only HTML code.`,
    });
    setAiAnswer(res.data.answer);
  } catch (err) {
    setAiAnswer("⚠️ Error connecting to AI server.");
  } finally {
    setAiLoading(false);
  }
};





  const API = "http://localhost:5000";
  const { lessonId } = useParams();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/31`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("📦 LESSON DATA:", res.data);

        setLesson(res.data.content);

      } catch (e) {
        console.error("❌ Failed to load lesson", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

 

  const handleWeather = async (city) => {
    try {
      const res = await axios.get(`${API}/api/weather/${city}`);
      setWeather(res.data);
    } catch (err) {
      setWeather({ error: "Could not fetch weather data." });
    }
  };

  const handleAiReview = async () => {
    try {
      const res = await axios.post(`${API}/api/ai-local/review-project`, {
        code: userCode,
      });
      setAiReview(res.data.review);
    } catch (err) {
      setAiReview("⚠️ Error reviewing your code.");
    }
  };

  if (loading)
    return (
      <p className="text-center text-lg font-semibold mt-20 text-yellow-700">
        Loading lesson...
      </p>
    );

  if (!lesson || !lesson.sections)
    return (
      <p className="text-center text-lg font-semibold mt-20 text-red-600">
        Lesson not found.
      </p>
    );
// ✅ بعد ما نتأكد إن الداتا محملة بنحسب آخر كويز
const lastQuizIndex = lesson.sections
  .map((s, idx) => (s.quiz ? idx : -1))
  .filter((idx) => idx !== -1)
  .pop();

  function FormAttributesDemo({ attributes }) {
      const [selectedIndex, setSelectedIndex] = useState(0)
   if (!attributes || attributes.length === 0) {
    return (
      <p className="text-center text-gray-500 italic">
        ⚠️ No attributes data found for this section.
      </p>
    );
  }

  
  const selected = attributes[selectedIndex];
  return (
    <div className="bg-gradient-to-br from-[#FFFBEA] to-[#FFF3C4] border border-yellow-300 rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-bold text-[#5D4037] mb-4 flex items-center gap-2">
        ✨ Explore Form Attributes
      </h3>

      {/* 🔹 أزرار الخصائص */}
      <div className="flex flex-wrap gap-3 mb-6">
        {attributes.map((attr, i) => (
          <button
            key={attr.name}
            onClick={() => setSelectedIndex(i)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedIndex === i
                ? "bg-yellow-500 text-white shadow-md scale-105"
                : "bg-white text-[#5D4037] border border-yellow-300 hover:bg-yellow-100"
            }`}
          >
            {attr.name}
          </button>
        ))}
      </div>

      {/* 🔸 الشرح */}
      <div className="bg-white/70 p-4 rounded-xl border-l-4 border-yellow-500 mb-5 shadow-sm">
        <p className="text-gray-800">
          <b className="capitalize">{selected.name}</b>: {selected.description}
        </p>
      </div>

      {/* 💻 الكود */}
      <div className="bg-[#FFF9C4] border border-yellow-200 p-4 rounded-lg overflow-x-auto text-sm text-gray-800 font-mono">
        <code>{selected.exampleCode}</code>
      </div>

      {/* 🧠 المعاينة الحية */}
     {/* 🧠 Example Preview (Live execution instead of static HTML) */}
<div className="mt-4 bg-white p-5 rounded-xl shadow-inner border border-yellow-100">
  {selected.name === "action" && (
    <form
      action="https://httpbin.org/post"
      method="POST"
      target="_blank"
      className="flex gap-2 items-center"
    >
      <input
        type="text"
        name="username"
        placeholder="Enter name"
        className="border rounded-lg p-2 flex-1"
        required
      />
      <button
        type="submit"
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
      >
        Submit
      </button>
    </form>
  )}

  {selected.name === "method" && (
    <>
      <p className="text-sm mb-2 text-gray-700">Try GET vs POST:</p>
      <form
        method="GET"
        action="https://httpbin.org/get"
        target="_blank"
        className="flex gap-2 items-center"
      >
        <input
          type="text"
          name="city"
          placeholder="Enter city"
          className="border rounded-lg p-2 flex-1"
        />
        <button
          type="submit"
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
        >
          Send GET
        </button>
      </form>
      <form
        method="POST"
        action="https://httpbin.org/post"
        target="_blank"
        className="flex gap-2 items-center mt-3"
      >
        <input
          type="text"
          name="user"
          placeholder="Enter name"
          className="border rounded-lg p-2 flex-1"
        />
        <button
          type="submit"
          className="bg-yellow-700 text-white px-4 py-2 rounded-lg hover:bg-yellow-800"
        >
          Send POST
        </button>
      </form>
    </>
  )}

  {selected.name === "target" && (
    <form
      action="https://example.com"
      target="_blank"
      className="flex gap-2 items-center"
    >
      <input
        type="text"
        placeholder="Enter text"
        className="border rounded-lg p-2 flex-1"
      />
      <button
        type="submit"
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
      >
        Open in new tab
      </button>
    </form>
  )}

  {selected.name === "autocomplete" && (
    <form autoComplete="on" className="flex flex-col gap-2">
      <input
        type="email"
        placeholder="Email"
        name="email"
        className="border rounded-lg p-2"
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        className="border rounded-lg p-2"
      />
      <button
        type="submit"
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
      >
        Submit
      </button>
    </form>
  )}

  {selected.name === "novalidate" && (
    <form noValidate className="flex flex-col gap-2">
      <input
        type="email"
        placeholder="Email (won’t be validated)"
        className="border rounded-lg p-2"
        required
      />
      <button
        type="submit"
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
      >
        Submit without validation
      </button>
    </form>
  )}
</div>

    </div>
  );
}


function InputTypesDemo({ inputs }) {
  const [selected, setSelected] = useState(inputs?.[0] || null);

  // خريطة الأيقونات حسب النوع
  const icons = {
    text: <Type size={50} color="#FBBF24" strokeWidth={1.8} />,
    email: <AtSign size={50} color="#FBBF24" strokeWidth={1.8} />,
    password: <Lock size={50} color="#FBBF24" strokeWidth={1.8} />,
    number: <Hash size={50} color="#FBBF24" strokeWidth={1.8} />,
    date: <Calendar size={50} color="#FBBF24" strokeWidth={1.8} />,
    color: <Palette size={50} color="#FBBF24" strokeWidth={1.8} />,
    range: <SlidersHorizontal size={50} color="#FBBF24" strokeWidth={1.8} />,
    file: <Upload size={50} color="#FBBF24" strokeWidth={1.8} />,
    checkbox: <CheckSquare size={50} color="#FBBF24" strokeWidth={1.8} />,
    radio: <CircleDot size={50} color="#FBBF24" strokeWidth={1.8} />,
    submit: <Send size={50} color="#FBBF24" strokeWidth={1.8} />,
  };

  // إذا ما في بيانات
  if (!inputs || inputs.length === 0) {
    return (
      <p className="text-gray-500 italic text-center">
        ⚠️ No input types found.
      </p>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#FFFBEA] to-[#FFF3C4] border border-yellow-300 rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-bold text-[#5D4037] mb-4 flex items-center gap-2">
        🎨 Explore Input Types
      </h3>

      {/* أزرار الأنواع */}
      <div className="flex flex-wrap gap-3 mb-6">
        {inputs.map((inp) => (
          <button
            key={inp.type}
            onClick={() => setSelected(inp)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              selected?.type === inp.type
                ? "bg-yellow-500 text-white shadow-md scale-105"
                : "bg-white text-[#5D4037] border border-yellow-300 hover:bg-yellow-100"
            }`}
          >
            {inp.type}
          </button>
        ))}
      </div>

      {/* الأيقونة + الشرح */}
      {selected && (
        <>
          <div className="flex flex-col sm:flex-row gap-6 items-center mb-4 transition-all duration-300 ease-in-out">
            <div className="p-4 bg-white border border-yellow-200 rounded-2xl shadow-inner">
              {icons[selected.type] || (
                <Type size={50} color="#FBBF24" strokeWidth={1.8} />
              )}
            </div>
            <p className="text-gray-700 leading-relaxed text-base">
              {selected.description}
            </p>
          </div>

          {/* المثال الحي */}
          <div
            className="bg-white p-5 rounded-xl shadow-inner border border-yellow-100 transition-all duration-300 ease-in-out"
            dangerouslySetInnerHTML={{ __html: selected.example }}
          />
        </>
      )}
    </div>
  );
}

function LabelsDemo({ labelData }) {
  if (!labelData) return null;

  return (
    <div className="bg-gradient-to-br from-[#FFFBEA] to-[#FFF3C4] border border-yellow-300 rounded-2xl shadow-md p-6">
      

      {/* 📝 الوصف */}
      <p className="text-gray-700 leading-relaxed mb-4">{labelData.content}</p>

      {/* 💻 الكود */}
      <div className="bg-[#FFF9C4] border border-yellow-200 p-4 rounded-lg overflow-x-auto text-sm text-gray-800 font-mono mb-5">
        <code>{labelData.code}</code>
      </div>

      {/* 🧠 المعاينة التفاعلية */}
      <div className="bg-white p-6 rounded-xl shadow-inner border border-yellow-100 flex flex-col gap-3 items-start transition-all duration-300 hover:shadow-md">
        <label
          htmlFor="email"
          className="font-semibold text-[#5D4037] flex items-center gap-2"
        >
          <span className="text-yellow-600 text-xl">🏷️</span> Email:
        </label>

        <input
          id="email"
          type="email"
          placeholder="Enter your email..."
          className="border border-yellow-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-yellow-400 outline-none transition-all duration-200"
        />

        <p className="text-sm text-gray-600 mt-2 italic">
          🔗 When you click on <b>“Email”</b>, the input below gets focused —
          that’s how <code>for="email"</code> and <code>id="email"</code> work
          together.
        </p>
      </div>
    </div>
  );
}

function GroupingInputsDemo({ section }) {
  if (!section) return null;

  return (
    <div className="bg-gradient-to-br from-[#FFFBEA] to-[#FFF3C4] border border-yellow-300 rounded-2xl shadow-md p-6">
      

      <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>

      <div className="bg-[#FFF9C4] border border-yellow-200 p-4 rounded-lg overflow-x-auto text-sm text-gray-800 font-mono mb-6">
        <code>{section.code}</code>
      </div>

      {/* 🔹 التفاعل */}
      <div className="bg-white p-6 rounded-xl shadow-inner border border-yellow-100">
        <fieldset className="border-2 border-yellow-300 rounded-xl p-5 hover:shadow-lg transition">
          <legend className="px-3 py-1 bg-yellow-200 text-[#5D4037] font-semibold rounded-md shadow-sm">
            Personal Info
          </legend>

          <div className="flex flex-col gap-3 mt-3">
            <input
              type="text"
              placeholder="Enter your name"
              className="border border-yellow-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-yellow-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Submit
          </button>
        </fieldset>

        <p className="mt-3 text-sm text-gray-600 italic">
          🧩 The <b>&lt;fieldset&gt;</b> groups related inputs together and
          improves form structure. The <b>&lt;legend&gt;</b> provides a title
          for that group.
        </p>
      </div>
    </div>
  );
}

function FormValidationDemo({ section }) {
  if (!section) return null;

  return (
    <div className="bg-gradient-to-br from-[#FFFBEA] to-[#FFF3C4] border border-yellow-300 rounded-2xl shadow-md p-6">
      {/* 🟠 العنوان */}
      <h3 className="text-xl font-bold text-[#5D4037] mb-3">{section.heading}</h3>

      {/* ✍️ الشرح */}
      <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>

      {/* 💻 الكود */}
      <div className="bg-[#FFF9C4] border border-yellow-200 p-4 rounded-lg overflow-x-auto text-sm text-gray-800 font-mono mb-6">
        <code>{section.code}</code>
      </div>

      {/* 🧠 المعاينة التفاعلية */}
      <div className="bg-white p-6 rounded-xl shadow-inner border border-yellow-100">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="font-semibold text-[#5D4037]">Email:</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="border border-yellow-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />
          </div>

          <div>
            <label className="font-semibold text-[#5D4037]">Age (1–10):</label>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Enter a number"
              required
              className="border border-yellow-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-semibold"
          >
            Submit
          </button>
        </form>

        <p className="mt-3 text-sm text-gray-600 italic">
          🧩 Try submitting the form without filling in the fields — the browser
          will show validation messages automatically using HTML attributes like{" "}
          <b>required</b>, <b>min</b>, and <b>max</b>.
        </p>
      </div>
    </div>
  );
}
// 🔹 Function to clean AI output and extract only HTML tags
function cleanHTML(text) {
  if (!text) return "";
  const match = text.match(/<form[\s\S]*<\/form>|<input[\s\S]*?>/i);
  return match ? match[0] : text; // يرجّع فقط الكود HTML بدون الشرح
}


  return (
  <div className="min-h-screen bg-gradient-to-br from-[#FFFDE7] via-[#FFF8E1] to-[#FFF3E0] text-gray-800 font-sans flex">

     {/* 🔹 الشريط الجانبي للأقسام */}
    <aside className="w-64 bg-gradient-to-b from-[#FFFDF2] to-[#FFF9E6] border-r border-yellow-200 shadow-md rounded-r-2xl p-6 sticky top-0 h-screen overflow-y-auto">
      <h2 className="text-lg font-extrabold text-[#5D4037] mb-6 border-b border-yellow-300 pb-2 flex items-center gap-2">
        📘 Lesson Sections
      </h2>
      <ul className="space-y-3">
        {lesson.sections?.map((sec, i) => (
          <li
            key={i}
            onClick={() => {
              const el = document.getElementById(`section-${i}`);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="cursor-pointer text-[#6A1B9A] hover:text-[#4A148C] bg-white hover:bg-yellow-50 border border-yellow-200 rounded-lg p-2 transition-all duration-300"
          >
            {sec.heading}
          </li>
        ))}
      </ul>

      <button
        onClick={() => navigate("/lessons")}
        className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-[#4A148C] font-semibold py-2 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2"
      >
        ⬅️ Back to Lessons
      </button>
    </aside>

      <div className="max-w-4xl mx-auto">
        {/* 🟡 عنوان الدرس */}
        <h1 className="text-4xl font-extrabold text-center text-[#795548] drop-shadow-sm mb-3">
          Lesson 5 - Forms & Inputs
        </h1>
        <p className="text-center text-gray-600 mb-10 text-lg italic">
          {lesson.description}
        </p>

        {/* 🔹 عرض الأقسام */}
        <div className="space-y-8">
          {Array.isArray(lesson?.sections) &&
          
  lesson.sections.map((sec, i) => (
    
           <div
  key={i}
   id={`section-${i}`}
  className="bg-white/90 backdrop-blur-sm border-l-8 border-yellow-400 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
>
  <h2 className="text-2xl font-bold text-[#8D6E63] mb-3">
    {sec.heading}
  </h2>

  {/* ✅ عرض خاص لقسم الـ attributes */}
  {sec.id === "attributes" ? (
    <FormAttributesDemo attributes={sec.attributes} />
  ) : sec.id === "input-types" ? (
  <InputTypesDemo inputs={sec.inputs} />
)  :  sec.id === "labels-accessibility" ? (
  <LabelsDemo labelData={sec} />
): sec.id === "grouping-inputs" ? (
  <GroupingInputsDemo section={sec} />
)  : sec.id === "form-validation" ? (
  <FormValidationDemo section={sec} />
) :(
    <>
      {/* 🔹 المحتوى العادي لباقي الأقسام */}
      <p className="mb-4 leading-relaxed text-gray-700">{sec.content}</p>

      {/* 🔹 كود القسم (محرر تفاعلي فقط للأول) */}
      {sec.code && (
        <>
          {sec.id === "intro" ? (
            <LiveCodeEditor initialCode={sec.code} />
          ) : (
            <pre className="bg-[#FFF9C4] border border-yellow-200 p-4 rounded-lg overflow-x-auto text-sm text-gray-800">
              <code>{sec.code}</code>
            </pre>
          )}
        </>
      )}
    </>
  )}



{sec.quiz && (
  <div className="mt-8">
    <QuizLesson5
        lessonId={31}
      quizData={{
        questions: [
          {
            question: sec.quiz.question,
            options: sec.quiz.options,
            correctIndex: sec.quiz.options.indexOf(sec.quiz.answer),
            explain: `The correct answer is "${sec.quiz.answer}".`,
          },
        ],
      }}
      isFinal={i === lastQuizIndex}  // ✅ فقط آخر كويز يعرض شاشة النجاح
      onPassed={() => {
        if (!completedSections.includes(i)) {
          const updated = [...completedSections, i];
          setCompletedSections(updated);

          if (updated.length === lesson.sections.filter((s) => s.quiz).length) {
            console.log("🎉 All section quizzes completed — Lesson passed!");
            alert("🎉 You have completed all quizzes! Lesson 6 is now unlocked!");
             setNextEnabled(true); 
          }
        }
      }}
    />
  </div>
)}






 {/* 🤖 AI Assistant */}
{sec.aiPrompt && (
  <div className="mt-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300 rounded-xl p-6 shadow-md transition-all duration-300">
    <h3 className="font-bold mb-2 text-[#5D4037] text-lg flex items-center gap-2">
      🤖 AI Form Assistant
    </h3>

    <p className="text-gray-700 text-sm mb-3">
      Type any input type (like <code>email</code>, <code>password</code>, or <code>date</code>) and watch AI generate a working HTML example.
    </p>

    {/* 🔹 Input + Button */}
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <input
        value={aiQuestion}
        onChange={(e) => setAiQuestion(e.target.value)}
        placeholder="Try typing 'email' or 'date'..."
        className="border border-yellow-400 rounded-lg p-2 flex-1 focus:ring-2 focus:ring-yellow-400 outline-none transition"
      />
      <button
        onClick={handleAiAsk}
        disabled={aiLoading}
        className={`${
          aiLoading
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-600"
        } text-white px-5 py-2 rounded-lg font-semibold shadow-md transition`}
      >
        {aiLoading ? "Thinking..." : "Ask AI"}
      </button>
    </div>

    {/* ⏳ Loader */}
    {aiLoading && (
      <div className="flex items-center gap-3 mt-4 text-yellow-700 animate-pulse">
        <div className="w-6 h-6 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-medium">AI is generating your example...</span>
      </div>
    )}

    {/* 💬 Clean AI Result */}
    {aiAnswer && !aiLoading && (
      <div className="mt-6 grid sm:grid-cols-2 gap-6 transition-all duration-500">
        {/* 💻 Code display */}
        <div className="bg-[#FFFBEA] border border-yellow-200 rounded-xl p-4 font-mono text-sm text-gray-800 shadow-inner overflow-x-auto">
          <h4 className="font-bold text-[#5D4037] mb-2">💻 Generated HTML</h4>
          <pre>{cleanHTML(aiAnswer)}</pre>
        </div>

        {/* 🧩 Live preview */}
        <div
          className="bg-white border border-yellow-200 rounded-xl p-6 shadow-inner flex justify-center items-center"
          dangerouslySetInnerHTML={{ __html: cleanHTML(aiAnswer) }}
        />
      </div>
    )}
  </div>
)}





              {/* 🌤 API Weather Demo */}
              {sec.apiDemo && (
                <div className="mt-6 bg-gradient-to-r from-[#E3F2FD] to-[#FFF8E1] border border-blue-200 rounded-xl p-5">
                  <h3 className="font-bold mb-3 text-[#01579B] text-lg">
                    🌤 Form Connected to Weather API
                  </h3>
                  <WeatherForm onSubmit={handleWeather} />
                  {weather && (
                    <div className="mt-3 bg-white border rounded-lg p-3 text-gray-700">
                      {weather.error ? (
                        <p className="text-red-500">{weather.error}</p>
                      ) : (
                        <>
                          <p>🌆 City: {weather.city}</p>
                          <p>🌤 {weather.description}</p>
                          <p>🌡 Temperature: {weather.temperature} °C</p>
                          <p>💧 Humidity: {weather.humidity}%</p>
                          <p>💨 Wind: {weather.wind_speed} m/s</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

             {/* 💻 Mini Project */}
{sec.aiReview && (
  <div className="mt-6 bg-gradient-to-r from-[#F3E5F5] to-[#FFFDE7] border border-purple-200 rounded-xl p-5 shadow-md transition-all duration-300">
    <h3 className="font-bold mb-3 text-[#6A1B9A] text-lg flex items-center gap-2">
      💻 Mini Project: Registration Form
    </h3>
    <p className="text-sm mb-4">{sec.task}</p>

    {/* 🔹 Editor + Preview جنب بعض */}
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ✍️ Code Editor */}
      <div className="flex-1">
        <h4 className="font-semibold text-[#6A1B9A] mb-2">🧠 Write your HTML</h4>
        <textarea
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          placeholder="Write your HTML code here..."
          className="border border-purple-300 rounded-lg p-3 w-full h-64 font-mono text-sm focus:ring-2 focus:ring-purple-400 outline-none transition"
        />
      </div>

      {/* 🌟 Live Preview */}
      <div className="flex-1 bg-white border border-purple-200 rounded-xl p-4 shadow-inner">
        <h4 className="font-semibold text-[#6A1B9A] mb-2 flex items-center gap-2">
          🌿 Live Preview
        </h4>
        {userCode.trim() ? (
          <div
            className="p-3 border border-purple-100 rounded-lg"
            dangerouslySetInnerHTML={{ __html: userCode }}
          />
        ) : (
          <p className="text-gray-500 italic text-center">
            Your preview will appear here...
          </p>
        )}
      </div>
    </div>

    {/* 🔘 Review Button */}
    <div className="mt-5 flex items-center gap-3">
      <button
        onClick={handleAiReview}
        disabled={aiLoading}
        className={`px-5 py-2 rounded-lg font-semibold text-white transition ${
          aiLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-purple-500 hover:bg-purple-600 shadow-md"
        }`}
      >
        {aiLoading ? "Analyzing..." : "Review with AI"}
      </button>

      {/* ⏳ Loader أثناء التحليل */}
      {aiLoading && (
        <div className="flex items-center gap-2 text-purple-700 animate-pulse">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span>AI is reviewing your code...</span>
        </div>
      )}
    </div>
{/* 🔹 أزرار التنقل بين الدروس */}
<div className="flex justify-between items-center mt-16 border-t border-yellow-200 pt-6">
  {/* ⬅️ زر العودة للدرس السابق */}
  <button
   onClick={() => navigate("/lesson-viewer/4")}

    className="bg-yellow-300 hover:bg-yellow-400 text-[#5D4037] font-semibold px-6 py-2 rounded-lg shadow transition"
  >
    ⬅️ Previous Lesson
  </button>

  {/* ➡️ زر الدرس التالي */}
  <button
    onClick={() => navigate("/lesson-viewer/32")}

    disabled={!nextEnabled}
    className={`px-6 py-2 rounded-lg font-semibold shadow transition ${
      nextEnabled
        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
        : "bg-gray-300 text-gray-600 cursor-not-allowed"
    }`}
  >
    Next Lesson ➡️
  </button>
</div>
    {/* 🧠 AI Feedback */}
    {aiReview && !aiLoading && (
      <div className="mt-4 bg-white border rounded-lg p-4 text-gray-800 whitespace-pre-line transition-all duration-300 ease-in-out">
        <h4 className="font-bold text-[#6A1B9A] mb-2">💬 AI Feedback:</h4>
        {aiReview}
      </div>
    )}
  </div>
)}


            </div>
          ))}
        </div>
      </div>
    </div>
    
  );
  
}

// 🌦 WeatherForm Component
function WeatherForm({ onSubmit }) {
  const [city, setCity] = useState("");
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter a city..."
        className="border border-blue-300 rounded-lg p-2 flex-1"
      />
      <button
        onClick={() => onSubmit(city)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
      >
        Get Weather
      </button>
    </div>
  );
}
