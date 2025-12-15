import React from "react";
import { Award, Code2, FileText, ChevronRight } from "lucide-react";

export default function QuickActions({ stats, navigate }) {
  const items = [
    {
      title: "Continue Last Lesson",
      onClick: () => navigate(`/lesson/${stats.lastLessonId}`),
      icon: <ChevronRight className="w-6 h-6" />,
    },
    {
      title: "Try Code Editor",
      onClick: () => navigate("/code-editor"),
      icon: <Code2 className="w-6 h-6" />,
    },
    {
      title: "Solve Latest Quiz",
      onClick: () => navigate(`/quiz/${stats.nextQuizId}`),
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: "Submit a Project",
      onClick: () => navigate("/projects"),
      icon: <FileText className="w-6 h-6" />,
    },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Quick Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.onClick}
            className="p-6 bg-white rounded-2xl shadow border flex flex-col items-start gap-3 hover:bg-yellow-50 transition"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              {item.icon}
            </div>
            <p className="font-semibold text-lg">{item.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
