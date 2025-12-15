import db from "../config/db.js";

// ✅ إضافة تعليق
export const addComment = async (req, res) => {
   try {
    const { id } = req.params; // challenge id
    const { content } = req.body;
    const userId = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    await db.query(
      "INSERT INTO challenge_comments (challenge_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())",
      [id, userId, content]
    );

    res.status(201).json({ message: "✅ Comment added successfully" });
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// ✅ جلب التعليقات
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT c.id, c.content, c.created_at, u.name AS user_name
      FROM challenge_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.challenge_id = ?
      ORDER BY c.created_at DESC
      `,
      [id]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching comments:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// ✅ حذف تعليق
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await db.query(
      "DELETE FROM challenge_comments WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Comment not found or not yours" });

    res.json({ message: "✅ Comment deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting comment:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

// ✅ إعجابات
export const addLike = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    await db.query("INSERT INTO submission_likes (submission_id, user_id) VALUES (?, ?)", [id, user_id]);
    res.json({ message: "Liked ❤️" });
  } catch (err) {
    res.status(500).json({ error: "Error adding like" });
  }
};

export const removeLike = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    await db.query("DELETE FROM submission_likes WHERE submission_id=? AND user_id=?", [id, user_id]);
    res.json({ message: "Unliked 💔" });
  } catch (err) {
    res.status(500).json({ error: "Error removing like" });
  }
};

export const getLikesCount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS likes FROM submission_likes WHERE submission_id=?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error counting likes" });
  }
};
