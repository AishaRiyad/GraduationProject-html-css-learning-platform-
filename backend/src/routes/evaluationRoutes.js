import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { notifyAdminsEvaluation } from "../utils/notifyAdminsEvaluation.js";

const router = express.Router();

router.get("/supervisor/students", requireAuth, async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const [rows] = await pool.execute(
      `
      SELECT 
        u.id AS user_id,
        COALESCE(p.full_name, u.name) AS full_name
      FROM supervisor_students ss
      JOIN users u ON u.id = ss.student_id
      LEFT JOIN profile p ON p.user_id = u.id
      WHERE ss.supervisor_id = ?
      ORDER BY full_name
      `,
      [supervisorId]
    );

    res.json(rows);
  } catch (e) {
    console.error("GET /evaluations/supervisor/students:", e);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/student/supervisors", requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await pool.execute(
      `
      SELECT 
        u.id AS supervisor_id,
        COALESCE(p.full_name, u.name) AS full_name
      FROM supervisor_students ss
      JOIN users u ON u.id = ss.supervisor_id
      LEFT JOIN profile p ON p.user_id = u.id
      WHERE ss.student_id = ?
      ORDER BY full_name
      `,
      [studentId]
    );

    res.json(rows);
  } catch (e) {
    console.error("GET /evaluations/student/supervisors:", e);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const evaluatorId = Number(req.user.id);

    const {
      direction,
      evaluatee_user_id,
      rating_overall = 5,
      rating_communication = null,
      rating_support = null,
      rating_feedback = null,
      comment = "",
    } = req.body;

    if (!direction || !evaluatee_user_id) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await pool.execute(
      `
      INSERT INTO evaluations
        (evaluator_user_id, evaluatee_user_id, direction,
         rating_overall, rating_communication, rating_support, rating_feedback,
         comment)
      VALUES (?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        rating_overall = VALUES(rating_overall),
        rating_communication = VALUES(rating_communication),
        rating_support = VALUES(rating_support),
        rating_feedback = VALUES(rating_feedback),
        comment = VALUES(comment),
        created_at = CURRENT_TIMESTAMP
      `,
      [
        evaluatorId,
        Number(evaluatee_user_id),
        direction,
        Number(rating_overall),
        rating_communication,
        rating_support,
        rating_feedback,
        comment,
      ]
    );

    try {
      await notifyAdminsEvaluation({
        direction,
        evaluatorId: Number(evaluatorId),
        evaluateeId: Number(evaluatee_user_id),
      });
    } catch (err) {
      console.error("notifyAdminsEvaluation error:", err);
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("POST /evaluations:", e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
