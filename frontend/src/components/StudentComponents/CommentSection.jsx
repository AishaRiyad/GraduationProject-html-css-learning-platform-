import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CommentSection({ projectId, projectOwnerId, currentUserId: propUserId }) {
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const finalUserId = propUserId || storedUser?.id || localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // ✅ جلب التعليقات
  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/project-hub/${projectId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("❌ Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  // ✅ إضافة تعليق جديد
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/project-hub/${projectId}/comment`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("❌ Error adding comment:", err);
      alert("Error adding comment");
    }
  };

  // ✅ إضافة رد
  const handleReply = async (commentId) => {
    if (!replyText[commentId]?.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/project-hub/${projectId}/comment`,
        { comment: replyText[commentId], reply_to: commentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      setReplyingTo(null);
      fetchComments();
    } catch (err) {
      console.error("❌ Error adding reply:", err);
      alert("Error adding reply");
    }
  };

  // ✅ من يحق له الرد على هذا الكومنت؟
// ✅ من يحق له الرد على هذا الكومنت؟
const canReplyToComment = (commentUserId) => {
  if (!finalUserId) return false;
  return String(commentUserId) !== String(finalUserId);
};




  // ✅ عرض التعليق والردود المتداخلة
  const renderComment = (c, level = 0) => (
 //console.log("DEBUG:", { commentUserId: c.user_id, currentUserId: finalUserId });

    <div key={c.id} className={`ml-${level * 4} mb-3`}>
      <div className="bg-white border border-amber-100 rounded-xl p-3 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-amber-700 text-sm">
            {c.user_name}
            {c.user_id === projectOwnerId && (
              <span className="ml-1 text-xs text-amber-500 font-medium">(Author)</span>
            )}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(c.created_at).toLocaleDateString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <p className="text-gray-700 text-sm mb-2">{c.comment}</p>

        {/* ✅ الزر يظهر فقط إذا التعليق ليس من المستخدم نفسه */}
        {/* ✅ الزر يظهر فقط إذا التعليق ليس من المستخدم نفسه */}
{canReplyToComment(c.user_id) && (
  <button
    onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
    className="text-blue-600 text-sm hover:underline mt-1"
  >
    {replyingTo === c.id ? "Cancel" : "Reply"}
  </button>
)}


        {/* ✅ مربع الرد */}
        {replyingTo === c.id && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyText[c.id] || ""}
              onChange={(e) =>
                setReplyText((prev) => ({ ...prev, [c.id]: e.target.value }))
              }
              className="flex-1 border border-amber-300 rounded-lg p-1 text-sm"
            />
            <button
              onClick={() => handleReply(c.id)}
              className="bg-amber-400 text-white px-3 py-1 rounded-lg text-sm"
            >
              Send
            </button>
          </div>
        )}
      </div>

      {/* 🔁 عرض الردود المتداخلة */}
      {c.replies?.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-amber-200 pl-3">
          {c.replies.map((r) => renderComment(r, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-6 bg-amber-50 p-4 rounded-2xl shadow-sm border border-amber-100">
      <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
        Comments 💬
      </h3>

      {/* ✅ عرض التعليقات */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        ) : (
          comments.map((c) => renderComment(c))
        )}
      </div>

      {/* ✅ مربع إضافة تعليق جديد */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 border border-amber-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        />
        <button
          onClick={handleAddComment}
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
        >
          Send
        </button>
      </div>
    </div>
  );
}
