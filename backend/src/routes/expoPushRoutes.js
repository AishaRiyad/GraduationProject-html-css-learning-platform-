import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.post("/save-expo-token", async (req, res) => {
  const { userId, expoToken } = req.body;

  if (!userId || !expoToken) {
    return res.status(400).json({ message: "Missing data" });
  }

  // نخزن التوكن
  await pool.query(
    "INSERT INTO expo_tokens (user_id, expo_token) VALUES (?, ?) ON DUPLICATE KEY UPDATE expo_token = ?",
    [userId, expoToken, expoToken]
  );

  res.json({ success: true });
});

export default router;
