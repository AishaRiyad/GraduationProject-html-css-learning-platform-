// backend/src/controllers/notificationController.js
import admin from "../firebaseAdmin.js";
import db from "../config/db.js";

export async function sendMessage(req, res) {
  try {
    const { token, title, body } = req.body;

    await admin.messaging().send({
      token,
      notification: { title, body },
    });

    res.json({ success: true });
  } catch (err) {
    console.log("sendMessage Error:", err);
    res.status(500).json({ error: "FCM Error" });
  }
}

export async function listMyNotifications(req, res) {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 10;

    const [rows] = await db.query(
      `
      SELECT id, type, message, is_read, created_at, data
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [userId, limit]
    );

    res.json(rows);
  } catch (e) {
    console.error("listMyNotifications:", e);
    res.status(500).json({ message: "Failed to load notifications" });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    await db.execute(
      "UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?",
      [id, userId]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("markNotificationRead:", e);
    res.status(500).json({ message: "Failed to update notification" });
  }
}
