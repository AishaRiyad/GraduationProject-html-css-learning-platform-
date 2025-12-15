import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/students", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id AS user_id, name AS full_name, email, '/user-avatar.jpg' AS photo_url
       FROM users
       WHERE role = 'student'
       ORDER BY name`
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /students error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
