import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import LessonList from "../../pages/StudentPages/LessonList";
import axios from "axios";
import CSSPlatform from "./CSSPlatform";
import AdvancedQuiz from "./AdvancedQuiz";
import BuildProject from "./BuildProject";
import Quiz from "../../pages/StudentPages/Quiz";


const API = "http://localhost:5000";

export default function LevelSelector({
  hasCompletedBasic,
  onStartLevel,
  setShowLevels,
}) {
  const navigate = useNavigate();
  const [showLessons, setShowLessons] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSubLevel, setSelectedSubLevel] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [isLessonListExternal, setIsLessonListExternal] = useState(false);
const [params] = useSearchParams();
  const lastLesson = params.get("lesson");

  useEffect(() => {
    if (lastLesson) {
      console.log("Student returned to level selector from lesson:", lastLesson);
    }
  }, [lastLesson]);
  // ✅ جلب مستوى المستخدم من السيرفر
  useEffect(() => {
    const cameFromLesson = localStorage.getItem("returnFromLesson");

    if (cameFromLesson) {
      setShowLevels(false);
      localStorage.removeItem("returnFromLesson");
    }

    const fetchUserLevel = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const level = res.data.user?.level?.toLowerCase?.() || "basic";
        console.log("📊 User Level from DB:", level);
        setUserLevel(level);
      } catch (err) {
        console.error("❌ Failed to fetch user level:", err);
      }
    };

    fetchUserLevel();

    // ✅ نتحقق من وجود LessonList خارجي بعد أن تنتهي عملية الرندر الأولى
    const checkExternal = () => {
      const external = document.querySelector(".external-lesson-list");
      if (external) {
        console.log("⚙️ Found external LessonList");
        setIsLessonListExternal(true);
      } else {
        setIsLessonListExternal(false);
      }
    };

    // نتحقق مرتين (مرة فورية ومرة بعد 200ms لضمان اكتمال الـ DOM)
    checkExternal();
    const timer = setTimeout(checkExternal, 200);
    return () => clearTimeout(timer);
  }, [setShowLevels]);

  const isAdvancedUnlocked = hasCompletedBasic || userLevel === "advanced";

  // ✅ عند اختيار مستوى
  const handleSelectLevel = async (level) => {
    if (level === "advanced" && !isAdvancedUnlocked) return;

    try {
      const token = localStorage.getItem("token");

      if (level === "basic") {
        const res = await fetch(`${API}/api/lessons/initialize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ level }),
        });

        const data = await res.json();
        console.log("📘 Initialization Response:", data);
      }

      if (onStartLevel) onStartLevel(level);

      // تعيين المستوى المختار وإظهار المحتوى المناسب
      setSelectedLevel(level);
      setSelectedSubLevel(null);
      setShowLessons(true);
    } catch (err) {
      console.error("❌ Error initializing lessons:", err);
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 relative">
      {/* 🟣 بطاقتي Basic و Advanced */}
      <div className="flex items-center gap-24 mb-8">
        {/* Basic Card */}
        <div className="relative group flex flex-col items-center">
          <div
            className="w-64 h-40 rounded-2xl shadow-lg flex flex-col items-center justify-center transition-transform transform
              hover:scale-105 hover:shadow-2xl hover:brightness-105 bg-gradient-to-br from-pink-400 to-red-500 text-white font-bold text-2xl relative cursor-pointer"
          >
            <div className="text-5xl mb-2">📘</div>
            <span>Basic</span>

            <span
              onClick={() => handleSelectLevel("basic")}
              className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-2xl text-black text-lg font-semibold opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300 hover:bg-yellow-500 hover:text-black"
            >
              Let's Start →
            </span>
          </div>
        </div>

        {/* الخط المتقطع */}
        <div className="w-36 border-t-2 border-dashed border-gray-700 mx-6"></div>

        {/* Advanced Card */}
        <div className="relative group">
          <button
            onClick={() => handleSelectLevel("advanced")}
            className={`w-64 h-40 rounded-2xl shadow-lg flex flex-col items-center justify-center transition-transform transform
              hover:scale-105 hover:shadow-2xl hover:brightness-105 bg-gradient-to-br from-indigo-600 to-blue-500 text-white font-bold text-2xl
              ${
                !isAdvancedUnlocked
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
          >
            <div className="text-5xl mb-2">💡</div>
            Advanced

            {!isAdvancedUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-black bg-yellow-100 bg-opacity-90 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 pointer-events-none">
                Finish Basic lessons to unlock Advanced level.
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ✅ عرض دروس Basic فقط إذا ما في LessonList خارجي */}
      {showLessons && selectedLevel === "basic" && !isLessonListExternal && (
        <div className="external-lesson-list w-full mt-6">
          
        </div>
      )}

      {/* ✅ عرض Advanced Options */}
      {showLessons && selectedLevel === "advanced" && (
        <div className="flex flex-col items-center mt-10 space-y-6">
          <h3 className="text-2xl font-semibold text-blue-700 mb-2">
            You selected Advanced level. Get ready to dive deeper!
          </h3>

          {/* 🟦 خيارات Advanced */}
          <div className="flex flex-wrap justify-center gap-8">
            <div
              className="w-64 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
             onClick={() => navigate("/css-tutorial")}

            >
              <div className="text-4xl mb-2">🎨</div>
              <span className="text-lg font-bold">CSS Tutorial</span>
            </div>

            <div
              className="w-64 h-40 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
             onClick={() => navigate("/quiz")}

            >
              <div className="text-4xl mb-2">🧠</div>
              <span className="text-lg font-bold">HTML + CSS Quiz</span>
            </div>

            <div
              className="w-64 h-40 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
              onClick={() => navigate("/project")}

            >
              <div className="text-4xl mb-2">🏗️</div>
              <span className="text-lg font-bold">Build a Project</span>
            </div>
          </div>

          {/* ⬇️ عرض محتوى القسم الفرعي فقط */}
          <div className="w-full flex justify-center mt-10">
            {selectedSubLevel === "css" && <CSSPlatform />}
            {selectedSubLevel === "quiz" && <Quiz />}

            {selectedSubLevel === "project" && <BuildProject />}
          </div>
        </div>
      )}
    </div>
  );
}
