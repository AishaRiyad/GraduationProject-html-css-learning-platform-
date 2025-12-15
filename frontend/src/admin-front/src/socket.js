import { io } from "socket.io-client";

const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";

let socket = null;
let lastToken = null;

function decodeJwtPayload(rawToken) {
  const raw = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
  const part = raw.split(".")[1];
  if (!part) throw new Error("Bad JWT");

  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(json);
}

function isJwtExpired(token) {
  try {
    const payload = decodeJwtPayload(token);
    const expMs = Number(payload?.exp || 0) * 1000;
    return !expMs || Date.now() >= expMs - 3000;
  } catch {
    return true;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  try {
    if (socket) socket.disconnect();
  } catch {}
  socket = null;
  lastToken = null;
  window.location.href = "/login";
}

export function getSocket() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (isJwtExpired(token)) {
    logout();
    return null;
  }

  if (socket && lastToken && lastToken !== token) {
    try {
      socket.disconnect();
    } catch {}
    socket = null;
  }

  if (!socket) {
    lastToken = token;

    socket = io(ROOT, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 500,
      reconnectionDelayMax: 3000,
      transports: ["websocket", "polling"],
      upgrade: true,
    });

    socket.on("connect_error", (err) => {
      if (String(err?.message || "").includes("jwt expired")) {
        logout();
      }
    });
  } else {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }

  return socket;
}

export function resetSocket() {
  try {
    if (socket) socket.disconnect();
  } catch {}
  socket = null;
  lastToken = null;
}
