import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    github_link: "",
    image: null,
  });

  // ✅ تحميل بيانات المشروع الحالية
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/project-hub/${id}`);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          github_link: res.data.github_link,
          image: null,
        });
      } catch (err) {
        console.error("Error loading project:", err);
      }
    };
    fetchProject();
  }, [id]);

  // ✅ إرسال التحديث
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const form = new FormData();
    if (formData.title.trim()) form.append("title", formData.title);
    if (formData.description.trim()) form.append("description", formData.description);
    if (formData.github_link.trim()) form.append("github_link", formData.github_link);
    if (formData.image) form.append("image", formData.image);

    const res = await axios.put(`http://localhost:5000/api/project-hub/${id}/update`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Response:", res.data);
    alert("✅ Project updated successfully!");
  } catch (err) {
    console.error("❌ Error updating project:", err.response?.data || err.message);
    alert("Error updating project");
  }
};



  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md border border-amber-100">
      <h2 className="text-xl font-bold text-amber-700 mb-4">Edit Project</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Project Title"
          className="w-full border border-amber-300 rounded-lg p-2"
          required
        />

        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Project Description"
          className="w-full border border-amber-300 rounded-lg p-2 h-24"
          required
        />

        <input
          type="text"
          value={formData.github_link}
          onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
          placeholder="GitHub Link"
          className="w-full border border-amber-300 rounded-lg p-2"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
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
  );
}
