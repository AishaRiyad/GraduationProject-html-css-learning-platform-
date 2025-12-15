import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Loader from "../../components/StudentComponents/Loader";
import SubmissionCard from "../../components/StudentComponents/SubmissionCard";
import CommentSection from "../../components/StudentComponents/CommentsSection";

export default function ChallengeDetails() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [likesCache, setLikesCache] = useState({});
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState(null);
const [evaluating, setEvaluating] = useState(false);

  const token = localStorage.getItem("token");

  // 🟡 Fetch challenge
  const fetchChallenge = async () => {
    const { data } = await axios.get(`http://localhost:5000/api/challenges/${id}`);
    setChallenge(data);
  };

const fetchSubmissions = async () => {
  try {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(
      `http://localhost:5000/api/challenges/${id}/submissions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setSubmissions(data || []);
  } catch (err) {
    console.error("❌ Error fetching submissions:", err);
  }
};

const handleDeleteSubmission = async (submissionId) => {
  if (!window.confirm("Are you sure you want to delete this submission?")) return;
  try {
    await axios.delete(`http://localhost:5000/api/challenges/submissions/${submissionId}`);
    alert("Submission deleted ✅");
    fetchSubmissions(); // تحديث القائمة
  } catch (err) {
    console.error("❌ Error deleting submission:", err);
    alert("Failed to delete submission.");
  }
};

const handleEditSubmission = async (submissionId) => {
  const htmlFile = window.prompt("Enter new HTML file path or leave empty:");
  const cssFile = window.prompt("Enter new CSS file path or leave empty:");
  if (!htmlFile && !cssFile) return;

  const formData = new FormData();
  if (htmlFile) formData.append("html", htmlFile);
  if (cssFile) formData.append("css", cssFile);

  try {
    await axios.put(
      `http://localhost:5000/api/challenges/submissions/${submissionId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    alert("Submission updated ✅");
    fetchSubmissions();
  } catch (err) {
    console.error("❌ Error updating submission:", err);
    alert("Failed to update submission.");
  }
};


  // 👍 Fetch likes
  const fetchLikes = useCallback(async () => {
    try {
      const map = {};
      await Promise.all(
        submissions.map(async (s) => {
          const res = await axios.get(`http://localhost:5000/api/submissions/${s.id}/likes`);
          map[s.id] = res.data?.likes || 0;
        })
      );
      setLikesCache(map);
    } catch (e) {
      console.error(e);
    }
  }, [submissions]);

  // 🧠 Initial load
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchChallenge(), fetchSubmissions()]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (submissions.length) fetchLikes();
  }, [submissions, fetchLikes]);

  // 📤 Submit solution inside same page
  const handleSubmitSolution = async () => {
    if (!submissionUrl.trim()) return alert("Please enter your submission link.");
    try {
      setSubmitting(true);
      await axios.post(
        `http://localhost:5000/api/challenges/${id}/submit`,
        { submission_url: submissionUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubmissionUrl("");
      fetchSubmissions(); // refresh list
      alert("✅ Solution submitted successfully!");
    } catch (err) {
      console.error("❌ Error submitting:", err);
      alert("Failed to submit solution.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (!challenge)
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-500">
        Challenge not found.
      </div>
    );
    // 🤖 Handle AI Evaluation


// 🤖 Handle AI Evaluation
const handleEvaluateAI = async () => {
  if (submissions.length === 0)
    return alert("⚠️ Please submit your HTML & CSS files first!");

  try {
    setEvaluating(true);
    const token = localStorage.getItem("token");

    // نأخذ آخر تسليم للمستخدم (آخر صف من قاعدة البيانات)
    const latest = submissions[0];

    const body = {
      challengeId: latest.challenge_id,
      userId: latest.user_id,
    };

    // نرسل الطلب للبكند (ما نرسل htmlPath أو cssPath)
    const res = await axios.post(
      "http://localhost:5000/api/ai-local/evaluate-challenge",
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // ✅ الباكند بيرجع score و feedback مباشرة
    setAiResult({
      score: res.data.score,
      feedback: res.data.feedback,
    });

    alert(`✅ AI Evaluation Done!\nScore: ${res.data.score}/100`);
  } catch (err) {
    console.error("❌ Error evaluating challenge:", err);
    alert("AI evaluation failed.");
  } finally {
    setEvaluating(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-200 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* 🧩 Challenge Info */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{challenge.title}</h1>
              <p className="text-gray-600 mt-2">{challenge.description}</p>
            </div>
            <div
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                challenge.difficulty === "easy"
                  ? "bg-green-100 text-green-700"
                  : challenge.difficulty === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {challenge.difficulty.toUpperCase()}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            ⏳ Deadline:{" "}
            <span className="font-semibold">
              {new Date(challenge.deadline).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* 📝 Submit Solution (same page) */}
       {/* 📝 Submit Solution (Upload Files) */}
<div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl shadow-inner p-6">
  <h2 className="text-lg font-semibold text-gray-800 mb-3">Upload Your Solution Files</h2>

  <form
    onSubmit={async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("html", e.target.html.files[0]);
      formData.append("css", e.target.css.files[0]);

      try {
        setSubmitting(true);
        await axios.post(`http://localhost:5000/api/challenges/${id}/submit`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("✅ Files submitted successfully!");
        fetchSubmissions();
      } catch (err) {
        console.error(err);
        alert("❌ Failed to submit files.");
      } finally {
        setSubmitting(false);
        e.target.reset();
      }
    }}
    className="space-y-3"
  >
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <label className="flex-1">
        <span className="block text-sm font-medium text-gray-700 mb-1">HTML File</span>
        <input
          type="file"
          name="html"
          accept=".html"
          required
          className="w-full border border-yellow-300 bg-white rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none"
        />
      </label>

      <label className="flex-1">
        <span className="block text-sm font-medium text-gray-700 mb-1">CSS File</span>
        <input
          type="file"
          name="css"
          accept=".css"
          required
          className="w-full border border-yellow-300 bg-white rounded-xl px-3 py-2 shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none"
        />
      </label>
    </div>

    <button
      type="submit"
      disabled={submitting}
      className={`w-full sm:w-auto mt-4 px-6 py-2.5 font-semibold rounded-xl shadow transition-all ${
        submitting
          ? "bg-gray-300 text-gray-700 cursor-not-allowed"
          : "bg-yellow-500 hover:bg-yellow-600 text-gray-900"
      }`}
    >
      {submitting ? "Submitting..." : "Upload Solution"}
    </button>
  </form>
</div>


      <div className="mt-8">
  <h3 className="text-xl font-semibold text-gray-800 mb-4">Submissions</h3>

  {submissions.length === 0 ? (
    <div className="text-gray-500 bg-white rounded-xl p-6 border border-gray-100">
      No submissions yet.
    </div>
  ) : (
    <div className="space-y-4">
      {submissions.map((s) => {
        const formattedDate = new Date(s.submitted_at).toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={s.id}
            className="bg-white rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-yellow-100 hover:shadow-md transition"
          >
            {/* Left Side */}
            <div>
              <p className="font-semibold text-gray-800">{s.user_name}</p>
              <p className="text-sm text-gray-500 mt-1">
                Submitted on:{" "}
                <span className="text-gray-700 font-medium">{formattedDate}</span>
              </p>

              {/* Show filenames */}
              <div className="mt-2 space-y-1">
                {s.html_name && (
                  <p className="text-sm text-gray-700">
                    📝 <span className="font-medium">HTML:</span> {s.html_name}
                  </p>
                )}
                {s.css_name && (
                  <p className="text-sm text-gray-700">
                    🎨 <span className="font-medium">CSS:</span> {s.css_name}
                  </p>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
              {s.html_path && (
                <a
                  href={`http://localhost:5000${s.html_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-xl"
                >
                  View HTML
                </a>
              )}
              {s.css_path && (
                <a
                  href={`http://localhost:5000${s.css_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-xl"
                >
                  View CSS
                </a>
              )}
              <button
                onClick={() => handleEditSubmission(s.id)}
                className="bg-blue-400 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteSubmission(s.id)}
                className="bg-red-400 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-xl"
              >
                Delete
              </button>
            </div>
            
          </div>
        );
      })}
    </div>
  )}
</div>

{/* 🤖 AI Evaluation Section */}
<div className="bg-white border border-yellow-100 rounded-2xl shadow-sm p-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        🤖 AI Evaluation
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Let our AI review your latest submission and give you a score with feedback.
      </p>
      {aiResult ? (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
    <p className="text-gray-800 text-lg font-semibold">
      <strong>AI Score:</strong>{" "}
      <span className="text-yellow-700 font-bold">
        {aiResult.score}/100
      </span>
    </p>
    <p className="text-gray-700 mt-2 leading-relaxed">
      <strong>Feedback:</strong> {aiResult.feedback}
    </p>
  </div>
) : (
  <p className="text-gray-500 italic">No AI evaluation yet.</p>
)}

    </div>

    <button
      onClick={handleEvaluateAI}
      disabled={evaluating}
      className={`mt-4 sm:mt-0 px-6 py-2.5 rounded-xl font-semibold shadow transition-all ${
        evaluating
          ? "bg-gray-300 text-gray-700 cursor-not-allowed"
          : "bg-green-500 hover:bg-green-600 text-white"
      }`}
    >
      {evaluating ? "Evaluating..." : "Get AI Evaluation"}
    </button>
  </div>
</div>


        {/* 💬 Comments */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Comments</h3>
          <CommentSection challengeId={id} />
        </div>
      </div>
    </div>
  );
}
