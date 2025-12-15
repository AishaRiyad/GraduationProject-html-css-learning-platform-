// src/quizApi.js
const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const API = `${ROOT}/api`;

function authHeader() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// topic: "html" | "css"
export async function fetchQuiz(topic = "html") {
  const r = await fetch(`${API}/quiz/${encodeURIComponent(topic)}/levels`, {
    headers: { ...authHeader() },
  });
  if (!r.ok) throw new Error("Failed to fetch quiz");
  return r.json();
}

export async function loadProgress(quizId, userId, topic = "html") {
  const r = await fetch(`${API}/quiz/progress/${quizId}/${userId}?topic=${encodeURIComponent(topic)}`, {
    headers: { ...authHeader() },
  });
  if (!r.ok) throw new Error("Failed to load progress");
  return r.json();
}

export async function saveProgress(payload) {
  const r = await fetch(`${API}/quiz/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Failed to save progress: ${txt || r.status}`);
  }
  return r.json();
}

export async function fetchCertificate(topic = "html") {
  const r = await fetch(
    `${API}/quiz/certificate/${encodeURIComponent(topic)}`,
    { headers: { ...authHeader() } }
  );
  if (!r.ok) throw new Error("Failed to fetch certificate");
  return r.json();
}


