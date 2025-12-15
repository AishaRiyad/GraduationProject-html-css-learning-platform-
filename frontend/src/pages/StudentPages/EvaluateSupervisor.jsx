import React, { useEffect, useState } from "react";
import api from "../../api";

export default function EvaluateSupervisor() {
  const [supervisors, setSupervisors] = useState([]);
  const [selected, setSelected] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const rawUser = localStorage.getItem("user");
  const me = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setMsg("");

        const res = await api.get("/evaluations/student/supervisors", {
          params: { studentId: me?.id },
        });

        const list = Array.isArray(res.data) ? res.data : [];
        setSupervisors(list);

        if (list.length === 1) setSelected(String(list[0].supervisor_id));
      } catch (e) {
        setSupervisors([]);
        setMsg("Failed to load supervisors (check token / backend route).");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [me?.id]);

  const submit = async () => {
    try {
      setMsg("");
      await api.post("/evaluations", {
        direction: "student_to_supervisor",
        evaluatee_user_id: Number(selected),
        rating_overall: Number(rating),
        comment,
      });
      setMsg(" Evaluation submitted successfully.");
    } catch (e) {
      setMsg("Failed to submit evaluation.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-6 shadow">
        <h2 className="text-2xl font-black text-pink-700">Evaluate Your Supervisor</h2>
        <p className="text-sm text-slate-500 mt-1">Rate your supervisor and add feedback.</p>

        {msg && (
          <div className="mt-4 rounded-xl border-2 border-yellow-200 bg-yellow-50 p-3 text-sm text-slate-700">
            {msg}
          </div>
        )}

        {loading ? (
          <div className="mt-6 text-slate-600">Loading…</div>
        ) : (
          <>
            <div className="mt-6">
              <label className="text-xs font-semibold text-slate-600">Select Supervisor</label>
              <select
                className="w-full rounded-xl border p-2 mt-1"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Select Supervisor</option>
                {supervisors.map((s) => (
                  <option key={s.supervisor_id} value={s.supervisor_id}>
                    {s.full_name} (#{s.supervisor_id})
                  </option>
                ))}
              </select>

              {supervisors.length === 0 && (
                <div className="text-xs text-slate-400 mt-2">
                  No supervisor found for you yet. (Make sure tasks are assigned to you)
                </div>
              )}
            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Rating (1–5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-xl border p-2 mt-1"
                />
              </div>

              <button
                onClick={submit}
                disabled={!selected}
                className="rounded-xl bg-gradient-to-r from-yellow-300 to-yellow-500 px-4 py-2 font-bold text-black shadow disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition md:self-end"
              >
                Submit
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-600">Comment (optional)</label>
              <textarea
                className="w-full rounded-xl border p-2 mt-1 min-h-[110px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write feedback…"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
