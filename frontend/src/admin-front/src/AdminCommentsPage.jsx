import React, { useEffect, useState } from "react";
import { listComments, replyToComment, deleteComment } from "./AdminApi";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listComments({ limit: 200 });
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleReply(id) {
    const text = window.prompt("Enter your reply");
    if (!text || !text.trim()) return;
    try {
      await replyToComment(id, text.trim());
      await load();
    } catch (e) {
      alert(e.message || "Failed to send reply.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert(e.message || "Failed to delete comment.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-pink-800">Comments</h1>
        <button
          onClick={load}
          className="px-3 py-1 rounded-full bg-yellow-300 hover:bg-yellow-400 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-500">No comments found.</div>
      ) : (
        <div className="bg-white/90 border border-yellow-200 rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-yellow-100 text-left">
              <tr>
                <th className="px-4 py-2">Post</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Comment</th>
                <th className="px-4 py-2">Created at</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c, idx) => (
                <tr
                  key={c.id}
                  className={idx % 2 === 0 ? "bg-yellow-50/60" : "bg-white"}
                >
                  <td className="px-4 py-2 align-top">
                    <div className="font-semibold text-pink-800">
                      {c.post_title || `Post #${c.post_id}`}
                    </div>
                    {c.reply_to && (
                      <div className="text-xs text-gray-500">
                        Reply to #{c.reply_to}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div className="font-medium">
                      {c.user_name || `User #${c.user_id || "?"}`}
                    </div>
                    {c.user_email && (
                      <div className="text-xs text-gray-500">{c.user_email}</div>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top max-w-md">
                    <div className="whitespace-pre-wrap break-words">
                      {c.comment}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top text-xs text-gray-500">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 align-top text-right space-x-2">
                    {!c.reply_to && (
                      <button
                        onClick={() => handleReply(c.id)}
                        className="px-3 py-1 rounded-full bg-yellow-200 hover:bg-yellow-300 text-xs font-semibold"
                      >
                        Reply
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1 rounded-full bg-red-100 hover:bg-red-200 text-xs font-semibold text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
