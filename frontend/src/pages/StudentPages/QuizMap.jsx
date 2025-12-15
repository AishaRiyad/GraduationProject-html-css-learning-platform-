import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// تجيبي عدد المراحل من الباك إن وجاهز. لو عندك quizApi.js:
const API_ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function QuizMap() {
  const nav = useNavigate();
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${API_ROOT}/api/quiz/html/levels`, { headers: authHeader() });
      const data = await r.json();
      setLevels(data.levels || []);
    })();
  }, []);

  // مسار “حلزوني/متعرج” بسيط يوضع النقاط على الخريطة
  const positions = useMemo(() => {
    const count = Math.max(levels.length, 30); // يدعم عدد كبير
    const arr = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const y = 8 + row * 8; // نسبة من ارتفاع الخريطة
      const x = (row % 2 === 0)
        ? [18, 50, 82][col]
        : [82, 50, 18][col];
      arr.push({ x, y });
    }
    return arr;
  }, [levels.length]);

  return (
    <div className="quiz-theme min-h-screen flex flex-col items-center py-8">
      <h1 className="title-hero">🌸 HTML Adventure Map 🌼</h1>

      <div className="map-wrapper">
        {/* خلفية الخريطة */}
        <div className="map-bg" />

        {/* نقاط المراحل */}
        {levels.map((lvl, i) => {
          const p = positions[i] || { x: 50, y: 50 };
          return (
            <button
              key={lvl.id}
              className="island-node"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onClick={() => nav(`/quiz/level/${lvl.id}`)}
              title={lvl.title}
            >
              <span className="island-number">{lvl.id}</span>
            </button>
          );
        })}
      </div>

      <p className="subtitle-note">
        Click an island to start a level. Finish to unlock the next!
      </p>
    </div>
  );
}
