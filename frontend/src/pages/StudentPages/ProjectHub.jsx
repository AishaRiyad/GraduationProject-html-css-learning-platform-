import React, { useEffect, useState } from "react";
import axios from "axios";
import ProjectCard from "../../components/StudentComponents/ProjectCard";
import ProjectForm from "../../components/StudentComponents/ProjectForm"; // ✅ استدعاء النموذج
import { Plus, X, Brain } from "lucide-react"; // 🧠 أيقونة إضافية

export default function ProjectHub() {
  const [projects, setProjects] = useState([]);
  const [topProjects, setTopProjects] = useState([]); // ✅ قائمة التوب بروجيكت
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTop, setShowTop] = useState(false); // ✅ تحكم في إظهار النافذة الجانبية

  const API = "http://localhost:5000";

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/api/project-hub`);
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 جلب التوب بروجيكت من AI
 // 🧠 جلب التوب بروجيكت من AI
const fetchTopProjects = async () => {
  try {
    const res = await axios.get(`${API}/api/ai-local/top-projects`);

    if (res.data && Array.isArray(res.data.topProjects) && res.data.topProjects.length > 0) {
      setTopProjects(res.data.topProjects);
    } else {
      console.warn("⚠️ No top projects returned from AI, using fallback if available.");
      setTopProjects([]);
    }
  } catch (err) {
    console.error("Error fetching top projects:", err);
  }
};


  useEffect(() => {
  // 🟢 الخطوة 1: تحميل المشاريع مباشرة
  fetchProjects();

  // 🟡 الخطوة 2: تشغيل AI بعد تحميل المشاريع بثانيتين بالخلفية
  const timer = setTimeout(() => {
    fetchTopProjects();
  }, 2000);

  return () => clearTimeout(timer);
}, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-700 flex items-center gap-2">
          <span className="text-2xl">🌟</span> Projects Hub
        </h1>
        <div className="flex gap-3">
          {/* 🧠 زر التوب بروجيكت */}
          <button
            onClick={() => setShowTop(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-800 rounded-lg shadow-md hover:opacity-90 transition"
          >
            <Brain size={18} /> View Top Projects
          </button>

          {/* زر إضافة مشروع */}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-lg shadow-md hover:opacity-90 transition"
          >
            <Plus size={18} /> Add Project
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-600 text-center">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500 text-center">No projects available yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onLikeUpdate={() => {
                fetchProjects();
                fetchTopProjects(); // ✅ تحديث التوب بروجيكت بعد التفاعل
              }}
            />
          ))}
        </div>
      )}

      {/* 🧠 النافذة الجانبية للتوب بروجيكت */}
      {showTop && (
        <>
          {/* الخلفية الشفافة */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowTop(false)}
          ></div>

          {/* السايد بار */}
          <div className="fixed right-0 top-0 w-[400px] h-full bg-white shadow-2xl z-50 p-6 overflow-y-auto animate-slideIn">
            {/* زر الإغلاق */}
            <button
              onClick={() => setShowTop(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl font-bold text-amber-700 mb-6 flex items-center gap-2">
              🧠 Top Projects
            </h2>

            {topProjects.length === 0 ? (
              <p className="text-gray-500">No top projects yet.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {topProjects.map((p, index) => (
                  <div
                    key={index}
                    className="bg-white border border-amber-100 rounded-xl shadow-sm hover:shadow-md transition p-3"
                  >
                    <div className="relative h-40 w-full mb-3 overflow-hidden rounded-lg">
                     <img
  src={p.image_url ? `http://localhost:5000${p.image_url}` : "/default-project.jpg"}
  alt={p.title}
  className="w-full h-full object-cover"
/>

                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-md shadow">
                        🏆 Rank #{index + 1}
                      </div>
                    </div>

                    <h3 className="font-bold text-amber-800 text-base">
                      {p.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{p.description}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>❤️ {p.likes}</span>
                      <span>💬 {p.comments}</span>
                    </div>
                    <p className="text-xs italic text-amber-600 mt-2">
  💡 {p.reason}
</p>

                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal لإضافة مشروع */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-[600px] max-h-[90vh] shadow-xl relative overflow-y-auto animate-fadeIn">
            {/* زر الإغلاق */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold text-amber-700 mb-4">
              Add Project
            </h2>

            {/* ✅ جعل الفورم مرن ويتمدد حسب المحتوى */}
            <div className="flex flex-col gap-3">
              <ProjectForm
                onSubmitSuccess={() => {
                  setShowForm(false);
                  fetchProjects();
                  fetchTopProjects();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
