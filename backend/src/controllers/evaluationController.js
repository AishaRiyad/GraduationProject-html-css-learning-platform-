import db from "../config/db.js";

function meId(req) {
  return Number(req.user?.id);
}

export async function listSupervisorStudents(req, res) {
  try {
    const supervisorId = Number(req.query.supervisorId || meId(req));
    if (!supervisorId) return res.status(400).json({ message: "supervisorId is required" });

    const [rows] = await db.query(
      `
      SELECT DISTINCT
        u.id AS user_id,
        COALESCE(p.full_name, u.name) AS full_name,
        p.profile_image
      FROM tasks t
      JOIN task_assignments ta ON ta.task_id = t.id
      JOIN users u ON u.id = ta.user_id
      LEFT JOIN profile p ON p.user_id = u.id
      WHERE t.supervisor_id = ?
        AND u.role = 'student'
      ORDER BY full_name ASC
      `,
      [supervisorId]
    );

    const ROOT = "http://localhost:5000";
    const formatted = rows.map((r) => ({
      user_id: r.user_id,
      full_name: r.full_name,
      photo_url: r.profile_image
        ? r.profile_image.startsWith("http")
          ? r.profile_image
          : `${ROOT}${r.profile_image}`
        : "/user-avatar.jpg",
    }));

    res.json(formatted);
  } catch (e) {
    console.error("listSupervisorStudents:", e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function listStudentSupervisors(req, res) {
  try {
    const studentId = Number(req.query.studentId || meId(req));
    if (!studentId) return res.status(400).json({ message: "studentId is required" });

    const [rows] = await db.query(
      `
      SELECT DISTINCT
        s.id AS supervisor_id,
        COALESCE(sp.full_name, s.name) AS full_name
      FROM task_assignments ta
      JOIN tasks t ON t.id = ta.task_id
      JOIN users s ON s.id = t.supervisor_id
      LEFT JOIN profile sp ON sp.user_id = s.id
      WHERE ta.user_id = ?
        AND s.role = 'supervisor'
      ORDER BY full_name ASC
      `,
      [studentId]
    );

    res.json(rows);
  } catch (e) {
    console.error("listStudentSupervisors:", e);
    res.status(500).json({ message: "Server error" });
  }
}

export async function upsertEvaluation(req, res) {
  try {
    const evaluatorId = meId(req);
    const { direction, evaluatee_user_id, rating_overall, comment } = req.body;

    if (!direction || !evaluatee_user_id)
      return res.status(400).json({ message: "direction & evaluatee_user_id required" });

    const rating = Math.max(1, Math.min(5, Number(rating_overall || 5)));

    await db.query(
      `
      INSERT INTO evaluations (direction, evaluator_user_id, evaluatee_user_id, rating_overall, comment)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating_overall = VALUES(rating_overall),
        comment = VALUES(comment),
        created_at = CURRENT_TIMESTAMP
      `,
      [direction, evaluatorId, Number(evaluatee_user_id), rating, comment || null]
    );

    res.json({ success: true });
  } catch (e) {
    console.error("upsertEvaluation:", e);
    res.status(500).json({ message: "Server error" });
  }
}
