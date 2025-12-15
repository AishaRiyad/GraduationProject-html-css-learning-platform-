import React, { useEffect, useState , useRef } from "react";
import axios from "axios";
import Quiz from "../../components/StudentComponents/Quiz";
import { useParams } from "react-router-dom";


export default function LessonViewer6() {
  const [lesson, setLesson] = useState(null);
  const [ttsText, setTtsText] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
const [previewSrc, setPreviewSrc] = useState("");
const [previewError, setPreviewError] = useState("");
const [rounded, setRounded] = useState(true);
const [borderVisible, setBorderVisible] = useState(true);
const [grayscale, setGrayscale] = useState(false);
// 🎧 إعدادات الصوت
const [autoplay, setAutoplay] = useState(false);
const [loop, setLoop] = useState(false);
const [muted, setMuted] = useState(false);
const audioRef = useRef(null);
const [videoSrc, setVideoSrc] = useState("https://www.w3schools.com/html/mov_bbb.mp4");
const [videoAutoplay, setVideoAutoplay] = useState(false);
const [videoLoop, setVideoLoop] = useState(false);
const [videoMuted, setVideoMuted] = useState(false);
const [videoControls, setVideoControls] = useState(true);
const [iframeType, setIframeType] = useState("youtube");
const [iframeUrl, setIframeUrl] = useState("https://www.youtube.com/embed/pQN-pnXPaVg");
const [showIframe, setShowIframe] = useState(false);

// 🧠 حالات الكويز
const [quizCompleted, setQuizCompleted] = useState(false);
const [passed, setPassed] = useState(false);

useEffect(() => {
  if (audioRef.current) {
    audioRef.current.autoplay = autoplay;
    audioRef.current.loop = loop;
    audioRef.current.muted = muted;

    // لتطبيق الإعداد فورًا:
    if (autoplay) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }
}, [autoplay, loop, muted]);

const handlePreview = () => {
  if (!imageUrl.trim()) {
    setPreviewSrc("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400");
    setPreviewError("");
    return;
  }

  // تجربة الرابط
  const img = new Image();
  img.onload = () => {
    setPreviewSrc(imageUrl);
    setPreviewError("");
  };
  img.onerror = () => {
    setPreviewError("❌ Invalid image URL. Try another one.");
    setPreviewSrc("");
  };
  img.src = imageUrl;
};

const API = "http://localhost:5000";
  const { lessonId } = useParams();
  // ✅ جلب ملف JSON من المجلد العام
 useEffect(() => {
  const fetchLesson = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/api/lessons/content/32`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLesson(res.data.content);
    } catch (e) {
      console.error("❌ Failed to load lesson 6", e);
    } finally {
      setLoading(false);
    }
  };
  fetchLesson();
}, [lessonId]);


  // ✅ تحويل النص إلى صوت
  const generateSpeech = async () => {
    if (!ttsText.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai-local/text-to-speech", {
        text: ttsText,
        asBase64: true,
      });

      const base64 = res.data.audioBase64;
      setAudioSrc(`data:audio/mpeg;base64,${base64}`);
    } catch (err) {
      console.error("❌ TTS Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!lesson)
    return (
      <div className="text-center text-gray-500 p-10">Loading lesson...</div>
    );

  const quizSection = lesson.sections.find((s) => s.id === "quiz");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFBEA] to-[#FFF3C4] p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
       
      
        {/* 🎬 Intro Video Section */}
<section id="section-intro" className="relative mb-12 rounded-3xl overflow-hidden shadow-lg">
  {/* 🎥 الفيديو الخلفي */}
  <video
    className="w-full h-[550px] object-cover brightness-75"
    src="/videos/multimedia-intro.mp4"
    autoPlay
    loop
    muted
    playsInline
  ></video>

  {/* 🟤 طبقة شفافة لتوضيح النص */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#000000b3] via-[#00000080] to-transparent"></div>

  {/* 🧾 النص فوق الفيديو */}
  <div className="absolute inset-0 flex flex-col justify-center items-start px-14 text-white drop-shadow-xl">
    <h1 className="text-5xl font-extrabold mb-4 flex items-center gap-3">
      <span>🎬</span> {lesson.title}
    </h1>
    <p className="max-w-3xl text-lg leading-relaxed font-medium">
      {lesson.description}
    </p>
  </div>
</section>



     {lesson.sections.map((sec, i) => (
  <section id={`section-${i}`} key={i} className="mb-10">
    {/* ✅ تصميم خاص للمقدمة */}
    {sec.id === "intro" ? (
      <div className="relative bg-gradient-to-r from-[#FFF9C4] via-[#FFF3E0] to-[#F3E5F5] rounded-3xl shadow-md p-8 border border-yellow-200 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/80 p-3 rounded-2xl shadow-sm">
            <span className="text-4xl">📚</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#6A1B9A] drop-shadow-sm">
            {sec.heading}
          </h2>
        </div>
        <p className="text-gray-700 leading-relaxed text-lg">{sec.content}</p>
        <div className="absolute -bottom-3 right-6 text-yellow-400/70 text-6xl font-bold select-none pointer-events-none">
          • • •
        </div>
      </div>
    ) : sec.id === "images" ? (
  <div className="bg-gradient-to-b from-[#FFF9C4] to-[#F3E5F5] p-10 rounded-3xl shadow-xl border border-yellow-200 transition-all duration-300 hover:shadow-2xl">
    <h2 className="text-3xl font-extrabold text-[#6A1B9A] mb-6 flex items-center gap-3">
      🖼️ {sec.heading}
    </h2>

    <p className="text-gray-700 leading-relaxed mb-6 text-lg">{sec.content}</p>

    {/* 🧾 كود الشرح الأساسي */}
    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-6 text-[#4A148C]">
      {sec.code}
    </pre>

    {/* 🎨 واجهة التفاعل والصورة */}
    <div className="bg-white p-8 rounded-3xl border border-yellow-100 shadow-inner flex flex-col items-center">
      <h3 className="font-bold text-lg text-[#4A148C] mb-3 flex items-center gap-2">
        <span>🧠</span> Try it Yourself!
      </h3>

      {/* 🔹 إدخال الرابط */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6 w-full justify-center">
        <input
          type="text"
          placeholder="Enter image URL or leave empty for default"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full md:w-2/3 border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-yellow-400"
        />
        <button
          onClick={handlePreview}
          className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-xl font-semibold transition"
        >
          Show Image
        </button>
      </div>

      {/* 🔹 عرض الصورة */}
      {previewError ? (
        <p className="text-red-600 font-semibold">{previewError}</p>
      ) : previewSrc ? (
        <>
          <h4 className="font-semibold text-[#6A1B9A] mb-2">📷 Preview</h4>
          <img
            src={previewSrc}
            alt="Preview"
            className={`border-4 transition-all duration-500 w-[420px] h-[260px] object-cover ${
              rounded ? "rounded-3xl" : "rounded-md"
            } ${borderVisible ? "border-yellow-400" : "border-transparent"} ${
              grayscale ? "grayscale" : ""
            }`}
          />

          {/* 🎚️ الأزرار */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button
              onClick={() => setRounded(!rounded)}
              className="bg-purple-100 hover:bg-purple-200 text-[#6A1B9A] px-4 py-2 rounded-lg shadow-sm font-medium"
            >
              {rounded ? "🔳 Square" : "🔘 Rounded"}
            </button>
            <button
              onClick={() => setBorderVisible(!borderVisible)}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg shadow-sm font-medium"
            >
              {borderVisible ? "❌ Hide Border" : "🟨 Show Border"}
            </button>
            <button
              onClick={() => setGrayscale(!grayscale)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm font-medium"
            >
              {grayscale ? "🌈 Normal" : "⚫ Grayscale"}
            </button>
          </div>

          {/* 💻 عرض الكود أسفل الصورة */}
          <div className="w-full mt-8 bg-[#FFFCF2] border border-yellow-200 rounded-2xl p-6 shadow-lg font-mono text-sm text-gray-800">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-[#6A1B9A] flex items-center gap-2">
                <span>💻</span> Live HTML Code
              </h4>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    (() => {
                      const style = [
                        rounded ? "border-radius:20px;" : "",
                        borderVisible ? "border:4px solid #FACC15;" : "",
                        grayscale ? "filter:grayscale(100%);" : "",
                        "width:400px;",
                        "height:250px;",
                        "object-fit:cover;",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      return `<img src="${previewSrc}" alt="Preview Image"${
                        style ? ` style="${style}"` : ""
                      } />`;
                    })()
                  );
                  alert("✅ HTML code copied!");
                }}
                className="text-xs bg-[#6A1B9A] hover:bg-[#4A148C] text-white px-3 py-1 rounded-md transition"
              >
                Copy
              </button>
            </div>

            <code className="block whitespace-pre-wrap leading-relaxed text-[#4A148C]">
              {(() => {
                const style = [
                  rounded ? "border-radius:20px;" : "",
                  borderVisible ? "border:4px solid #FACC15;" : "",
                  grayscale ? "filter:grayscale(100%);" : "",
                  "width:400px;",
                  "height:250px;",
                  "object-fit:cover;",
                ]
                  .filter(Boolean)
                  .join(" ");
                return `<img src="${previewSrc}" alt="Preview Image"${
                  style ? ` style="${style}"` : ""
                } />`;
              })()}
            </code>
          </div>
        </>
      ) : null}
    </div>
  </div>
) 

    : sec.id === "audio" ? (
  <div className="bg-gradient-to-br from-[#E8F5E9] to-[#FFFDE7] p-10 rounded-3xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300">
    <h2 className="text-3xl font-extrabold text-[#2E7D32] mb-4 flex items-center gap-3">
      🎧 {sec.heading}
    </h2>
    <p className="text-gray-700 leading-relaxed mb-6 text-lg">
      To include sound in your website, you can use the{" "}
      <code>&lt;audio&gt;</code> tag. Try enabling features like{" "}
      <strong>autoplay</strong>, <strong>loop</strong>, or{" "}
      <strong>muted</strong> to see how the audio behavior changes below.
    </p>

    {/* 🎶 واجهة التفاعل */}
    <div className="bg-white p-8 rounded-2xl shadow-inner border border-green-100 flex flex-col items-center">
      <h3 className="text-[#2E7D32] font-bold mb-3 text-lg flex items-center gap-2">
        🧠 Try it Yourself!
      </h3>

      {/* 🎚️ خيارات التحكم */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoplay}
            onChange={() => setAutoplay(!autoplay)}
            className="accent-green-600 w-4 h-4"
          />
          Autoplay
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={loop}
            onChange={() => setLoop(!loop)}
            className="accent-green-600 w-4 h-4"
          />
          Loop
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={muted}
            onChange={() => setMuted(!muted)}
            className="accent-green-600 w-4 h-4"
          />
          Muted
        </label>
      </div>

      {/* 🎵 مشغل الصوت */}
      <div className="bg-[#F1F8E9] p-4 rounded-xl border border-green-200 shadow-sm w-full max-w-md text-center">
        <audio
          ref={audioRef}
          controls
          className="w-full rounded-lg"
        >
          <source
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            type="audio/mpeg"
          />
          <source src="song.ogg" type="audio/ogg" />
          Your browser does not support the audio tag.
        </audio>
      </div>

      {/* 💻 كود HTML مباشر */}
      <div className="mt-8 w-full bg-[#F9FFF6] border border-green-200 rounded-2xl p-6 font-mono text-sm text-gray-800 shadow-inner">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-[#2E7D32] flex items-center gap-2">
            <span>💻</span> Live HTML Code
          </h4>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `<audio controls${autoplay ? " autoplay" : ""}${loop ? " loop" : ""}${muted ? " muted" : ""}>
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
  <source src="song.ogg" type="audio/ogg">
  Your browser does not support the audio tag.
</audio>`
              );
              alert("✅ HTML code copied!");
            }}
            className="text-xs bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3 py-1 rounded-md transition"
          >
            Copy
          </button>
        </div>

        <code className="block whitespace-pre-wrap text-[#33691E] leading-relaxed">
{`<audio controls${autoplay ? " autoplay" : ""}${loop ? " loop" : ""}${muted ? " muted" : ""}>
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
  <source src="song.ogg" type="audio/ogg">
  Your browser does not support the audio tag.
</audio>`}
        </code>
      </div>
    </div>
  </div>
) : sec.id === "video" ? (
  <div className="bg-gradient-to-br from-[#FFF8E1] to-[#FFF3E0] p-10 rounded-3xl shadow-xl border border-yellow-300 hover:shadow-2xl transition-all duration-300">
    <h2 className="text-3xl font-extrabold text-[#E65100] mb-4 flex items-center gap-3">
      🎥 {sec.heading}
    </h2>
    <p className="text-gray-700 leading-relaxed mb-6 text-lg">{sec.content}</p>

    {/* 🎨 واجهة تفاعل الفيديو */}
    <div className="bg-white p-8 rounded-2xl shadow-inner border border-yellow-100 flex flex-col items-center">
      <h3 className="text-[#E65100] font-bold mb-3 text-lg flex items-center gap-2">
        🧠 Try it Yourself!
      </h3>

      {/* ⚙️ اختيارات التحكم */}
      <div className="flex flex-wrap justify-center gap-4 mb-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={videoControls}
            onChange={() => setVideoControls(!videoControls)}
            className="accent-orange-600 w-4 h-4"
          />
          Controls
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={videoAutoplay}
            onChange={() => setVideoAutoplay(!videoAutoplay)}
            className="accent-orange-600 w-4 h-4"
          />
          Autoplay
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={videoLoop}
            onChange={() => setVideoLoop(!videoLoop)}
            className="accent-orange-600 w-4 h-4"
          />
          Loop
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={videoMuted}
            onChange={() => setVideoMuted(!videoMuted)}
            className="accent-orange-600 w-4 h-4"
          />
          Muted
        </label>
      </div>

      {/* 🎬 اختيار الفيديو */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setVideoSrc("https://www.w3schools.com/html/mov_bbb.mp4")}
          className={`px-4 py-2 rounded-lg font-medium ${
            videoSrc.includes("bbb")
              ? "bg-orange-500 text-white"
              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
          }`}
        >
          Sample 1
        </button>
        <button
          onClick={() =>
            setVideoSrc("https://www.w3schools.com/html/movie.mp4")
          }
          className={`px-4 py-2 rounded-lg font-medium ${
            videoSrc.includes("movie")
              ? "bg-orange-500 text-white"
              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
          }`}
        >
          Sample 2
        </button>
        <button
          onClick={() => setVideoSrc("https://filesamples.com/samples/video/mp4/sample_640x360.mp4")}
          className={`px-4 py-2 rounded-lg font-medium ${
            videoSrc.includes("sample_640")
              ? "bg-orange-500 text-white"
              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
          }`}
        >
          Sample 3
        </button>
      </div>

      {/* 🎥 مشغل الفيديو */}
      <video
        key={`${videoSrc}-${videoAutoplay}-${videoLoop}-${videoMuted}-${videoControls}`}
        width="400"
        poster="https://via.placeholder.com/400x250?text=Video+Preview"
        src={videoSrc}
        autoPlay={videoAutoplay}
        loop={videoLoop}
        muted={videoMuted}
        controls={videoControls}
        className="rounded-2xl shadow-lg border border-yellow-200"
      >
        Your browser does not support the video tag.
      </video>

      {/* 💻 الكود التفاعلي */}
      <div className="mt-8 w-full bg-[#FFFBEA] border border-yellow-200 rounded-2xl p-6 font-mono text-sm text-gray-800 shadow-inner">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-[#E65100] flex items-center gap-2">
            💻 Live HTML Code
          </h4>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `<video width="400"${videoControls ? " controls" : ""}${
                  videoAutoplay ? " autoplay" : ""
                }${videoLoop ? " loop" : ""}${videoMuted ? " muted" : ""} poster="preview.jpg">
  <source src="${videoSrc}" type="video/mp4">
  Your browser does not support the video tag.
</video>`
              );
              alert("✅ HTML code copied!");
            }}
            className="text-xs bg-[#E65100] hover:bg-[#BF360C] text-white px-3 py-1 rounded-md transition"
          >
            Copy
          </button>
        </div>

        <code className="block whitespace-pre-wrap text-[#4E342E] leading-relaxed">
{`<video width="400"${videoControls ? " controls" : ""}${videoAutoplay ? " autoplay" : ""}${videoLoop ? " loop" : ""}${videoMuted ? " muted" : ""} poster="preview.jpg">
  <source src="${videoSrc}" type="video/mp4">
  Your browser does not support the video tag.
</video>`}
        </code>
      </div>
    </div>
  </div>
) : sec.id === "iframe" ? (
  <div className="bg-gradient-to-br from-[#E3F2FD] to-[#E8F5E9] p-10 rounded-3xl shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300">
    <h2 className="text-3xl font-extrabold text-[#1565C0] mb-4 flex items-center gap-3">
      🌐 {sec.heading}
    </h2>
    <p className="text-gray-700 leading-relaxed mb-6 text-lg">{sec.content}</p>

    {/* 🎯 واجهة التفاعل */}
    <div className="bg-white p-8 rounded-2xl shadow-inner border border-blue-100 flex flex-col items-center">
      <h3 className="text-[#1565C0] font-bold mb-4 text-lg flex items-center gap-2">
        🧠 Try it Yourself!
      </h3>

      {/* 🧩 اختيار النوع */}
      <div className="flex flex-wrap justify-center gap-4 mb-5">
        <button
          onClick={() => {
            setIframeType("youtube");
            setIframeUrl("https://www.youtube.com/embed/pQN-pnXPaVg");
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            iframeType === "youtube"
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          YouTube
        </button>
        <button
          onClick={() => {
            setIframeType("maps");
            setIframeUrl(
              "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.238276147896!2d-122.08560852436184!3d37.42206513552125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb0bffcb20363%3A0x84e3ebd2fbc0e94!2sGoogleplex!5e0!3m2!1sen!2sus!4v1700000000000"
            );
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            iframeType === "maps"
              ? "bg-green-500 text-white"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          Google Maps
        </button>
        <button
          onClick={() => {
            setIframeType("spotify");
            setIframeUrl(
              "https://open.spotify.com/embed/track/7GhIk7Il098yCjg4BQjzvb"
            );
          }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            iframeType === "spotify"
              ? "bg-purple-500 text-white"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          }`}
        >
          Spotify
        </button>
      </div>

      {/* ✏️ إدخال الرابط */}
      <div className="flex flex-col md:flex-row gap-4 items-center w-full max-w-2xl mb-6">
        <input
          type="text"
          placeholder="Enter embed URL..."
          value={iframeUrl}
          onChange={(e) => setIframeUrl(e.target.value)}
          className="w-full border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => setShowIframe(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition"
        >
          Embed
        </button>
      </div>

      {/* 🪟 عرض المحتوى */}
      {showIframe && (
        <div className="w-full flex justify-center mt-4">
          <iframe
            width="560"
            height="315"
            src={iframeUrl}
            title={`${iframeType} embed`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-xl shadow-lg border border-blue-200"
          ></iframe>
        </div>
      )}

      {/* 💻 الكود */}
      {showIframe && (
        <div className="mt-8 w-full bg-[#F0F8FF] border border-blue-200 rounded-2xl p-6 font-mono text-sm text-gray-800 shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-[#1565C0] flex items-center gap-2">
              💻 Live HTML Code
            </h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `<iframe width="560" height="315" src="${iframeUrl}" title="${iframeType} embed" frameborder="0" allowfullscreen></iframe>`
                );
                alert("✅ HTML code copied!");
              }}
              className="text-xs bg-[#1565C0] hover:bg-[#0D47A1] text-white px-3 py-1 rounded-md transition"
            >
              Copy
            </button>
          </div>

          <code className="block whitespace-pre-wrap text-[#1A237E] leading-relaxed">
{`<iframe width="560" height="315" src="${iframeUrl}" title="${iframeType} embed" frameborder="0" allowfullscreen></iframe>`}
          </code>
        </div>
      )}
    </div>
  </div>
) : sec.id === "ai-tts" ? (
      // ✅ قسم الذكاء الاصطناعي (Text to Speech)
      <div className="bg-gradient-to-r from-yellow-50 to-purple-50 border border-yellow-200 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-[#6A1B9A] mb-3">
          {sec.heading}
        </h2>
        <p className="text-gray-600 mb-3">{sec.task}</p>
        <textarea
          className="w-full border rounded-lg p-3 mb-3"
          rows={3}
          placeholder={sec.aiExample}
          value={ttsText}
          onChange={(e) => setTtsText(e.target.value)}
        ></textarea>
        <button
          onClick={generateSpeech}
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-5 py-2 rounded-lg transition"
        >
          {loading ? "Generating..." : "Convert to Speech"}
        </button>
        {audioSrc && (
          <div className="mt-4">
            <audio controls src={audioSrc} />
          </div>
        )}
      </div>
    ) : (
      // ✅ باقي الأقسام العادية
      <>
        <h2 className="text-2xl font-bold text-[#4A148C] mb-3">{sec.heading}</h2>
        {sec.content && <p className="text-gray-600 mb-3">{sec.content}</p>}
        {sec.code && (
          <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto mb-3">
            {sec.code}
          </pre>
        )}
      </>
    )}
  </section>
))}

{/* 🔙 زر الرجوع إلى صفحة الدروس (أعلى اليمين) */}
<div className="fixed top-20 right-6 z-50">
  <button
    onClick={() => (window.location.href = "http://localhost:3000/lessons")}
    className="flex items-center gap-2 bg-[#FFF9C4] hover:bg-[#FFEB3B] text-[#6A1B9A] font-bold px-5 py-2 rounded-full shadow-lg transition-all duration-300"
  >
    <span>🏫</span>
    Back to Lessons
  </button>
</div>
{/* 🌟 الشريط الجانبي للأقسام */}
<aside className="fixed top-24 left-6 w-56 bg-gradient-to-b from-[#FFFBEA] to-[#FFF3C4] border border-yellow-200 rounded-2xl shadow-md p-5 h-[80vh] overflow-y-auto">
  <h2 className="text-lg font-extrabold text-[#6A1B9A] mb-4 flex items-center gap-2">
    📘 Sections
  </h2>

  <ul className="space-y-3 text-[#4A148C] font-medium">
    <li
    onClick={() => {
      const el = document.getElementById("section-intro");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }}
    className="cursor-pointer bg-white/60 hover:bg-yellow-100 px-4 py-2 rounded-xl"
  >   Multimedia Element</li>
    {lesson.sections?.map((sec, i) => (
      <li
        key={sec.id || i}
        onClick={() => {
          const el = document.getElementById(`section-${i}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
        className="cursor-pointer bg-white/60 hover:bg-yellow-100 px-4 py-2 rounded-xl shadow-sm transition-all duration-200 border border-transparent hover:border-yellow-300"
      >
        {sec.heading}
      </li>
    ))}
  </ul>
</aside>


        {/* 🧠 Quiz Section */}
        {quizSection && Array.isArray(quizSection.quiz) && (
          <section id="quizSection " className="mb-8">
            
            <Quiz
              lessonId={32}
              questions={quizSection.quiz}
              totalQuestions={quizSection.quiz.length}
             onPassed={() => {
  setQuizCompleted(true);
  setPassed(true);
}}
onFailed={() => {
  setQuizCompleted(true);
  setPassed(false);
}}

            />
          </section>
          
        )}{quizCompleted && (
  <div className="flex justify-center gap-6 mt-10">
    {/* 🔙 زر Previous */}
    <button
      onClick={() => (window.location.href = "http://localhost:3000/lesson-viewer/31")}
      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
    >
      ⬅️ Previous Lesson
    </button>

    {/* 🔜 زر Next (يُفعّل فقط عند النجاح) */}
    <button
      onClick={() => {
        if (passed) {
          window.location.href = "http://localhost:3000/lesson-viewer/33";
        }
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
    </div>
    
  );
  
}
