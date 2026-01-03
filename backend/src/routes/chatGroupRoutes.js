// backend/src/routes/chatGroupRoutes.js
import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import db from "../config/db.js";
import { getIO } from "../socket.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { sendPushNotificationToUser } from "../utils/pushNotifications.js";

const router = Router();
router.use(protect);

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "chat-groups");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = String(file.originalname || "file").replace(/[^\w.-]/g, "_");
    cb(null, `${Date.now()}_${Math.random().toString(16).slice(2)}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const normRole = (r) => String(r || "").trim().toLowerCase();

async function getGroupMembers(groupId) {
  const [rows] = await db.query(
    `SELECT user_id FROM chat_group_members WHERE group_id=?`,
    [groupId]
  );
  return (rows || []).map((r) => Number(r.user_id)).filter(Boolean);
}

async function getUserName(userId) {
  try {
    const [[u]] = await db.query("SELECT name FROM users WHERE id=? LIMIT 1", [userId]);
    return u?.name || "User";
  } catch {
    return "User";
  }
}

function previewForType(messageType, body) {
  if (messageType === "text") return String(body || "").trim();
  if (messageType === "image") return "Sent an image";
  if (messageType === "audio") return "Sent a voice message";
  return "Sent a file";
}

/* ===========================
   GET /mine
   =========================== */
router.get("/mine", async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const myRole = normRole(req.user.role);

    if (myRole === "supervisor") {
      const [rows] = await db.query(
        `
        SELECT 
          g.id,
          g.name,
          g.supervisor_id,
          g.created_at,
          (SELECT COUNT(*) FROM chat_group_members m WHERE m.group_id=g.id) AS members_count
        FROM chat_groups g
        WHERE g.supervisor_id=?
        ORDER BY g.created_at DESC
        `,
        [myId]
      );
      return res.json(rows);
    }

    const [rows] = await db.query(
      `
      SELECT 
        g.id,
        g.name,
        g.supervisor_id,
        g.created_at,
        (SELECT COUNT(*) FROM chat_group_members m WHERE m.group_id=g.id) AS members_count
      FROM chat_group_members m
      JOIN chat_groups g ON g.id = m.group_id
      WHERE m.user_id=?
      ORDER BY g.created_at DESC
      `,
      [myId]
    );

    res.json(rows);
  } catch (e) {
    console.error("GET /chat-groups/mine:", e);
    res.status(500).json({ message: "Failed to load groups." });
  }
});

/* ===========================
   GET /:groupId  (group info + members)
   =========================== */
router.get("/:groupId", async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const groupId = Number(req.params.groupId);
    if (!groupId) return res.status(400).json({ message: "Invalid group id." });

    const [[mem]] = await db.query(
      "SELECT 1 AS ok FROM chat_group_members WHERE group_id=? AND user_id=? LIMIT 1",
      [groupId, myId]
    );
    if (!mem?.ok) return res.status(403).json({ message: "Not a member of this group." });

    const [[group]] = await db.query(
      `SELECT id, name, supervisor_id, created_at FROM chat_groups WHERE id=? LIMIT 1`,
      [groupId]
    );

    const [members] = await db.query(
      `
      SELECT u.id, u.name, u.role
      FROM chat_group_members m
      JOIN users u ON u.id = m.user_id
      WHERE m.group_id=?
      ORDER BY u.name ASC
      `,
      [groupId]
    );

    res.json({ group: group || null, members: members || [] });
  } catch (e) {
    console.error("GET /chat-groups/:groupId:", e);
    res.status(500).json({ message: "Failed to load group." });
  }
});

/* ===========================
   POST /  (create group - supervisor)
   =========================== */
router.post("/", async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const myRole = normRole(req.user.role);
    if (myRole !== "supervisor") return res.status(403).json({ message: "Forbidden" });

    const name = String(req.body?.name || "").trim();
    const memberIds = Array.isArray(req.body?.memberIds) ? req.body.memberIds : [];

    if (!name) return res.status(400).json({ message: "Group name is required." });

    const cleanMemberIds = memberIds
      .map((x) => Number(x))
      .filter((x) => Number.isFinite(x) && x > 0);

    const [ins] = await db.execute("INSERT INTO chat_groups (supervisor_id, name) VALUES (?, ?)", [
      myId,
      name,
    ]);
    const groupId = ins.insertId;

    await db.execute("INSERT IGNORE INTO chat_group_members (group_id, user_id) VALUES (?, ?)", [
      groupId,
      myId,
    ]);

    if (cleanMemberIds.length > 0) {
      const [allowed] = await db.query(
        `
        SELECT student_id
        FROM supervisor_students
        WHERE supervisor_id=? AND student_id IN (${cleanMemberIds.map(() => "?").join(",")})
        `,
        [myId, ...cleanMemberIds]
      );

      const allowedIds = (allowed || []).map((r) => Number(r.student_id)).filter(Boolean);

      for (const uid of allowedIds) {
        await db.execute("INSERT IGNORE INTO chat_group_members (group_id, user_id) VALUES (?, ?)", [
          groupId,
          uid,
        ]);
      }
    }

    const [[row]] = await db.query("SELECT * FROM chat_groups WHERE id=?", [groupId]);
    res.status(201).json(row);
  } catch (e) {
    console.error("POST /chat-groups:", e);
    res.status(500).json({ message: "Failed to create group." });
  }
});

/* ===========================
   POST /:groupId/add-members (supervisor owner)
   =========================== */
router.post("/:groupId/add-members", async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const myRole = normRole(req.user.role);
    const groupId = Number(req.params.groupId);
    const memberIds = Array.isArray(req.body?.memberIds) ? req.body.memberIds : [];

    if (!groupId) return res.status(400).json({ message: "Invalid group id." });
    if (myRole !== "supervisor") return res.status(403).json({ message: "Only supervisor can add members." });

    const cleanIds = memberIds
      .map((x) => Number(x))
      .filter((x) => Number.isFinite(x) && x > 0);

    if (cleanIds.length === 0) return res.status(400).json({ message: "No members selected." });

    const [[group]] = await db.query(
      "SELECT id, supervisor_id, name FROM chat_groups WHERE id=? LIMIT 1",
      [groupId]
    );
    if (!group?.id) return res.status(404).json({ message: "Group not found." });
    if (Number(group.supervisor_id) !== myId) return res.status(403).json({ message: "Not owner of this group." });

    const [allowed] = await db.query(
      `
      SELECT student_id
      FROM supervisor_students
      WHERE supervisor_id=? AND student_id IN (${cleanIds.map(() => "?").join(",")})
      `,
      [myId, ...cleanIds]
    );
    const allowedIds = (allowed || []).map((r) => Number(r.student_id)).filter(Boolean);
    if (allowedIds.length === 0) return res.status(400).json({ message: "No valid students to add." });

    for (const uid of allowedIds) {
      await db.execute("INSERT IGNORE INTO chat_group_members (group_id, user_id) VALUES (?,?)", [
        groupId,
        uid,
      ]);
    }

    const [members] = await db.query(
      `
      SELECT u.id, u.name, u.role
      FROM chat_group_members m
      JOIN users u ON u.id = m.user_id
      WHERE m.group_id=?
      ORDER BY u.name ASC
      `,
      [groupId]
    );

    try {
      const io = getIO();
      io.to(`group:${groupId}`).emit("group:membersChanged", { groupId });
      allowedIds.forEach((uid) => io.to(`user:${uid}`).emit("group:added", { groupId }));
    } catch {}

    res.json({ success: true, added: allowedIds, members });
  } catch (e) {
    console.error("POST /chat-groups/:groupId/add-members:", e);
    res.status(500).json({ message: "Failed to add members." });
  }
});

/* ===========================
   NEW: DELETE /:groupId/members/:userId  (remove member - supervisor owner)
   =========================== */
router.delete("/:groupId/members/:userId", async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const myRole = normRole(req.user.role);
    const groupId = Number(req.params.groupId);
    const userId = Number(req.params.userId);

    if (!groupId) return res.status(400).json({ message: "Invalid group id." });
    if (!userId) return res.status(400).json({ message: "Invalid user id." });
    if (myRole !== "supervisor") return res.status(403).json({ message: "Forbidden" });

    const [[group]] = await db.query(
      "SELECT id, supervisor_id FROM chat_groups WHERE id=? LIMIT 1",
      [groupId]
    );
    if (!group?.id) return res.status(404).json({ message: "Group not found." });
    if (Number(group.supervisor_id) !== myId) return res.status(403).json({ message: "Not owner of this group." });

    if (Number(userId) === Number(myId)) {
      return res.status(400).json({ message: "Supervisor cannot be removed." });
    }

    await db.execute("DELETE FROM chat_group_members WHERE group_id=? AND user_id=?", [
      groupId,
      userId,
    ]);

    const [members] = await db.query(
      `
      SELECT u.id, u.name, u.role
      FROM chat_group_members m
      JOIN users u ON u.id = m.user_id
      WHERE m.group_id=?
      ORDER BY u.name ASC
      `,
      [groupId]
    );

    try {
      const io = getIO();
      io.to(`group:${groupId}`).emit("group:membersChanged", { groupId });
      io.to(`user:${userId}`).emit("group:removed", { groupId });
    } catch {}

    res.json({ ok: true, members });
  } catch (e) {
    console.error("DELETE /chat-groups/:groupId/members/:userId:", e);
    res.status(500).json({ message: "Failed to remove member." });
  }
});

/* ===========================
   POST /:groupId/messages  (send group msg + notify others)
   + include sender_name in response/event
   =========================== */
router.post("/:groupId/messages", upload.single("file"), async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const groupId = Number(req.params.groupId);
    if (!groupId) return res.status(400).json({ message: "Invalid group id." });

    const [[mem]] = await db.query(
      "SELECT 1 AS ok FROM chat_group_members WHERE group_id=? AND user_id=? LIMIT 1",
      [groupId, myId]
    );
    if (!mem?.ok) return res.status(403).json({ message: "Not a member of this group." });

    const body = String(req.body?.body || "").trim();
    const file = req.file || null;
    if (!body && !file) return res.status(400).json({ message: "Message body is required." });

    let messageType = "text";
    let fileUrl = null;
    let fileName = null;
    let fileMime = null;
    let fileSize = null;

    if (file) {
      fileUrl = `/uploads/chat-groups/${file.filename}`;
      fileName = file.originalname;
      fileMime = file.mimetype;
      fileSize = file.size;

      if (String(fileMime || "").startsWith("image/")) messageType = "image";
      else if (String(fileMime || "").startsWith("audio/")) messageType = "audio";
      else messageType = "file";
    }

    const [ins] = await db.execute(
      `
      INSERT INTO chat_group_messages
      (group_id, sender_id, body, message_type, file_url, file_name, file_mime, file_size)
      VALUES (?,?,?,?,?,?,?,?)
      `,
      [groupId, myId, body || "", messageType, fileUrl, fileName, fileMime, fileSize]
    );

    const [[msg]] = await db.query(
      `
      SELECT 
        m.id, m.group_id, m.sender_id, u.name AS sender_name,
        m.body, m.message_type, m.file_url, m.file_name, m.file_mime, m.file_size, m.created_at
      FROM chat_group_messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.id=?
      `,
      [ins.insertId]
    );

    let notifRowsByUser = {};
    try {
      const [[g]] = await db.query("SELECT id, name FROM chat_groups WHERE id=? LIMIT 1", [groupId]);
      const groupName = g?.name || "Group";

      const senderName = msg?.sender_name || (await getUserName(myId));
      const preview = previewForType(messageType, body);
      const memberIds = await getGroupMembers(groupId);
      const targets = memberIds.filter((uid) => Number(uid) !== Number(myId));

      for (const uid of targets) {
        const data = JSON.stringify({ type: "group", groupId, route: "chat", tab: "groups" });

        const [notifIns] = await db.execute(
          "INSERT INTO notifications (user_id, type, message, is_read, data) VALUES (?, ?, ?, 0, ?)",
          [uid, "group.message", `${groupName} • ${senderName}: ${String(preview).slice(0, 120)}`, data]
        );

        const [[notif]] = await db.query("SELECT * FROM notifications WHERE id=?", [notifIns.insertId]);
        if (notif) notifRowsByUser[uid] = notif;

        try {
          await sendPushNotificationToUser(
            uid,
            `New message in ${groupName}`,
            `${senderName}: ${String(preview).slice(0, 120)}`,
            { type: "group", groupId }
          );
        } catch {}
      }
    } catch (e) {
      console.error("GROUP_NOTIF_ERROR:", e);
    }

    try {
      const io = getIO();
      const memberIds = await getGroupMembers(groupId);

      io.to(`group:${groupId}`).emit("group:newMessage", msg);
      memberIds.forEach((uid) => io.to(`user:${uid}`).emit("group:newMessage", msg));

      Object.keys(notifRowsByUser || {}).forEach((uid) => {
        const notif = notifRowsByUser[uid];
        if (notif) io.to(`user:${uid}`).emit("notifications:new", notif);
      });
    } catch {}

    res.status(201).json(msg);
  } catch (e) {
    console.error("POST /chat-groups/:groupId/messages:", e);
    res.status(500).json({ message: "Failed to send group message." });
  }
});

/* ===========================
   GET /:groupId/messages
   + include sender_name
   =========================== */
router.get("/:groupId/messages", async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const groupId = Number(req.params.groupId);
    if (!groupId) return res.status(400).json({ message: "Invalid group id." });

    const [[mem]] = await db.query(
      "SELECT 1 AS ok FROM chat_group_members WHERE group_id=? AND user_id=? LIMIT 1",
      [groupId, myId]
    );
    if (!mem?.ok) return res.status(403).json({ message: "Not a member of this group." });

    const [rows] = await db.query(
      `
      SELECT 
        m.id, m.group_id, m.sender_id, u.name AS sender_name,
        m.body, m.message_type, m.file_url, m.file_name, m.file_mime, m.file_size, m.created_at
      FROM chat_group_messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.group_id=?
      ORDER BY m.created_at ASC
      `,
      [groupId]
    );

    res.json(rows);
  } catch (e) {
    console.error("GET /chat-groups/:groupId/messages:", e);
    res.status(500).json({ message: "Failed to load group messages." });
  }
});

/* ===========================
   DELETE /:groupId/messages/:messageId (sender only)
   =========================== */
router.delete("/:groupId/messages/:messageId", async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const groupId = Number(req.params.groupId);
    const messageId = Number(req.params.messageId);

    if (!groupId) return res.status(400).json({ message: "Invalid group id." });
    if (!messageId) return res.status(400).json({ message: "Invalid message id." });

    const [[mem]] = await db.query(
      "SELECT 1 AS ok FROM chat_group_members WHERE group_id=? AND user_id=? LIMIT 1",
      [groupId, myId]
    );
    if (!mem?.ok) return res.status(403).json({ message: "Not a member of this group." });

    const [[msg]] = await db.query(
      "SELECT * FROM chat_group_messages WHERE id=? AND group_id=? LIMIT 1",
      [messageId, groupId]
    );
    if (!msg) return res.status(404).json({ message: "Message not found." });
    if (Number(msg.sender_id) !== myId) return res.status(403).json({ message: "Unauthorized delete." });

    try {
      const fileUrl = String(msg.file_url || "");
      if (fileUrl.startsWith("/uploads/chat-groups/")) {
        const filename = fileUrl.replace("/uploads/chat-groups/", "");
        const abs = path.join(UPLOAD_DIR, filename);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      }
    } catch (e) {
      console.error("GROUP_FILE_DELETE_ERROR:", e);
    }

    await db.execute("DELETE FROM chat_group_messages WHERE id=? AND group_id=?", [
      messageId,
      groupId,
    ]);

    try {
      const io = getIO();
      const memberIds = await getGroupMembers(groupId);
      io.to(`group:${groupId}`).emit("group:messageDeleted", { groupId, messageId });
      memberIds.forEach((uid) => io.to(`user:${uid}`).emit("group:messageDeleted", { groupId, messageId }));
    } catch {}

    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /chat-groups/:groupId/messages/:messageId:", e);
    res.status(500).json({ message: "Failed to delete message." });
  }
});

/* ===========================
   DELETE /:groupId  (supervisor owner)
   =========================== */
router.delete("/:groupId", async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const myRole = normRole(req.user.role);
    const groupId = Number(req.params.groupId);
    if (!groupId) return res.status(400).json({ message: "Invalid group id." });

    if (myRole !== "supervisor") return res.status(403).json({ message: "Forbidden" });

    const [[g]] = await db.query("SELECT id, supervisor_id FROM chat_groups WHERE id=? LIMIT 1", [
      groupId,
    ]);
    if (!g?.id) return res.status(404).json({ message: "Group not found." });
    if (Number(g.supervisor_id) !== myId) return res.status(403).json({ message: "Forbidden" });

    await db.execute("DELETE FROM chat_group_messages WHERE group_id=?", [groupId]);
    await db.execute("DELETE FROM chat_group_members WHERE group_id=?", [groupId]);
    await db.execute("DELETE FROM chat_groups WHERE id=?", [groupId]);

    try {
      const io = getIO();
      io.to(`group:${groupId}`).emit("group:deleted", { groupId });
    } catch {}

    res.json({ success: true, message: "Group deleted" });
  } catch (e) {
    console.error("DELETE /chat-groups/:groupId:", e);
    res.status(500).json({ message: "Failed to delete group." });
  }
});

/* ===========================
   DELETE /:groupId/leave
   =========================== */
router.delete("/:groupId/leave", async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const myRole = normRole(req.user.role);
    const groupId = Number(req.params.groupId);
    if (!groupId) return res.status(400).json({ message: "Invalid group id." });

    const [[g]] = await db.query("SELECT id, supervisor_id FROM chat_groups WHERE id=? LIMIT 1", [
      groupId,
    ]);
    if (!g?.id) return res.status(404).json({ message: "Group not found." });

    if (Number(g.supervisor_id) === myId) {
      return res.status(400).json({ message: "Supervisor cannot leave own group. Delete it instead." });
    }

    const [[mem]] = await db.query(
      "SELECT 1 AS ok FROM chat_group_members WHERE group_id=? AND user_id=? LIMIT 1",
      [groupId, myId]
    );
    if (!mem?.ok) return res.status(403).json({ message: "Not a member of this group." });

    await db.execute("DELETE FROM chat_group_members WHERE group_id=? AND user_id=?", [groupId, myId]);

    try {
      const io = getIO();
      io.to(`group:${groupId}`).emit("group:membersChanged", { groupId });
      io.to(`user:${myId}`).emit("group:left", { groupId });
    } catch {}

    res.json({ success: true, message: "Left group" });
  } catch (e) {
    console.error("DELETE /chat-groups/:groupId/leave:", e);
    res.status(500).json({ message: "Failed to leave group." });
  }
});

export default router;
