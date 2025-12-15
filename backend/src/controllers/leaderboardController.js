import db from "../config/db.js";

// ✅ جلب لوحة المتصدرين
export const getLeaderboard = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.*, u.full_name, u.photo_url
       FROM leaderboard l
       JOIN users u ON l.user_id = u.id
       ORDER BY l.total_points DESC LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching leaderboard" });
  }
};

// ✅ تحديث نقاط المستخدم بعد تقييم AI
export const updateUserPoints = async (req, res) => {
  try {
    const { user_id, points } = req.body;
    await db.query(
      "UPDATE leaderboard SET total_points = total_points + ? WHERE user_id = ?",
      [points, user_id]
    );
    res.json({ message: "User points updated ✅" });
  } catch (err) {
    res.status(500).json({ error: "Error updating points" });
  }
};
