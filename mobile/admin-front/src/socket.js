import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { toByteArray } from "base64-js";

const ROOT = process.env.EXPO_PUBLIC_API_BASE || "http://10.0.2.2:5000";

let socket = null;
let lastToken = null;

export let navigationRef = null;
export function setNavigationRef(ref) {
  navigationRef = ref;
}

function base64UrlToUtf8(b64url) {
  const base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 ? "=".repeat(4 - (base64.length % 4)) : "";
  const bytes = toByteArray(base64 + pad);

  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);

  return decodeURIComponent(
    Array.from(binary)
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

function decodeJwtPayload(rawToken) {
  const raw = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
  const part = raw.split(".")[1];
  if (!part) throw new Error("Bad JWT");

  const json = base64UrlToUtf8(part);
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

async function logout() {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");

  try {
    if (socket) socket.disconnect();
  } catch {}

  socket = null;
  lastToken = null;

  if (navigationRef?.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } else {
    Alert.alert("Session expired", "Please login again.");
  }
}

export async function getSocket() {
  const token = await AsyncStorage.getItem("token");
  if (!token) return null;

  if (isJwtExpired(token)) {
    await logout();
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

    if (typeof socket?.on === "function") {
      socket.on("connect_error", async (err) => {
        if (String(err?.message || "").includes("jwt expired")) {
          await logout();
        }
      });
    }
  } else {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
  }

  if (!socket || typeof socket.on !== "function" || typeof socket.off !== "function") {
    return null;
  }

  return socket;
}

export async function resetSocket() {
  try {
    if (socket) socket.disconnect();
  } catch {}
  socket = null;
  lastToken = null;
}
