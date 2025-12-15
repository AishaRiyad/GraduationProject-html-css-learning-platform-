import React, { useState } from "react";
import axios from "axios";
import { Heart } from "lucide-react";

export default function LikeButton({ projectId, initialLikes = 0, onLikeUpdate }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/project-hub/${projectId}/like`,
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

      // ✅ تحديث الصفحة الرئيسية أو التفاصيل إذا موجود
      if (onLikeUpdate) onLikeUpdate(newLikes);
    } catch (err) {
      console.error("Error liking project:", err);
    }
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-100 hover:bg-pink-200 transition"
    >
      <Heart
        className={`w-5 h-5 ${liked ? "text-pink-500 fill-pink-500" : "text-gray-400"}`}
      />
      <span className="text-sm font-medium text-gray-700">
        {likes} {likes === 1 ? "Like" : "Likes"}
      </span>
    </button>
  );
}
