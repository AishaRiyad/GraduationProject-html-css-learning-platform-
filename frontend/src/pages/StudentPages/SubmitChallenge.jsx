import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function SubmitChallenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Please login first.");
      return;
    }
    if (!url.trim()) {
      setError("Submission URL is required.");
      return;
    }
    try {
      setBusy(true);
      await axios.post(
        `http://localhost:5000/api/challenges/${id}/submit`,
        { submission_url: url.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/challenge/${id}`);
    } catch (e) {
      console.error(e);
      setError("Failed to submit. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 mb-4">Submit your solution</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Submission URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username/project"
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            disabled={busy}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {busy ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
