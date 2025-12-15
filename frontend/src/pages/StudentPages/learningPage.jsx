import React, { useState } from "react";
import LevelSelector from "../../components/StudentComponents/LevelSelector";
import AnimatedMessage from "../../components/StudentComponents/AnimatedMessage";
import LessonList from "./LessonList";

export default function LessonsPage() {
  const [level, setLevel] = useState(null);
  const [hasCompletedBasic, setHasCompletedBasic] = useState(false);
  const [showLessons, setShowLessons] = useState(false); // للتحكم بظهور الدروس

  const handleSelectLevel = (selectedLevel) => {
    setLevel(selectedLevel);
    setShowLessons(true); // فقط بعد ما يضغط على "Let's Start"
  };
  const [showLevels, setShowLevels] = useState(true);


  return (
    <div
      className="px-8 py-6 min-h-screen 
                 bg-gradient-to-b from-yellow-50 via-yellow-50 to-yellow-100 
                 transition-colors duration-500"
    >
      {/* الرسالة الترحيبية */}
      {!showLessons && (
        <AnimatedMessage message="Welcome! Choose a level to start learning HTML." />
      )}

      {/* أزرار اختيار المستوى */}
      <LevelSelector
        onStartLevel={handleSelectLevel} // ✅ تأكدي إنه اسمه onStartLevel وليس onSelectLevel
        hasCompletedBasic={hasCompletedBasic}
        setShowLevels={setShowLevels}
      />

      {/* نص توضيحي بعد اختيار المستوى */}
      {showLessons && (
        <>
          <div className="mt-6 text-center text-lg font-medium text-gray-800 dark:text-gray-200">
            {level === "basic"
              ? "You selected Basic level. Start learning HTML basics!"
              : "You selected Advanced level. Get ready to dive deeper!"}
          </div>

          {/* ✅ عرض الدروس فقط بعد الضغط على Let's Start */}
          <div className="mt-10 animate-fade-in">
            <LessonList selectedLevel={level} />
          </div>
        </>
      )}
    </div>
  );
}
