import React from "react";
import { Link } from "react-router-dom";

const diffColor = (d) =>
  d === "easy" ? "text-green-600 bg-green-50" :
  d === "medium" ? "text-yellow-600 bg-yellow-50" :
  "text-red-600 bg-red-50";

export default function ChallengeCard({ challenge }) {
  return (
    <div className="bg-[#FFFDF5] border border-yellow-100 rounded-2xl shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 p-6">

      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{challenge.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diffColor(challenge.difficulty)}`}>
          {challenge.difficulty?.toUpperCase()}
        </span>
      </div>

      <p className="text-gray-600 mt-2 line-clamp-3">{challenge.description}</p>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          {challenge.deadline && (
  <div className="flex items-center text-sm mt-3">
    <span className="mr-2">⏳</span>
    <span
      className={`font-medium ${
        new Date(challenge.deadline) < new Date()
          ? "text-red-600"
          : "text-gray-700"
      }`}
    >
      Deadline:&nbsp;
      <span className="font-semibold">
        {new Date(challenge.deadline).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </span>
  </div>
)}

        </div>
        <div className="flex items-center justify-between mt-6">
 <div className="absolute bottom-3 left-3">
  {new Date(challenge.deadline) < new Date() ? (
    <span className="bg-red-100 text-red-700 font-semibold px-3 py-1 rounded-full text-xs shadow-sm">
      ⛔ Expired
    </span>
  ) : (
    <span className="bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-xs shadow-sm">
      ✅ Active
    </span>
  )}
</div>


  {/* الزر */}
  <a
    href={`/challenge/${challenge.id}`}
    onClick={(e) => {
      if (new Date(challenge.deadline) < new Date()) {
        e.preventDefault(); // ما يخليه يفتح التفاصيل إذا انتهى
      }
    }}
    className={`px-5 py-2.5 rounded-xl font-semibold shadow transition-all duration-300 ${
      new Date(challenge.deadline) < new Date()
        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
        : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:shadow-md hover:scale-105"
    }`}
  >
    {new Date(challenge.deadline) < new Date() ? "Closed" : "View Details"}
  </a>
</div>

      </div>
    </div>
  );
}
