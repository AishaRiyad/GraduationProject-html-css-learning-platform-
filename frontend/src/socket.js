import { io } from "socket.io-client";

const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";

let socket = null;
let lastToken = null;

function decodeJwtPayload(rawToken) {
  const raw = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
  const part = raw.split(".")[1];
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
    return Date.now() >= payload.exp * 1000 - 3000;
  } catch {
    return true;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  try {
    socket?.disconnect();
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

  if (socket && lastToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    lastToken = token;
    socket = io(ROOT, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect_error", (err) => {
      if (String(err?.message).includes("jwt expired")) {
        logout();
      }
    });
  }

  return socket;
}

export function resetSocket() {
  try {
    socket?.disconnect();
  } catch {}
  socket = null;
  lastToken = null;
}

