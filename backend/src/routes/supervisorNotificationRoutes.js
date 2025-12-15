import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import db from "../config/db.js";

const router = express.Router();

router.post("/fcm-token", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return res.status(400).json({ message: "Token required" });
    }

    await db.query(
      "UPDATE users SET fcm_token = ? WHERE id = ?",
      [fcm_token, userId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("save supervisor fcm error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
