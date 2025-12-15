import React, { useState } from "react";
import axios from "axios";

export default function AddCommentBox({ projectId, onCommentAdded }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to comment!");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:5000/api/project-hub/${projectId}/comment`,
        { comment },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Comment added:", res.data);
      setComment("");
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error("❌ Error adding comment:", err.response?.data || err);
      alert("Error sending comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-3">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
        className="flex-grow border border-amber-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      <button
        onClick={handleAddComment}
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
