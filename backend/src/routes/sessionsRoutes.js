import express from "express";
import pool from "../config/db.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * Supervisor: create session
 * POST /api/sessions
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "supervisor") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, description = null, starts_at, ends_at, meeting_url = null } = req.body;
    if (!title || !starts_at || !ends_at) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const supervisorId = req.user.id;

    const [r] = await pool.execute(
      `INSERT INTO supervisor_sessions
        (supervisor_id, title, description, starts_at, ends_at, meeting_url, status)
       VALUES (?,?,?,?,?,?, 'scheduled')`,
      [supervisorId, title, description, starts_at, ends_at, meeting_url]
    );

    res.json({ ok: true, id: r.insertId });
  } catch (e) {
    console.error("POST /sessions:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Supervisor: list my sessions
 * GET /api/sessions/supervisor
 */
router.get("/supervisor", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "supervisor") return res.status(403).json({ message: "Forbidden" });

    const [rows] = await pool.execute(
      `SELECT * FROM supervisor_sessions
       WHERE supervisor_id=?
       ORDER BY starts_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (e) {
    console.error("GET /sessions/supervisor:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Student: list sessions for my supervisor
 * GET /api/sessions/student
 *
 */
router.get("/student", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student") return res.status(403).json({ message: "Forbidden" });

    const studentId = req.user.id;

    //  get ALL supervisors for this student
    const [supRows] = await pool.execute(
      `SELECT supervisor_id FROM supervisor_students WHERE student_id=?`,
      [studentId]
    );

    if (!supRows.length) return res.json([]);

    const supervisorIds = supRows.map((r) => r.supervisor_id);

    //  fetch sessions for ALL supervisors (not cancelled)
    const [rows] = await pool.execute(
      `SELECT * FROM supervisor_sessions
       WHERE supervisor_id IN (${supervisorIds.map(() => "?").join(",")})
         AND status <> 'cancelled'
       ORDER BY starts_at ASC`,
      supervisorIds
    );

    res.json(rows);
  } catch (e) {
    console.error("GET /sessions/student:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Supervisor: update session (reschedule/cancel/edit)
 * PATCH /api/sessions/:id
 */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "supervisor") return res.status(403).json({ message: "Forbidden" });

    const id = Number(req.params.id);
    const supervisorId = req.user.id;

    let {
      title,
      description,
      starts_at,
      ends_at,
      meeting_url,
      status,
      change_note,
    } = req.body;

    // convert undefined -> null
    title = title ?? null;
    description = description ?? null;
    starts_at = starts_at ?? null;
    ends_at = ends_at ?? null;
    meeting_url = meeting_url ?? null;
    status = status ?? null;
    change_note = change_note ?? null;

    const [[own]] = await pool.execute(
      `SELECT id FROM supervisor_sessions WHERE id=? AND supervisor_id=?`,
      [id, supervisorId]
    );
    if (!own) return res.status(404).json({ message: "Not found" });

    await pool.execute(
      `UPDATE supervisor_sessions SET
        title=COALESCE(?, title),
        description=COALESCE(?, description),
        starts_at=COALESCE(?, starts_at),
        ends_at=COALESCE(?, ends_at),
        meeting_url=COALESCE(?, meeting_url),
        status=COALESCE(?, status),
        change_note=COALESCE(?, change_note)
       WHERE id=?`,
      [title, description, starts_at, ends_at, meeting_url, status, change_note, id]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("PATCH /sessions/:id:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Supervisor: delete session permanently
 * DELETE /api/sessions/:id
 */
/**
 * Supervisor: delete session (ONLY if cancelled)
 * DELETE /api/sessions/:id
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "supervisor") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const id = Number(req.params.id);
    const supervisorId = req.user.id;

    
    const [[row]] = await pool.execute(
      `
      SELECT id, status 
      FROM supervisor_sessions 
      WHERE id = ? AND supervisor_id = ?
      `,
      [id, supervisorId]
    );

    if (!row) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (row.status !== "cancelled") {
      return res.status(400).json({
        message: "Only cancelled sessions can be deleted",
      });
    }

    await pool.execute(
      `DELETE FROM supervisor_sessions WHERE id = ?`,
      [id]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /sessions/:id:", e);
    res.status(500).json({ message: "Server error" });
  }
});




export default router;
