// File: src/components/CSSPlatform.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import CSSSidebar from "./CSSSidebar";
import CSSLessonViewer from "./CSSLessonViewer";
import { useNavigate } from "react-router-dom";
import CSSAiAssistant from "./CSSAiAssistant"; // ✅ أضيفي الاستيراد بالأعلى


const API = "http://localhost:5000";

export default function CSSPlatform() {
  const [lessons, setLessons] = useState([]);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // ✅ تحميل قائمة الدروس
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/css-lessons`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons(res.data);
        if (res.data.length > 0) {
          setCurrentLessonId(res.data[0].id);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error("❌ Error fetching lessons:", err);
      }
    };

    fetchLessons();
  }, []);

  // ✅ عند اختيار درس من القائمة
  const handleSelectLesson = (id, index) => {
    setCurrentLessonId(id);
    setCurrentIndex(index);
  };

  // ✅ التالي والسابق
  const handleNext = () => {
    if (currentIndex < lessons.length - 1) {
      const next = lessons[currentIndex + 1];
      setCurrentLessonId(next.id);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = lessons[currentIndex - 1];
      setCurrentLessonId(prev.id);
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-white relative">
      {/* 🔙 زر العودة */}
      <button
        onClick={() => navigate("/lessons")}
        className="absolute top-10 right-5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg shadow-md text-sm transition-all duration-200"
      >
        ← Back
      </button>

      {/* 🟨 الشريط الجانبي */}
      <CSSSidebar
        lessons={lessons}
        currentLessonId={currentLessonId}
        onSelect={handleSelectLesson}
      />

      {/* 🧠 عرض الدرس */}
      <div className="flex-1 p-8 overflow-y-auto">
        {currentLessonId ? (
          <CSSLessonViewer
            lessonId={currentLessonId}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={currentIndex < lessons.length - 1}
            hasPrev={currentIndex > 0}
          />
        ) : (
          <p className="text-center mt-10 text-gray-600">
            Select a lesson to start learning CSS 🎨
          </p>
        )}
      </div>
      {/* 🧠 AI Assistant for Smart CSS Help */}
<CSSAiAssistant onLessonSelect={(lessonId) => setCurrentLessonId(lessonId)} />

    </div>
  );
}
