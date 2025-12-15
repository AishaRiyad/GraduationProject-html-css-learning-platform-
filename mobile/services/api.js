// mobile/services/api.js
import axios from "axios";

export const API_URL = "http://10.0.2.2:5000";

// axios instance
const api = axios.create({
  baseURL: API_URL,
});

// interceptors = إضافة التوكن تلقائياً
api.interceptors.request.use(async (config) => {
  try {
    const token = global.authToken; // رح نحطه بعد اللوج إن
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// ====================
// 🔐 AUTH
// ====================

export async function login(email, password) {
  const res = await api.post("/api/auth/login", { email, password });

  // حفظ التوكن عالمستوى العام
  global.authToken = res.data.token;

  return res.data;
}

export async function signup(name, email, password) {
  const res = await api.post("/api/auth/signup", {
    name,
    email,
    password,
  });
  return res.data;
}

// =========================
// 👤 PROFILE
// =========================

export async function getProfile() {
  const res = await api.get("/api/profile");
  return res.data.user;
}

export async function updateProfile(data) {
  const res = await api.put("/api/profile/update", data);
  return res.data;
}

export async function updatePassword(oldPassword, newPassword) {
  const res = await api.put("/api/profile/password", {
    oldPassword,
    newPassword,
  });
  return res.data;
}

export async function uploadProfileImage(fileUri) {
  const formData = new FormData();

  formData.append("profile_image", {
    uri: fileUri,
    name: "profile.jpg",
    type: "image/jpeg",
  });

  const res = await api.post("/api/profile/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

// =========================
// 📘 Lessons Progress
// =========================

export async function getLessonsProgress(userId) {
  const res = await api.get(`/api/lessons/progress/${userId}`);
  return res.data;
}

// =========================
// 📘 Mark Lesson as Completed
// =========================

export async function completeLesson(userId, lessonId, quiz_score, quiz_passed) {
  const res = await api.post("/api/lessons/complete", {
    userId,
    lessonId,
    quiz_score,
    quiz_passed,
  });

  return res.data;
}

export default api;
