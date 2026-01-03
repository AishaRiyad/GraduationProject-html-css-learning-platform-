import db from "../config/db.js";
import { getIO } from "../socket.js";
import { sendPushNotificationToUser } from "../utils/pushNotifications.js";

export async function listChatPartners(req, res) {
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
        "SELECT id, name, email, role FROM users WHERE role IN ('admin','student') ORDER BY name ASC"
      );
      return res.json(rows);
    }

    const [admins] = await db.query(
      "SELECT id, name, email, role FROM users WHERE role = 'admin' ORDER BY name ASC"
    );

    const [[me]] = await db.query(
      "SELECT supervisor_id FROM users WHERE id = ? AND role = 'student' LIMIT 1",
      [myId]
    );

    let supervisorRow = [];
    if (me?.supervisor_id) {
      const [sup] = await db.query(
        "SELECT id, name, email, role FROM users WHERE id = ? AND role = 'supervisor' LIMIT 1",
        [me.supervisor_id]
      );
      supervisorRow = sup;
    }

    return res.json([...admins, ...supervisorRow]);
  } catch (e) {
    console.error("listChatPartners:", e);
    res
      .status(500)
      .json({ message: "Internal server error while loading chat partners." });
  }
}

export async function getThreadWithUser(req, res) {
  try {
    const myId = req.user.id;
    const otherId = Number(req.params.userId);

    if (!otherId)
      return res.status(400).json({ message: "Target user ID is required." });

    const [rows] = await db.query(
      `
      SELECT id, sender_id, receiver_id, body, is_read, created_at,
             message_type, file_url, file_name, file_mime, file_size
      FROM chat_messages
      WHERE (sender_id=? AND receiver_id=?)
         OR (sender_id=? AND receiver_id=?)
      ORDER BY created_at ASC
      `,
      [myId, otherId, otherId, myId]
    );

    res.json(rows);
  } catch (e) {
    console.error("getThreadWithUser:", e);
    res
      .status(500)
      .json({ message: "Internal server error while loading messages." });
  }
}

export async function sendMessageToUser(req, res) {
  try {
    const myId = req.user.id;
    const myRole = req.user.role;

    const otherId = Number(req.params.userId);
    const body = String(req.body?.body || "").trim();
    const file = req.file || null;

    if (!otherId) return res.status(400).json({ message: "Invalid message" });
    if (!body && !file)
      return res.status(400).json({ message: "Invalid message" });

    let messageType = "text";
    let fileUrl = null;
    let fileName = null;
    let fileMime = null;
    let fileSize = null;

    if (file) {
      fileUrl = `/uploads/chat/${file.filename}`;
      fileName = file.originalname;
      fileMime = file.mimetype;
      fileSize = file.size;

      if (String(file.mimetype || "").startsWith("image/")) messageType = "image";
      else if (String(file.mimetype || "").startsWith("audio/")) messageType = "audio";
      else messageType = "file";
    }

    const [insertResult] = await db.execute(
      `INSERT INTO chat_messages (sender_id, receiver_id, body, message_type, file_url, file_name, file_mime, file_size)
       VALUES (?,?,?,?,?,?,?,?)`,
      [myId, otherId, body || null, messageType, fileUrl, fileName, fileMime, fileSize]
    );

    const [[msg]] = await db.query(
      `SELECT id, sender_id, receiver_id, body, is_read, created_at,
              message_type, file_url, file_name, file_mime, file_size
       FROM chat_messages WHERE id=?`,
      [insertResult.insertId]
    );

    const io = getIO();
    io.to(`user:${otherId}`).emit("chat:newMessage", msg);
    io.to(`user:${myId}`).emit("chat:newMessage", msg);

    const [[receiver]] = await db.query(
      "SELECT role FROM users WHERE id=? LIMIT 1",
      [otherId]
    );
    const receiverRole = receiver?.role;

    if (myRole === "admin" && receiverRole === "supervisor") {
      const [[sender]] = await db.query("SELECT name FROM users WHERE id=?", [
        myId,
      ]);
      const senderName = sender?.name || "Admin";

      const data = JSON.stringify({
        type: "chat",
        partnerId: myId,
        route: "chat",
      });

      const notifPreview =
        messageType === "text"
          ? body
          : messageType === "image"
          ? "Sent an image"
          : messageType === "audio"
          ? "Sent a voice message"
          : "Sent a file";

      const [notifInsert] = await db.execute(
        "INSERT INTO notifications (user_id, type, message, is_read, data) VALUES (?, ?, ?, 0, ?)",
        [otherId, "chat", `New message from ${senderName}: ${String(notifPreview).slice(0, 120)}`, data]
      );

      const [[notif]] = await db.query(
        "SELECT * FROM notifications WHERE id=?",
        [notifInsert.insertId]
      );

      io.to(`user:${otherId}`).emit("notifications:new", notif);

      try {
        await sendPushNotificationToUser(
          otherId,
          "New Message",
          `${senderName}: ${String(notifPreview).slice(0, 120)}`,
          { type: "chat", partnerId: myId }
        );
      } catch {}
    }

    res.status(201).json(msg);
  } catch (e) {
    console.error("sendMessageToUser error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateMessage(req, res) {
  try {
    const messageId = Number(req.params.messageId);
    const myId = req.user.id;

    if (!messageId)
      return res.status(400).json({ message: "Invalid message ID." });

    const newText = (req.body.body || req.body.text || "").trim();
    if (!newText)
      return res.status(400).json({ message: "Message body is required." });

    const [[msg]] = await db.query("SELECT * FROM chat_messages WHERE id=?", [
      messageId,
    ]);
    if (!msg) return res.status(404).json({ message: "Message not found." });
    if (msg.sender_id !== myId)
      return res.status(403).json({ message: "Unauthorized edit." });

    await db.query("UPDATE chat_messages SET body=? WHERE id=?", [
      newText,
      messageId,
    ]);

    const [[updated]] = await db.query(
      `SELECT id, sender_id, receiver_id, body, is_read, created_at,
              message_type, file_url, file_name, file_mime, file_size
       FROM chat_messages WHERE id=?`,
      [messageId]
    );
    res.json(updated);
  } catch (e) {
    console.error("updateMessage:", e);
    res
      .status(500)
      .json({ message: "Internal server error while updating message." });
  }
}

export async function deleteMessage(req, res) {
  try {
    const myId = req.user.id;
    const msgId = Number(req.params.messageId);

    if (!msgId)
      return res.status(400).json({ message: "Message ID is required." });

    const [[msg]] = await db.query("SELECT * FROM chat_messages WHERE id=?", [
      msgId,
    ]);
    if (!msg) return res.status(404).json({ message: "Message not found." });
    if (msg.sender_id !== myId)
      return res.status(403).json({ message: "Unauthorized delete." });

    await db.execute("DELETE FROM chat_messages WHERE id=?", [msgId]);
    res.json({ ok: true, message: "Message deleted successfully." });
  } catch (e) {
    console.error("deleteMessage:", e);
    res
      .status(500)
      .json({ message: "Internal server error while deleting message." });
  }
}

export async function markThreadRead(req, res) {
  try {
    const myId = req.user.id;
    const otherId = Number(req.params.userId);

    if (!otherId)
      return res.status(400).json({ message: "Target user ID is required." });

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
    console.error("markThreadRead:", e);
    res
      .status(500)
      .json({ message: "Internal server error while marking read." });
  }
}
