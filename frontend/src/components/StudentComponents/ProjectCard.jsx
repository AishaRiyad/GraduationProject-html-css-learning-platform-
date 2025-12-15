import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart } from "lucide-react";

export default function ProjectCard({ project, onLikeUpdate }) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(project.likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation(); // حتى ما يفتح صفحة التفاصيل عند الضغط على لايك
    try {
      await axios.post(
        `http://localhost:5000/api/project-hub/${project.id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const newLikes = liked ? likes - 1 : likes + 1;
      setLikes(newLikes);
      setLiked(!liked);
      if (onLikeUpdate) onLikeUpdate(); // 🔁 نعمل re-fetch من الصفحة الرئيسية
    } catch (err) {
      console.error("Error liking project:", err);
    }
  };

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bg-white rounded-xl border border-amber-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
    >
      <img
        src={`http://localhost:5000${project.image_url}`}
        alt={project.title}
        className="w-full h-52 object-cover"
      />

      <div className="p-4">
        <h2 className="text-xl font-bold text-amber-700 mb-1">
          {project.title}
        </h2>
        <p className="text-gray-600 text-sm line-clamp-3 mb-2">
          {project.description}
        </p>

        <div className="flex justify-between text-sm text-gray-500 items-center mt-2">
  <div className="flex items-center space-x-1">
    <span className="text-pink-500">❤️</span>
    <span>{project.likes_count || 0} Likes</span>
  </div>
  <div className="flex items-center space-x-1">
    <span className="text-gray-400">💬</span>
    <span>{project.comments_count || 0} Comments</span>
  </div>
</div>

      </div>
    </div>
  );
}
