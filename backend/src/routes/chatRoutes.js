import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import db from "../config/db.js";
import { getIO } from "../socket.js";

const router = Router();
router.use(protect);

router.get("/partners", async (req, res) => {
  try {
    const myRole = req.user.role;
    const myId = req.user.id;

    if (myRole === "admin") {
      const [rows] = await db.query(
        "SELECT id, name, email, role FROM users WHERE role IN ('student','supervisor') ORDER BY name ASC"
      );
      return res.json(rows);
    }

    if (myRole === "supervisor") {
      const [rows] = await db.query(
        "SELECT id, name, email, role FROM users WHERE role IN ('student','admin') ORDER BY name ASC"
      );
      return res.json(rows);
    }

    const [admins] = await db.query(
      "SELECT id, name, email, role FROM users WHERE role='admin' ORDER BY name ASC"
    );

    const [[me]] = await db.query(
      "SELECT supervisor_id FROM users WHERE id=? AND role='student' LIMIT 1",
      [myId]
    );

    let supervisorRow = [];
    if (me?.supervisor_id) {
      const [sup] = await db.query(
        "SELECT id, name, email, role FROM users WHERE id=? AND role='supervisor' LIMIT 1",
        [me.supervisor_id]
      );
      supervisorRow = sup;
    }

    return res.json([...admins, ...supervisorRow]);
  } catch (e) {
    console.error("GET /chat/partners:", e);
    res.status(500).json({ message: "Failed to load chat partners." });
  }
});

router.get("/thread/:userId", async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = Number(req.params.userId);

    if (!otherId) return res.status(400).json({ message: "Target user ID is required." });

    const [rows] = await db.query(
      `
      SELECT id, sender_id, receiver_id, body, is_read, created_at
      FROM chat_messages
      WHERE (sender_id=? AND receiver_id=?)
         OR (sender_id=? AND receiver_id=?)
      ORDER BY created_at ASC
      `,
      [myId, otherId, otherId, myId]
    );

    res.json(rows);
  } catch (e) {
    console.error("GET /chat/thread:", e);
    res.status(500).json({ message: "Failed to load messages." });
  }
});

router.post("/thread/:userId", async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = Number(req.params.userId);
    const body = (req.body?.body || "").trim();

    if (!otherId) return res.status(400).json({ message: "Target user ID is required." });
    if (!body) return res.status(400).json({ message: "Message body is required." });

    const [ins] = await db.execute(
      "INSERT INTO chat_messages (sender_id, receiver_id, body) VALUES (?,?,?)",
      [myId, otherId, body]
    );

    const [[msg]] = await db.query("SELECT * FROM chat_messages WHERE id=?", [ins.insertId]);

    let senderName = "User";
    try {
      const [[sender]] = await db.query("SELECT name FROM users WHERE id=? LIMIT 1", [myId]);
      if (sender?.name) senderName = sender.name;
    } catch {}

    let notifRow = null;
    try {
      const data = JSON.stringify({ partnerId: myId, route: "chat" });
      const [notifIns] = await db.execute(
        "INSERT INTO notifications (user_id, type, message, is_read, data) VALUES (?, ?, ?, 0, ?)",
        [otherId, "chat.message", `New message from ${senderName}`, data]
      );

      const [[notif]] = await db.query("SELECT * FROM notifications WHERE id=?", [
        notifIns.insertId,
      ]);
      notifRow = notif || null;
      console.log("NOTIF_INSERT_ID:", notifIns.insertId);
    } catch (e) {
      console.error("NOTIF_INSERT_ERROR:", e);
    }

    try {
      const io = getIO();
      io.to(`user:${otherId}`).emit("chat:newMessage", msg);
      io.to(`user:${myId}`).emit("chat:newMessage", msg);

      io.to(`user:${otherId}`).emit("new_unread_message", {
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        body: msg.body,
        id: msg.id,
        created_at: msg.created_at,
        is_read: msg.is_read,
      });

      if (notifRow) {
        io.to(`user:${otherId}`).emit("notifications:new", notifRow);
      }
    } catch {}

    res.status(201).json(msg);
  } catch (e) {
    console.error("POST /chat/thread:", e);
    res.status(500).json({ message: "Failed to send message." });
  }
});

router.post("/thread/:userId/read", async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = Number(req.params.userId);

    if (!otherId) return res.status(400).json({ message: "Target user ID is required." });

    await db.execute(
      `
      UPDATE chat_messages
      SET is_read=1
      WHERE receiver_id=? AND sender_id=? AND is_read=0
      `,
      [myId, otherId]
    );

    try {
      const io = getIO();
      io.to(`user:${myId}`).emit("chat:readAll", { partnerId: otherId });
      io.to(`user:${otherId}`).emit("chat:readAll", { partnerId: myId });
    } catch {}

    res.json({ ok: true });
  } catch (e) {
    console.error("POST /chat/thread/:userId/read:", e);
    res.status(500).json({ message: "Failed to mark read." });
  }
});

router.put("/messages/:messageId", async (req, res) => {
  try {
    const myId = req.user.id;
    const messageId = Number(req.params.messageId);
    const newText = (req.body?.body || req.body?.text || "").trim();

    if (!messageId) return res.status(400).json({ message: "Invalid message ID." });
    if (!newText) return res.status(400).json({ message: "Message body is required." });

    const [[msg]] = await db.query("SELECT * FROM chat_messages WHERE id=?", [messageId]);
    if (!msg) return res.status(404).json({ message: "Message not found." });
    if (msg.sender_id !== myId) return res.status(403).json({ message: "Unauthorized edit." });

    await db.execute("UPDATE chat_messages SET body=? WHERE id=?", [newText, messageId]);
    const [[updated]] = await db.query("SELECT * FROM chat_messages WHERE id=?", [messageId]);

    res.json(updated);
  } catch (e) {
    console.error("PUT /chat/messages:", e);
    res.status(500).json({ message: "Failed to update message." });
  }
});

router.delete("/messages/:messageId", async (req, res) => {
  try {
    const myId = req.user.id;
    const messageId = Number(req.params.messageId);

    if (!messageId) return res.status(400).json({ message: "Message ID is required." });

    const [[msg]] = await db.query("SELECT * FROM chat_messages WHERE id=?", [messageId]);
    if (!msg) return res.status(404).json({ message: "Message not found." });
    if (msg.sender_id !== myId) return res.status(403).json({ message: "Unauthorized delete." });

    await db.execute("DELETE FROM chat_messages WHERE id=?", [messageId]);
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /chat/messages:", e);
    res.status(500).json({ message: "Failed to delete message." });
  }
});

router.get("/header-messages", async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        (
          SELECT body
          FROM chat_messages
          WHERE (sender_id=u.id AND receiver_id=?)
         OR   (sender_id=? AND receiver_id=u.id)
          ORDER BY created_at DESC
          LIMIT 1
        ) AS lastMessage,
        (
          SELECT COUNT(*)
          FROM chat_messages
          WHERE receiver_id=? AND sender_id=u.id AND is_read=0
        ) AS unread
      FROM users u
      WHERE u.role IN ('admin','supervisor','student') 
        AND u.id <> ?
      ORDER BY u.name ASC
      `,
      [userId, userId, userId, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /chat/header-messages error:", err);
    res.status(500).json({ message: "Server error in header messages" });
  }
});

export default router;
