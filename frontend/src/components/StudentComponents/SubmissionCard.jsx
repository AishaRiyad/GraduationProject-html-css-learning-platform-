import React, { useState } from "react";
import axios from "axios";

export default function SubmissionCard({ submission, onLikeChange }) {
  const token = localStorage.getItem("token");
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (!token) return;
    try {
      setLiking(true);
      await axios.post(
        `http://localhost:5000/api/submissions/${submission.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onLikeChange?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLiking(false);
    }
  };

  const handleUnlike = async () => {
    if (!token) return;
    try {
      setLiking(true);
      await axios.delete(
        `http://localhost:5000/api/submissions/${submission.id}/like`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onLikeChange?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLiking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {submission.photo_url ? (
            <img src={submission.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200" />
          )}
          <div>
            <div className="font-semibold text-gray-800">
              {submission.full_name || "User"}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(submission.submitted_at).toLocaleString()}
            </div>
          </div>
        </div>

        {typeof submission.ai_score === "number" && (
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
            Score: {submission.ai_score}
          </span>
        )}
      </div>

      <div className="mt-3">
        <a
          href={submission.submission_url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {submission.submission_url}
        </a>
        {submission.feedback && (
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold">Feedback:</span> {submission.feedback}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          disabled={!token || liking}
          onClick={handleLike}
          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium disabled:opacity-50"
        >
          👍 Like
        </button>
        <button
          disabled={!token || liking}
          onClick={handleUnlike}
          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium disabled:opacity-50"
        >
          💔 Unlike
        </button>
      </div>
    </div>
  );
}
