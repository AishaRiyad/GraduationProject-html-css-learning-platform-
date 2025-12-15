import express from "express";
import db from "../config/db.js";
import { getIO } from "../socket.js";
import { protect } from "../middlewares/authMiddleware.js";
import { sendPushNotificationToUser } from "../utils/pushNotifications.js";

const router = express.Router();

router.use(protect);

router.get("/students", async (req, res) => {
  try {
    const supervisorId = Number(req.query.supervisorId || req.user.id);

    if (!supervisorId) {
      const [rows] = await db.execute(
        "SELECT id, name AS full_name, email FROM users WHERE role = 'student' ORDER BY name ASC"
      );
      return res.json({ success: true, students: rows });
    }

    const [rows] = await db.execute(
      `
      SELECT 
        u.id,
        u.name AS full_name,
        u.email,
        COALESCE(SUM(
          CASE 
            WHEN cm.receiver_id = ? AND cm.is_read = 0 THEN 1 
            ELSE 0 
          END
        ), 0) AS unread_count,
        MAX(cm.created_at) AS last_message_at
      FROM users u
      LEFT JOIN chat_messages cm
        ON (
          (cm.sender_id = u.id AND cm.receiver_id = ?)
          OR
          (cm.sender_id = ? AND cm.receiver_id = u.id)
        )
      WHERE u.role = 'student'
        AND u.supervisor_id = ?
      GROUP BY u.id, u.name, u.email
      ORDER BY last_message_at IS NULL, last_message_at DESC
      `,
      [supervisorId, supervisorId, supervisorId, supervisorId]
    );

    res.json({ success: true, students: rows });
  } catch (err) {
    console.error("GET /students error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/messages/:supervisorId/:studentId", async (req, res) => {
  const { supervisorId, studentId } = req.params;

  try {
    const [rows] = await db.execute(
      `
      SELECT 
        id,
        sender_id,
        receiver_id,
        body AS content,
        created_at AS sent_at,
        is_read
      FROM chat_messages
      WHERE 
        (sender_id = ? AND receiver_id = ?)
        OR
        (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
      `,
      [supervisorId, studentId, studentId, supervisorId]
    );

    res.json({ success: true, messages: rows });
  } catch (err) {
    console.error("GET /messages error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/send", async (req, res) => {
  try {
    const sender_id = Number(req.user.id);
    const sender_role = String(req.user.role || "").toLowerCase();

    const receiver_id = Number(req.body.receiver_id);
    const content = String(req.body.content || "").trim();

    if (!sender_id || !receiver_id || !content) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const [[receiver]] = await db.query(
      "SELECT id, role, name FROM users WHERE id=? LIMIT 1",
      [receiver_id]
    );
    const receiver_role = String(receiver?.role || "").toLowerCase();

    const [result] = await db.execute(
      `
      INSERT INTO chat_messages (sender_id, receiver_id, body)
      VALUES (?, ?, ?)
      `,
      [sender_id, receiver_id, content]
    );

    const insertId = result.insertId;

    const [[inserted]] = await db.execute(
      `
      SELECT 
        id,
        sender_id,
        receiver_id,
        body AS content,
        created_at AS sent_at,
        is_read
      FROM chat_messages
      WHERE id = ?
      `,
      [insertId]
    );

    const [[fullMsg]] = await db.query("SELECT * FROM chat_messages WHERE id=?", [
      insertId,
    ]);

    const io = getIO();
    io.to(`user:${receiver_id}`).emit("chat:newMessage", fullMsg);
    io.to(`user:${sender_id}`).emit("chat:newMessage", fullMsg);

    if (sender_role === "admin" && receiver_role === "supervisor") {
      const [[sender]] = await db.query("SELECT name FROM users WHERE id=?", [
        sender_id,
      ]);
      const senderName = sender?.name || "Admin";

      const data = JSON.stringify({
        type: "chat",
        partnerId: sender_id,
        route: "chat",
      });

      const [notifInsert] = await db.execute(
        "INSERT INTO notifications (user_id, type, message, is_read, data) VALUES (?, ?, ?, 0, ?)",
        [receiver_id, "chat", `New message from ${senderName}`, data]
      );

      const [[notif]] = await db.query("SELECT * FROM notifications WHERE id=?", [
        notifInsert.insertId,
      ]);

      io.to(`user:${receiver_id}`).emit("notifications:new", notif);

      try {
        await sendPushNotificationToUser(
          receiver_id,
          "New Message",
          `${senderName}: ${content}`.slice(0, 120),
          { type: "chat", partnerId: sender_id }
        );
      } catch {}
    }

    res.json({ success: true, message: "Message sent", data: inserted });
  } catch (err) {
    console.error("POST /send error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/read", async (req, res) => {
  try {
    const supervisorId = Number(req.body.supervisorId || req.user.id);
    const studentId = Number(req.body.studentId);

    await db.execute(
      `
      UPDATE chat_messages
      SET is_read = 1
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
      `,
      [studentId, supervisorId]
    );

    try {
      const io = getIO();
      io.to(`user:${supervisorId}`).emit("chat:readAll", { partnerId: Number(studentId) });
      io.to(`user:${studentId}`).emit("chat:readAll", { partnerId: Number(supervisorId) });
    } catch {}

    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    console.error("POST /read error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.put("/message/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const content = String(req.body.content || "").trim();

    if (!content) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    await db.execute(
      `
      UPDATE chat_messages
      SET body = ?
      WHERE id = ?
      `,
      [content, messageId]
    );

    res.json({ success: true, message: "Message updated" });
  } catch (err) {
    console.error("PUT /message error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/message/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    await db.execute("DELETE FROM chat_messages WHERE id = ?", [messageId]);

    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("DELETE /message error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
