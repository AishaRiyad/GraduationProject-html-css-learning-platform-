import AsyncStorage from "@react-native-async-storage/async-storage";

const ROOT = "http://10.0.2.2:5000"; // Android Emulator
const API = `${ROOT}/api/admin`;

async function authHeaders(extra) {
  const t = await AsyncStorage.getItem("token");
  const token = t ? (t.startsWith("Bearer ") ? t : `Bearer ${t}`) : null;
  return { ...(token ? { Authorization: token } : {}), ...(extra || {}) };
}

/* Levels */
export async function adminListQuizLevels(topic) {
  const r = await fetch(`${API}/quizzes/${encodeURIComponent(topic)}/levels`, {
    headers: await authHeaders(),
  });
  if (!r.ok) return [];
  return r.json();
}

export async function adminCreateQuizLevel(topic, payload) {
  const r = await fetch(`${API}/quizzes/${encodeURIComponent(topic)}/levels`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("create level failed");
  return r.json();
}

// backend routes for PUT/DELETE do not include topic in the path
export async function adminUpdateQuizLevel(_topic, id, payload) {
  const r = await fetch(`${API}/quizzes/levels/${id}`, {
    method: "PUT",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("update level failed");
  return r.json();
}

export async function adminDeleteQuizLevel(_topic, id) {
  const r = await fetch(`${API}/quizzes/levels/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!r.ok) throw new Error("delete level failed");
  return r.json();
}

/* Questions */
export async function adminListQuestions(levelId) {
  const r = await fetch(`${API}/quizzes/levels/${levelId}/questions`, {
    headers: await authHeaders(),
  });
  if (!r.ok) return [];
  return r.json();
}

export async function adminCreateQuestion(levelId, payload) {
  const r = await fetch(`${API}/quizzes/levels/${levelId}/questions`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("create question failed");
  return r.json();
}

export async function adminUpdateQuestion(questionId, payload) {
  const r = await fetch(`${API}/quizzes/questions/${questionId}`, {
    method: "PUT",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("update question failed");
  return r.json();
}

export async function adminDeleteQuestion(questionId) {
  const r = await fetch(`${API}/quizzes/questions/${questionId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!r.ok) throw new Error("delete question failed");
  return r.json();
}
