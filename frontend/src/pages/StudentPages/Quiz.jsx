// src/pages/Quiz.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchQuiz, loadProgress, saveProgress } from "../../quizApi";
import "../../quiz-theme.css";

/* === Decode JWT User ID === */
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function Circle({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`circle fancy-pop ${disabled ? "is-disabled" : ""}`}
      type="button"
    >
      <span className="circle-inner">{children}</span>
    </button>
  );
}

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress">
      <div className="track" />
      <div className="fill" style={{ width: `${pct}%` }} />
      <div className="glow" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Badge({ children }) {
  return <span className="pill-badge">{children}</span>;
}

export default function Quiz() {
  const [topic, setTopic] = useState("html"); // html | css
  const [quizId, setQuizId] = useState(null);
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState({ unlockedLevelIds: [1], scores: {} });
  const [activeLevel, setActiveLevel] = useState(null);
  const [result, setResult] = useState(null);

  // userId from token
  const token = localStorage.getItem("token");
  const payload = decodeJwt(token || "");
  const userId = payload?.id ?? payload?.user_id ?? payload?.sub ?? null;

  // تحميل حسب الـ topic
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchQuiz(topic);
        if (cancelled) return;
        setQuizId(data.quizId);
        setLevels(Array.isArray(data.levels) ? data.levels : []);
        const p = await loadProgress(data.quizId, userId, topic);
        if (cancelled) return;
        setProgress(p || { unlockedLevelIds: [1], scores: {} });
        setActiveLevel(null);
        setResult(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        console.error("Failed to load quiz:", e);
        setLevels([]);
        setProgress({ unlockedLevelIds: [1], scores: {} });
      }
    })();
    return () => { cancelled = true; };
  }, [userId, topic]);

  function openLevel(l) {
    if (!progress.unlockedLevelIds.includes(l.id)) return;
    setActiveLevel(l);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onFinished(correct, total, passed) {
    if (!activeLevel) return;

    const next = {
      ...progress,
      scores: { ...progress.scores, [activeLevel.id]: { correct, total, passed } },
      unlockedLevelIds: [...progress.unlockedLevelIds],
    };

    if (passed) {
      const nextId = activeLevel.id + 1;
      if (levels.some((x) => x.id === nextId) && !next.unlockedLevelIds.includes(nextId)) {
        next.unlockedLevelIds = [...next.unlockedLevelIds, nextId];
      }
    }

    setProgress(next);
    setActiveLevel(null);
    setResult({ correct, total, passed, levelId: activeLevel.id, title: activeLevel.title });

    try {
      await saveProgress({
        quizId,
        userId,
        topic,
        unlockedLevelIds: next.unlockedLevelIds,
        scores: next.scores,
      });
    } catch (err) {
      console.error("❌ Failed to save progress:", err);
    }
  }

  const completed = useMemo(
    () => Object.values(progress.scores || {}).filter((s) => s?.passed).length,
    [progress]
  );

  const TITLE = topic === "css" ? "🌿 CSS Adventure Map 🌼" : "🌸 HTML Adventure Map 🌼";

  return (
    <div className="quiz-theme min-h-screen flex flex-col items-center pb-10">
      {/* Topic Tabs */}
      <div className="mt-4">
        <div className="levels-wrap" style={{ width: "min(1100px, 92vw)" }}>
          <div className="flex gap-2">
            <button
              className={`btn ${topic === "html" ? "" : "ghost"}`}
              onClick={() => setTopic("html")}
              type="button"
            >
              HTML
            </button>
            <button
              className={`btn ${topic === "css" ? "" : "ghost"}`}
              onClick={() => setTopic("css")}
              type="button"
            >
              CSS
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="hero">
        <div className="hero-bg" aria-hidden />
        <h1 className="hero-title">{TITLE}</h1>
        <p className="hero-sub">
          Complete each level in sequence — every level’s questions are on <b>one page</b>.
        </p>

        <div className="hero-stats">
          <Badge>Completed: {completed} / {levels.length || 0}</Badge>
          <Badge>Unlocked: {progress.unlockedLevelIds?.length || 1}</Badge>
        </div>

        <div className="hero-ribbon floating">
          <span className="r-dot" />
          <span className="r-text">Build your achievements gradually ✨</span>
          <span className="r-dot" />
        </div>
      </header>

      {/* Map (levels list) */}
      {!activeLevel && (
        <div className="levels-wrap">
          <div className="levels-grid">
            {levels.map((lvl) => {
              const unlocked = progress.unlockedLevelIds.includes(lvl.id);
              const passed = progress.scores?.[lvl.id]?.passed;
              return (
                <button
                  key={lvl.id}
                  className={[
                    "island-node fancy-pop",
                    !unlocked ? "locked" : "",
                    passed ? "passed" : "open",
                  ].join(" ")}
                  onClick={() => unlocked && openLevel(lvl)}
                  disabled={!unlocked}
                  title={lvl.title}
                  type="button"
                >
                  <span className="island-number">{lvl.id}</span>
                  <span className="island-title">{lvl.title}</span>
                  <span className="island-chip">
                    {passed ? "Passed" : unlocked ? "Start" : "Locked"}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="subtitle-note mt-3">
            Pass each level with at least <b>{levels[0]?.passThreshold ?? 6}</b> correct answers to
            unlock the next.
          </p>
        </div>
      )}

      {/* Play */}
      {activeLevel && (
        <Play level={activeLevel} onExit={() => setActiveLevel(null)} onFinished={onFinished} />
      )}

      {/* Result Modal */}
      {result && (
        <div className="modal-overlay">
          <div className="result-card fancy-pop">
            <div className="result-title">Result</div>
            <div className="result-line">
              {result.correct} / {result.total} ({Math.round((result.correct / result.total) * 100)}%)
            </div>
            <div className={`result-state ${result.passed ? "ok" : "bad"}`}>
              {result.passed ? "Success! Next level unlocked 🎉" : "Try again 💪"}
            </div>
            <div className="result-stats">
              <Badge>Levels completed: {completed}</Badge>
            </div>
            <button className="btn back-btn" onClick={() => setResult(null)} type="button">
              Done
            </button>
            {result.passed && <div className="confetti" aria-hidden />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Play ===================== */
function Play({ level, onExit, onFinished }) {
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lock, setLock] = useState(false);

  const questions = Array.isArray(level.questions) ? level.questions : [];
  const q = questions[i];

  // حماية من مستويات بلا أسئلة
  if (!q) {
    return (
      <div className="qa-card fancy-rise">
        <div className="qa-top">
          <button className="btn ghost" onClick={onExit} type="button">
            ← Back to Map
          </button>
          <div className="title">
            Level {level.id}: <span className="t-main">{level.title}</span>
          </div>
        </div>
        <p className="mt-4">⚠️ No questions found for this level.</p>
      </div>
    );
  }

  const totalQs = questions.length;
  const fallback = Math.min(totalQs, Math.ceil(totalQs * 0.6));
  const threshold = Math.min(
    totalQs,
    typeof level.passThreshold === "number" ? level.passThreshold : fallback
  );

  function advance(isOk) {
    if (isOk) setCorrect((c) => c + 1);
    setLock(true);
    setTimeout(() => {
      if (i + 1 < totalQs) {
        setI(i + 1);
        setLock(false);
      } else {
        const finalCorrect = (isOk ? correct + 1 : correct);
        onFinished(finalCorrect, totalQs, finalCorrect >= threshold);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 420);
  }

  function answerTF(val) {
    if (lock) return;
    const isOk = !!val === !!q.answer;
    advance(isOk);
  }

  function answerMC(index) {
    if (lock) return;
    const isOk = index === q.correctIndex;
    advance(isOk);
  }

  return (
    <div className="qa-card fancy-rise">
      <div className="qa-top">
        <button className="btn ghost" onClick={onExit} type="button">
          ← Back to Map
        </button>
        <div className="title">
          Level {level.id}: <span className="t-main">{level.title}</span>
        </div>
        <div className="muted">
          {i + 1} / {totalQs}
        </div>
      </div>

      <ProgressBar value={i} max={totalQs} />

      <div className="qtext">{q.text}</div>

      <div className="choices">
        {q.type === "TF" ? (
          <>
            <Circle onClick={() => answerTF(true)} disabled={lock}>True</Circle>
            <Circle onClick={() => answerTF(false)} disabled={lock}>False</Circle>
          </>
        ) : (
          (q.options || []).map((opt, idx) => (
            <Circle key={idx} onClick={() => answerMC(idx)} disabled={lock}>
              {opt}
            </Circle>
          ))
        )}
      </div>

      <div className="meta">
        <span>Question: {i + 1}/{totalQs}</span>
        <span>Correct: {correct}</span>
      </div>
    </div>
  );
}
