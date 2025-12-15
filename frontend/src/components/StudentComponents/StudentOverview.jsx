import React from "react";
import { BookOpen, ListChecks, FileText, Award, BarChart } from "lucide-react";

export default function StudentOverview({ stats }) {
  const percent = Math.round(
    (stats.completedLessons / stats.totalLessons) * 100
  );

  const items = [
    {
      title: "Current Level",
      value: stats.level,
      icon: <BookOpen className="w-10 h-10 text-yellow-600" />,
    },
    {
      title: "Lessons Completed",
      value: `${stats.completedLessons}/${stats.totalLessons}`,
      icon: <ListChecks className="w-10 h-10 text-yellow-600" />,
    },
    {
      title: "Quizzes Passed",
      value: stats.quizzesPassed,
      icon: <Award className="w-10 h-10 text-yellow-600" />,
    },
    {
      title: "Projects Submitted",
      value: stats.projectsDone,
      icon: <FileText className="w-10 h-10 text-yellow-600" />,
    },
  ];

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <BarChart className="w-8 h-8 text-yellow-600" />
        Your Learning Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-yellow-50 rounded-xl p-6 shadow border flex flex-col gap-3"
          >
            {item.icon}
            <p className="text-gray-600 text-sm">{item.title}</p>
            <h3 className="text-3xl font-bold">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <p className="font-semibold text-gray-700 mb-2">Overall Progress</p>

        <div className="w-full h-3 bg-gray-200 rounded-full">
          <div
            className="h-full bg-yellow-500 rounded-full transition-all"
            style={{ width: `${percent}%` }}
          ></div>
        </div>

        <p className="mt-2 text-sm text-gray-600">{percent}% completed</p>
      </div>
    </div>
  );
}
