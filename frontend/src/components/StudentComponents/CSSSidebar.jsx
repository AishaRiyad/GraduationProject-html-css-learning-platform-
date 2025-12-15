import React from "react";

export default function CSSSidebar({ lessons, currentLessonId, onSelect }) {
  return (
    <div className="w-72 bg-yellow-100 border-r overflow-y-auto p-5">
      <h2 className="text-xl font-bold text-gray-700 mb-4">CSS Tutorial</h2>
      <ul className="space-y-2">
        {lessons.map((lesson, index) => (
          <li
            key={lesson.id}
            onClick={() => onSelect(lesson.id, index)}
            className={`cursor-pointer p-2 rounded-lg transition ${
              currentLessonId === lesson.id
                ? "bg-yellow-500 text-white font-semibold"
                : "hover:bg-gray-200 text-gray-800"
            }`}
          >
            {lesson.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
