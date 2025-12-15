import React, { useState } from "react";
import axios from "axios";

export default function ProjectForm({ onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    github_link: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // ✅ تجهيز البيانات كـ FormData
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("github_link", formData.github_link);
      if (formData.image) {
        form.append("image", formData.image);
      }

      // ✅ إرسال الطلب
      const res = await axios.post(
        "http://localhost:5000/api/project-hub/create",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Project created:", res.data);

      // ✅ إعادة تحميل القائمة في ProjectHub
      if (onSubmitSuccess) onSubmitSuccess();

      // ✅ تنظيف الحقول بعد الإرسال
      setFormData({
        title: "",
        description: "",
        github_link: "",
        image: null,
      });

      alert("✅ Project added successfully!");
    } catch (err) {
      console.error("❌ Error creating project:", err.response?.data || err.message);
      alert("Error adding project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] p-2"
    >
      <div>
        <label className="block font-semibold text-amber-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full border border-amber-300 rounded-lg p-2"
          placeholder="Enter project title"
        />
      </div>

      <div>
        <label className="block font-semibold text-amber-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          className="w-full border border-amber-300 rounded-lg p-2 h-24"
          placeholder="Enter project description"
        />
      </div>

      <div>
        <label className="block font-semibold text-amber-700 mb-1">GitHub Link</label>
        <input
          type="text"
          value={formData.github_link}
          onChange={(e) =>
            setFormData({ ...formData, github_link: e.target.value })
          }
          className="w-full border border-amber-300 rounded-lg p-2"
          placeholder="https://github.com/username/project"
        />
      </div>

      <div>
        <label className="block font-semibold text-amber-700 mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.files[0] })
          }
          className="w-full border border-amber-300 rounded-lg p-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2 rounded-lg hover:scale-105 transition-transform"
      >
        {loading ? "Uploading..." : "Add Project"}
      </button>
    </form>
  );
}
