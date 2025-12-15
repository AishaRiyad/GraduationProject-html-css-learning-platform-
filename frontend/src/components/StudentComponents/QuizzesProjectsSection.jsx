// src/components/QuizzesProjectsSection.jsx
import React from "react";
import { FileText, ClipboardCheck } from "lucide-react";

export default function QuizzesProjectsSection() {
  const items = [
    {
      id: 1,
      title: "Quizzes",
      icon: <ClipboardCheck className="w-12 h-12 text-yellow-400" />,
      description: "Test your knowledge with interactive quizzes and track your progress.",
      color: "from-yellow-400 to-orange-500",
      buttonText: "Start Quiz",
    },
    {
      id: 2,
      title: "Projects",
      icon: <FileText className="w-12 h-12 text-purple-400" />,
      description: "Apply what you learned by completing real-life projects.",
      color: "from-purple-400 to-pink-500",
      buttonText: "Start Project",
    },
  ];

  return (
    <div className="relative py-24 bg-gradient-to-b from-gray-50 to-yellow-50 px-6">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-16 text-gray-800 tracking-wide drop-shadow-md">
        🎯 Quizzes & Projects
      </h2>

      <div className="flex flex-wrap justify-center gap-10 max-w-[1200px] mx-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className={`relative w-80 p-8 rounded-3xl bg-gradient-to-tr ${item.color} text-white shadow-2xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-opacity-70`}
          >
            <div className="flex items-center gap-4 mb-4">
              {item.icon}
              <h3 className="text-2xl font-bold">{item.title}</h3>
            </div>
            <p className="mb-6 text-white/90">{item.description}</p>
            <button className="bg-white text-black font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-all w-full">
              {item.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
