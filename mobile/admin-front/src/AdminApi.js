import AsyncStorage from "@react-native-async-storage/async-storage";

const ROOT = "http://10.0.2.2:5000";
const API = `${ROOT}/api/admin`;
const CHAT_API = `${ROOT}/api/chat`;

async function authHeaders(extra = {}) {
  const t = await AsyncStorage.getItem("token");
  return {
    ...(t ? { Authorization: t.startsWith("Bearer ") ? t : `Bearer ${t}` } : {}),
    "Content-Type": "application/json",
    ...extra,
  };
}

async function okJson(res, label = "request") {
  if (!res.ok) {
    let msg = "";
    try {
      msg = await res.text();
    } catch {}
    throw new Error(`${label} HTTP ${res.status}${msg ? ` — ${msg}` : ""}`);
  }
  return res.json();
}

/* ===== Dashboard ===== */
export async function getOverview() {
  const r = await fetch(`${API}/overview`, { headers: await authHeaders() });
  return okJson(r, "overview");
}

export async function getRecent() {
  const r = await fetch(`${API}/recent`, { headers: await authHeaders() });
  const data = await okJson(r, "recent");
  return {
    latestUsers: Array.isArray(data?.latestUsers) ? data.latestUsers : [],
    latestProjects: Array.isArray(data?.latestProjects) ? data.latestProjects : [],
    latestComments: Array.isArray(data?.latestComments) ? data.latestComments : [],
  };
}

/* ===== Users ===== */
export async function listUsers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API}/users${qs ? `?${qs}` : ""}`, {
    headers: await authHeaders(),
  });
  return okJson(r, "list users");
}

export async function getUser(id) {
  const r = await fetch(`${API}/users/${id}`, { headers: await authHeaders() });
  return okJson(r, "get user");
}

export async function createUser(payload) {
  const r = await fetch(`${API}/users`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return okJson(r, "create user");
}

export async function updateUser(id, payload) {
  const r = await fetch(`${API}/users/${id}`, {
    method: "PUT",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return okJson(r, "update user");
}

export async function deleteUser(id) {
  const r = await fetch(`${API}/users/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  return okJson(r, "delete user");
}

export async function patchUserRole(id, role) {
  const r = await fetch(`${API}/users/${id}/role`, {
    method: "PATCH",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ role }),
  });
  return okJson(r, "patch role");
}

export async function patchUserStatus(id, active) {
  const r = await fetch(`${API}/users/${id}/active`, {
    method: "PATCH",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ active }),
  });
  return okJson(r, "patch status");
}

export async function resetUserPassword(id) {
  const r = await fetch(`${API}/users/${id}/reset-password`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return okJson(r, "reset password");
}

/* ===== Admin self-profile (Settings) ===== */
export async function getMyProfile() {
  const res = await fetch(`${API}/me`, { headers: await authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load profile.");
  return data;
}

export async function updateMyProfile({ name, email }) {
  const res = await fetch(`${API}/me`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify({ name, email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update profile.");
  return data;
}

export async function changeMyPassword({ current_password, new_password }) {
  const res = await fetch(`${API}/me/password`, {
    method: "PUT",
    headers: await authHeaders(),
    body: JSON.stringify({ current_password, new_password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to change password.");
  return data;
}

export async function saveAdminFcmToken(token) {
  const res = await fetch(`${API}/fcm-token`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ fcm_token: token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save FCM token.");
  return data;
}

/* ===== Lessons (HTML) ===== */
export async function listLessons(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API}/lessons${qs ? `?${qs}` : ""}`, {
    headers: await authHeaders(),
  });
  return okJson(r, "list lessons");
}

export async function createLesson(payload) {
  const r = await fetch(`${API}/lessons`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return okJson(r, "create lesson");
}

export async function updateLesson(id, payload) {
  const r = await fetch(`${API}/lessons/${id}`, {
    method: "PUT",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return okJson(r, "update lesson");
}

export async function deleteLesson(id) {
  const r = await fetch(`${API}/lessons/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  return okJson(r, "delete lesson");
}

export async function validateLessonJSON(id) {
  const r = await fetch(`${API}/lessons/${id}/validate`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return okJson(r, "validate lesson json");
}

/* ===== CSS Lessons ===== */
export async function listCssLessons() {
  const r = await fetch(`${API}/css-lessons`, { headers: await authHeaders() });
  return okJson(r, "list css lessons");
}

export async function createCssLesson(payload) {
  const r = await fetch(`${API}/css-lessons`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return okJson(r, "create css lesson");
}

export async function updateCssLesson(id, payload) {
  const r = await fetch(`${API}/css-lessons/${id}`, {
    method: "PUT",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return okJson(r, "update css lesson");
}

export async function deleteCssLesson(id) {
  const r = await fetch(`${API}/css-lessons/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  return okJson(r, "delete css lesson");
}

export async function validateCssJSON(id) {
  const r = await fetch(`${API}/css-lessons/${id}/validate`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return okJson(r, "validate css json");
}

/* ===== Analytics ===== */
export async function getAnalyticsOverview() {
  const r = await fetch(`${API}/analytics/overview`, { headers: await authHeaders() });
  if (!r.ok) throw new Error("overview failed");
  return r.json();
}

export async function getStudentAnalytics(userId) {
  const r = await fetch(`${API}/analytics/student/${userId}`, { headers: await authHeaders() });
  if (!r.ok) throw new Error("student analytics failed");
  return r.json();
}

export async function listAnalyticsUsers() {
  const r = await fetch(`${API}/analytics/users`, { headers: await authHeaders() });
  return okJson(r, "users");
}

export async function getAnalyticsUser(userId) {
  const r = await fetch(`${API}/analytics/users/${userId}`, { headers: await authHeaders() });
  return okJson(r, "user analytics");
}

/* ===== Comments (Admin) ===== */
export async function listComments(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API}/comments${qs ? `?${qs}` : ""}`, {
    headers: await authHeaders(),
  });
  return okJson(r, "list comments");
}

export async function replyToComment(commentId, text) {
  const r = await fetch(`${API}/comments/${commentId}/reply`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ text }),
  });
  return okJson(r, "reply comment");
}

export async function deleteComment(commentId) {
  const r = await fetch(`${API}/comments/${commentId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  return okJson(r, "delete comment");
}

/* ===== Projects (Admin) ===== */
export async function listProjects(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API}/projects${qs ? `?${qs}` : ""}`, {
    headers: await authHeaders(),
  });
  return okJson(r, "list projects");
}

export async function deleteProject(id) {
  const r = await fetch(`${API}/projects/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  return okJson(r, "delete project");
}

/* ===== CHAT ===== */
export async function listMyConversations() {
  const r = await fetch(`${CHAT_API}/conversations`, { headers: await authHeaders() });
  return okJson(r, "list conversations");
}

export async function getConversationWith(userId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${CHAT_API}/with/${userId}${qs ? `?${qs}` : ""}`, {
    headers: await authHeaders(),
  });
  return okJson(r, "get conversation");
}

export async function sendChatMessage(userId, text) {
  const r = await fetch(`${CHAT_API}/with/${userId}`, {
    method: "POST",
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ text }),
  });
  return okJson(r, "send message");
}

export async function markChatRead(userId) {
  const r = await fetch(`${CHAT_API}/with/${userId}/read`, {
    method: "POST",
    headers: await authHeaders(),
  });
  return okJson(r, "mark read");
}

export { ROOT };
