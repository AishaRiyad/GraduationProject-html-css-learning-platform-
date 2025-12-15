import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CommentSection from "../../components/StudentComponents/CommentSection";
import LikeButton from "../../components/StudentComponents/LikeButton";
import AddCommentBox from "../../components/StudentComponents/AddCommentBox";
import { Trash2, ArrowLeft, Edit3 } from "lucide-react";


export default function ProjectDetails({ projectId, token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
const storedUser = JSON.parse(localStorage.getItem("user"));
const currentUserId = storedUser?.id;
const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    github_link: "",
    image: null,
  });

  const API = "http://localhost:5000/api/project-hub";
const fetchComments = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/project-hub/${id}/comments`);
    setComments(res.data);
  } catch (err) {
    console.error("Error fetching comments:", err);
  }
};

// ✅ تحميل التعليقات عند فتح الصفحة
useEffect(() => {
  fetchComments();
}, [id]);
  // ✅ جلب بيانات المشروع المحدد
  const fetchProject = async () => {
  try {
    const res = await axios.get(`${API}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // نضيف خاصية isOwner بناءً على user_id في المشروع
    const currentUserId = JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id;
    const isOwner = res.data.user_id === currentUserId;
    setProject({ ...res.data, isOwner });
  } catch (err) {
    console.error("❌ Error fetching project:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-gray-600 text-lg">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-red-600 font-medium">Project not found ❌</p>
      </div>
    );
  }
const handleDelete = async () => {
  if (!window.confirm("Are you sure you want to delete this project?")) return;
  try {
    await axios.delete(`${API}/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    alert("✅ Project deleted successfully!");
    navigate("/project-hub");
  } catch (err) {
    alert("❌ Error deleting project.");
    console.error(err);
  }
};
const handleUpdate = async (e) => {
  e.preventDefault();

  try {
    const form = new FormData();

    // فقط الحقول غير الفارغة
    if (formData.title.trim()) form.append("title", formData.title);
    if (formData.description.trim()) form.append("description", formData.description);
    if (formData.github_link.trim()) form.append("github_link", formData.github_link);
    if (formData.image) form.append("image", formData.image);

    const res = await axios.put(`${API}/${id}/update`, form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("✅ Project updated successfully!");
    setShowEditForm(false);

    // تحديث البيانات المعروضة بدون ما نعيد تحميل الصفحة
    setProject((prev) => ({
      ...prev,
      title: formData.title || prev.title,
      description: formData.description || prev.description,
      github_link: formData.github_link || prev.github_link,
      image_url: formData.image ? URL.createObjectURL(formData.image) : prev.image_url,
    }));

    console.log("✅ Response:", res.data);
  } catch (err) {
    console.error("❌ Error updating project:", err.response?.data || err.message);
    alert("Error updating project");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
      <div className="max-w-4xl mx-auto bg-white border border-amber-200 rounded-2xl shadow-md p-6">
        {/* صورة المشروع */}
        <img
          src={`http://localhost:5000${project.image_url}`}
          alt={project.title}
          className="rounded-xl w-full h-72 object-cover mb-4"
        />

        {/* عنوان المشروع */}
     <div className="flex justify-between items-center mb-2">
  <h1 className="text-3xl font-bold text-amber-700">{project.title}</h1>
  <div className="flex gap-2">
    {/* 🔙 زر الرجوع */}
    <button
      onClick={() => navigate("/project-hub")}
      className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
    >
      <ArrowLeft className="w-4 h-4" /> Back
    </button>

    {/* ✏️ تعديل المشروع (يظهر فقط لصاحبه) */}
    {project.isOwner && (
    <button
          onClick={() => setShowEditForm(true)}
          className="bg-yellow-400 px-4 py-2 rounded-lg text-white hover:bg-yellow-500"
        >
          ✏️ Edit
        </button>
    )}
{showEditForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[500px] shadow-xl relative">
            <button
              onClick={() => setShowEditForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold text-amber-700 mb-4">
              Edit Project
            </h3>

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Title"
                className="w-full border border-amber-300 rounded-lg p-2"
              />
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
                className="w-full border border-amber-300 rounded-lg p-2 h-24"
              ></textarea>
              <input
                type="text"
                value={formData.github_link}
                onChange={(e) =>
                  setFormData({ ...formData, github_link: e.target.value })
                }
                placeholder="GitHub Link"
                className="w-full border border-amber-300 rounded-lg p-2"
              />
              <input
                type="file"
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.files[0] })
                }
                className="w-full border border-amber-300 rounded-lg p-2"
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2 rounded-lg hover:scale-105 transition-transform"
              >
                Update Project
              </button>
            </form>
          </div>
        </div>
      )}
    {/* 🗑️ حذف المشروع (يظهر فقط لصاحبه) */}
    {project.isOwner && (
      <button
        onClick={handleDelete}
        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
      >
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    )}
  </div>
</div>


        {/* وصف + رابط GitHub */}
        <p className="text-gray-700 mb-3 leading-relaxed">
          {project.description}
        </p>
        {project.github_link && (
          <a
            href={project.github_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline mb-5 inline-block"
          >
            🔗 View on GitHub
          </a>
        )}

        {/* زر الإعجاب */}
        <div className="my-4">
          <LikeButton
  projectId={project.id}
  initialLikes={project.likes_count || 0}
  onLikeUpdate={(newLikes) => {
    // ✅ تحديث حالة المشروع مباشرة
    setProject((prev) => ({ ...prev, likes_count: newLikes }));
  }}
/>

        </div>

        
       
<CommentSection
  projectId={project.id}
  projectOwnerId={project.owner_id}
  currentUserId={currentUserId}
  fetchComments={fetchComments}   // ✅ أضيفي هذا السطر
/>


      </div>
    </div>
  );
}
