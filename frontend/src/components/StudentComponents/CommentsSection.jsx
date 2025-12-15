import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CommentsSection({ challengeId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const token = localStorage.getItem("token");

  // جلب التعليقات
  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/interactions/challenges/${challengeId}/comments`
      );
      setComments(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching comments:", err);
    }
  };

  // إضافة تعليق جديد
  const handleAddComment = async () => {
    if (!newComment.trim()) return alert("Please write a comment");
    try {
      await axios.post(
        `http://localhost:5000/api/interactions/challenges/${challengeId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // أضف التعليق للواجهة مباشرة
      setComments((prev) => [
        {
          id: Date.now(),
          user_name: "You",
          content: newComment,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      setNewComment("");
    } catch (err) {
      console.error("❌ Error adding comment:", err);
      alert("Failed to add comment");
    }
  };

  useEffect(() => {
    fetchComments();
  }, [challengeId]);

  return (
    <div className="mt-10 bg-yellow-50 p-6 rounded-2xl shadow-sm border border-yellow-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        💬 Comments
      </h3>

      {/* كتابة تعليق جديد */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none"
        />
        <button
          onClick={handleAddComment}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-5 py-2 rounded-xl transition"
        >
          Add
        </button>
      </div>

      {/* عرض التعليقات */}
      {comments.length === 0 ? (
        <div className="text-gray-500 bg-white rounded-xl p-6 border border-gray-100 text-center">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col gap-1"
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800">{c.user_name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <p className="text-gray-700 mt-1">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
