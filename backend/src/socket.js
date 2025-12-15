import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

const onlineCounts = new Map();

function getOnlineUserIds() {
  return Array.from(onlineCounts.entries())
    .filter(([_, c]) => c > 0)
    .map(([id]) => Number(id));
}

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      if (!token) return next(new Error("no token"));
      if (token.startsWith("Bearer ")) token = token.slice(7);

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id, role: payload.role };
      next();
    } catch (e) {
      next(new Error(e.message));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;

    if (userId) {
      socket.join(`user:${userId}`);

      const prev = onlineCounts.get(userId) || 0;
      onlineCounts.set(userId, prev + 1);

      socket.emit("presence:bulk", { onlineUserIds: getOnlineUserIds() });

      if (prev === 0) {
        io.emit("presence:update", { userId, online: true });
      }
    }

    socket.on("mark_thread_read", ({ partnerId }) => {
      if (!partnerId) return;
      io.to(`user:${partnerId}`).emit("chat:readAll", { partnerId: userId });
    });

    socket.on("disconnect", () => {
      if (!userId) return;

      const prev = onlineCounts.get(userId) || 0;
      const next = Math.max(0, prev - 1);

      if (next === 0) {
        onlineCounts.delete(userId);
        io.emit("presence:update", { userId, online: false });
      } else {
        onlineCounts.set(userId, next);
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}
