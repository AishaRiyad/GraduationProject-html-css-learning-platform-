import db from "../config/db.js";



export const saveAdminFcmToken = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "FCM token is required" });
    }

    await db.query(
      "UPDATE users SET fcm_token = ? WHERE id = ? AND role = 'admin'",
      [token, adminId]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(" saveAdminFcmToken error:", e);
    res.status(500).json({ message: "Error saving FCM token" });
  }
  };

export const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.user.id;
    const limit = Number(req.query.limit) || 20;

    const [rows] = await db.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY is_read ASC, created_at DESC
      LIMIT ?
      `,
      [adminId, limit]
    );

    res.json(rows);
  } catch (e) {
    console.error("getAdminNotifications error:", e);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markAdminNotificationRead = async (req, res) => {
  try {
    const adminId = req.user.id;
    const id = Number(req.params.id);

    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [id, adminId]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("markAdminNotificationRead error:", e);
    res.status(500).json({ message: "Error updating notification" });
  }
};
