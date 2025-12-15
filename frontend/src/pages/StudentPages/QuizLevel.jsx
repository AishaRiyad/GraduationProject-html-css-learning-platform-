import React, { useEffect, useState } from "react";

const API_ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const authHeader = () => {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export default function QuizLevel({ level }) {
  // هذه الصفحة تُستخدم داخل Route خاص بالمستوى
  return null;
}

export function QuizLevelRoute({ params }) {
  const levelId = Number(params.levelId);
  const [meta, setMeta] = useState(null);
  const [lvl, setLvl] = useState(null);
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lock, setLock] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${API_ROOT}/api/quiz/html/levels`, { headers: authHeader() });
      const data = await r.json();
      setMeta({ quizId: data.quizId, pass: data.levels.find(x => x.id === levelId)?.passThreshold || 6 });
      const lv = data.levels.find(x => x.id === levelId);
      setLvl(lv);
    })();
  }, [levelId]);

  if (!lvl) {
    return <div className="quiz-theme min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const q = lvl.questions[i];

  function answer(val) {
    if (lock) return;
    let ok = false;
    if (q.type === "TF") ok = !!val === !!q.answer;
    else ok = Number(val) === Number(q.correctIndex);
    if (ok) setCorrect(c => c + 1);
    setLock(true);
    setTimeout(() => {
      if (i + 1 < lvl.questions.length) {
        setI(i + 1); setLock(false);
      } else {
        const passed = (correct + (ok ? 1 : 0)) >= (meta?.pass || 6);
        setDone({ correct: correct + (ok ? 1 : 0), total: lvl.questions.length, passed });
      }
    }, 550);
  }

  return (
    <div className="quiz-theme min-h-screen flex flex-col items-center py-8">
      <h2 className="title-hero">Level {lvl.id} — {lvl.title}</h2>

      <div className="qa-card">
        <div className="qtext">{q.text}</div>

        <div className="choices">
          {q.type === "TF" ? (
            <>
              <button className="circle choice-true" disabled={lock} onClick={() => answer(true)}>True</button>
              <button className="circle choice-false" disabled={lock} onClick={() => answer(false)}>False</button>
            </>
          ) : (
            (q.options || []).map((opt, idx) => (
              <button key={idx} className="circle" disabled={lock} onClick={() => answer(idx)} title={opt}>
                {opt}
              </button>
            ))
          )}
        </div>

        <div className="meta">
          <span>Question {i + 1}/{lvl.questions.length}</span>
          <span>Correct: {correct}</span>
        </div>
      </div>

      {done && (
        <div className="result">
          <div className={`badge ${done.passed ? "pass" : "fail"}`}>
            {done.passed ? "Passed 🎉" : "Try again 💪"}
          </div>
        </div>
      )}
    </div>
  );
}
