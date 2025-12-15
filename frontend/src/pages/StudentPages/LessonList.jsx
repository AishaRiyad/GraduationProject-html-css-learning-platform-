import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LessonList({ selectedLevel }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        const level = selectedLevel || "basic";

        console.log("🧠 Fetching lessons for:", userId, level);

        const res = await axios.get(
          `http://localhost:5000/api/lessons/${userId}/${level}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("✅ Lessons:", res.data);
        setLessons(res.data);
      } catch (err) {
        console.error("❌ Error fetching lessons:", err);
        setError("Failed to load lessons.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [selectedLevel]);

  if (loading) return <p className="text-center mt-10">Loading lessons...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  // ✅ إذا المستوى Advanced → لا تعرض أي شيء من الصفحة
  if (selectedLevel === "advanced") {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-yellow-600">
        📚 Lessons
      </h1>

      {lessons.length === 0 ? (
        <p className="text-gray-500 text-center">No lessons found.</p>
      ) : (
        // ✅ تعديل عرض الدروس إلى شبكة أعمدة
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className={`p-5 rounded-xl shadow border transition-all duration-300 transform ${
                lesson.is_unlocked
                  ? "bg-white hover:bg-yellow-100 hover:scale-[1.02]"
                  : "bg-gray-200 opacity-70 hover:bg-gray-300"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800 text-lg">
                  {lesson.title}
                </span>

                {Number(lesson.is_unlocked) === 1 ? (
                  <button
                    onClick={() => navigate(`/lesson-viewer/${lesson.id}`)}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-sm font-semibold rounded-full"
                  >
                    Start Lesson
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">🔒 Locked</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
