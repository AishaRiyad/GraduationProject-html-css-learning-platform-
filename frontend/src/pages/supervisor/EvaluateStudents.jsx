import React, { useEffect, useState } from "react";
import api from "../../api";

export default function EvaluateStudents() {
  const [students, setStudents] = useState([]);
  const [rating, setRating] = useState({});
  const [comment, setComment] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const rawUser = localStorage.getItem("user");
  const me = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setMsg("");

        const res = await api.get("/evaluations/supervisor/students", {
          params: { supervisorId: me?.id },
        });

        setStudents(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setStudents([]);
        setMsg("Failed to load students (check token / backend route).");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [me?.id]);

  const submit = async (studentId) => {
    try {
      setMsg("");
      await api.post("/evaluations", {
        direction: "supervisor_to_student",
        evaluatee_user_id: studentId,
        rating_overall: Number(rating[studentId] || 5),
        comment: comment[studentId] || "",
      });
      setMsg(" Evaluation saved.");
    } catch (e) {
      setMsg(" Failed to save evaluation.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-5 shadow">
        <h2 className="text-2xl font-black text-pink-700">Evaluate Students</h2>
        <p className="text-sm text-slate-500 mt-1">Rate your students (1–5) and leave feedback.</p>
      </div>

      {msg && (
        <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-3 text-sm text-slate-700">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="text-slate-600">Loading…</div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border-2 border-yellow-200 bg-white p-6 shadow text-slate-600">
          No students found for you yet.
          <div className="text-xs text-slate-400 mt-2">
            (Make sure tasks are assigned to students, and token not expired)
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {students.map((s) => (
            <div key={s.user_id} className="rounded-2xl border-2 border-yellow-200 bg-white p-5 shadow">
              <div className="flex items-center gap-3">
                <img
                  src={s.photo_url || "/user-avatar.jpg"}
                  alt=""
                  className="w-12 h-12 rounded-full border-2 border-yellow-300"
                />
                <div>
                  <div className="font-bold text-slate-800">{s.full_name}</div>
                  <div className="text-xs text-slate-500">Student #{s.user_id}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Rating (1–5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="w-full rounded-xl border p-2 mt-1"
                    value={rating[s.user_id] ?? 5}
                    onChange={(e) => setRating({ ...rating, [s.user_id]: e.target.value })}
                  />
                </div>

                <button
                  onClick={() => submit(s.user_id)}
                  className="rounded-xl bg-gradient-to-r from-yellow-300 to-yellow-500 px-4 py-2 font-bold text-black shadow hover:scale-[1.02] transition"
                >
                  Save
                </button>
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-600">Feedback</label>
                <textarea
                  className="w-full rounded-xl border p-2 mt-1 min-h-[90px]"
                  placeholder="Write feedback (optional)…"
                  value={comment[s.user_id] ?? ""}
                  onChange={(e) => setComment({ ...comment, [s.user_id]: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
