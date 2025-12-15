import React from "react";

export default function RecommendedSection({ stats }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow border">
      <h2 className="text-3xl font-bold mb-6">Recommended For You</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Recommended Lesson" text={stats.recommendedLesson} />
        <Card title="Recommended Quiz" text={stats.recommendedQuiz} />
        <Card title="Recommended Project" text={stats.recommendedProject} />
      </div>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div className="p-6 bg-yellow-50 rounded-xl shadow border hover:bg-yellow-100 transition">
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-gray-700">{text || "No recommendations yet"}</p>
    </div>
  );
}
