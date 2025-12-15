// admin-front/src/AdminQuizzesApi.js
const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const API  = `${ROOT}/api/admin`;

function authHeaders(extra){
  return { Authorization: `Bearer ${localStorage.getItem("token")}`, ...(extra||{}) };
}

/* Levels */
export async function adminListQuizLevels(topic){
  const r = await fetch(`${API}/quizzes/${encodeURIComponent(topic)}/levels`, { headers: authHeaders() });
  if(!r.ok) return [];
  return r.json();
}
export async function adminCreateQuizLevel(topic, payload){
  const r = await fetch(`${API}/quizzes/${encodeURIComponent(topic)}/levels`, {
    method: "POST",
    headers: authHeaders({ "Content-Type":"application/json" }),
    body: JSON.stringify(payload),
  });
  if(!r.ok) throw new Error("create level failed");
  return r.json();
}
// Note: backend routes for PUT/DELETE do not include topic in the path
export async function adminUpdateQuizLevel(_topic, id, payload){
  const r = await fetch(`${API}/quizzes/levels/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type":"application/json" }),
    body: JSON.stringify(payload),
  });
  if(!r.ok) throw new Error("update level failed");
  return r.json();
}
export async function adminDeleteQuizLevel(_topic, id){
  const r = await fetch(`${API}/quizzes/levels/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if(!r.ok) throw new Error("delete level failed");
  return r.json();
}

/* Questions */
export async function adminListQuestions(levelId){
  const r = await fetch(`${API}/quizzes/levels/${levelId}/questions`, { headers: authHeaders() });
  if(!r.ok) return [];
  return r.json();
}
export async function adminCreateQuestion(levelId, payload){
  const r = await fetch(`${API}/quizzes/levels/${levelId}/questions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type":"application/json" }),
    body: JSON.stringify(payload),
  });
  if(!r.ok) throw new Error("create question failed");
  return r.json();
}
export async function adminUpdateQuestion(questionId, payload){
  const r = await fetch(`${API}/quizzes/questions/${questionId}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type":"application/json" }),
    body: JSON.stringify(payload),
  });
  if(!r.ok) throw new Error("update question failed");
  return r.json();
}
export async function adminDeleteQuestion(questionId){
  const r = await fetch(`${API}/quizzes/questions/${questionId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if(!r.ok) throw new Error("delete question failed");
  return r.json();
}
