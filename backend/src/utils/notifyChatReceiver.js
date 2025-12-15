import db from "../config/db.js";
import { getIO } from "../socket.js";

export async function notifyChatReceiver({
  receiverId,
  senderId,
  senderRole,
  receiverRole,
}) {
  // Only admin -> supervisor (as requested)
  if (senderRole !== "admin" || receiverRole !== "supervisor") return;

  const [[sender]] = await db.query(
    `
    SELECT COALESCE(p.full_name, u.name) AS full_name
    FROM users u
    LEFT JOIN profile p ON p.user_id = u.id
    WHERE u.id = ?
    `,
    [senderId]
  );

  const senderName = sender?.full_name || `User#${senderId}`;

  const message = `New message from ${senderName}`;
  const data = { partnerId: senderId, senderId, receiverId };

  const [result] = await db.query(
    `
    INSERT INTO notifications (user_id, type, message, data, is_read)
    VALUES (?, ?, ?, ?, 0)
    `,
    [receiverId, "chat", message, JSON.stringify(data)]
  );

  const notif = {
    id: result.insertId,
    user_id: receiverId,
    type: "chat",
    message,
    data: JSON.stringify(data),
    is_read: 0,
    created_at: new Date(),
  };

  const io = getIO();
  io.to(`user:${receiverId}`).emit("notifications:new", notif);
}
