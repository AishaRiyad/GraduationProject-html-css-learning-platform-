import pool from "../config/db.js";

export const getSupervisorDashboard = async (req, res) => {
  try {
    const { supervisorId } = req.params;

    // 1) عدد المهام
    const [tasks] = await pool.query(
      `SELECT id, title, due_date FROM tasks WHERE supervisor_id = ?`,
      [supervisorId]
    );

    // 2) عدد التكليفات
    const [assignments] = await pool.query(
      `SELECT * FROM task_assignments 
       WHERE task_id IN (SELECT id FROM tasks WHERE supervisor_id = ?)`,
      [supervisorId]
    );

    // 3) عدد التسليمات
    const [submissions] = await pool.query(
      `SELECT * FROM task_submissions 
       WHERE task_id IN (SELECT id FROM tasks WHERE supervisor_id = ?)`,
      [supervisorId]
    );

    // 4) آخر 5 تسليمات
    const [recentSubs] = await pool.query(
      `SELECT ts.*, u.name 
       FROM task_submissions ts 
       JOIN users u ON u.id = ts.student_id
       WHERE task_id IN (SELECT id FROM tasks WHERE supervisor_id = ?)
       ORDER BY submitted_at DESC
       LIMIT 5`,
      [supervisorId]
    );

    // 5) Deadlines القادمة
    const [upcoming] = await pool.query(
      `SELECT title, due_date 
       FROM tasks 
       WHERE supervisor_id = ? AND due_date > NOW()
       ORDER BY due_date ASC LIMIT 5`,
      [supervisorId]
    );

    // 6) Tasks overdue
    const [overdue] = await pool.query(
      `SELECT title, due_date 
       FROM tasks 
       WHERE supervisor_id = ? AND due_date < NOW()
       ORDER BY due_date DESC`,
      [supervisorId]
    );

    // 7) Students falling behind (task assigned → no submission)
    const [fallingBehind] = await pool.query(
      `SELECT u.id, u.name, t.title
       FROM task_assignments ta
       JOIN users u ON ta.user_id = u.id
       JOIN tasks t ON t.id = ta.task_id
       WHERE ta.status='assigned' AND t.supervisor_id = ?`,
      [supervisorId]
    );

    // 8) Submission rate لكل مهمة
    const [submissionRate] = await pool.query(
      `SELECT 
         t.title,
         COUNT(ts.id) AS submissions,
         COUNT(ta.id) AS assigned
       FROM tasks t
       LEFT JOIN task_assignments ta ON ta.task_id = t.id
       LEFT JOIN task_submissions ts ON ts.task_id = t.id
       WHERE t.supervisor_id = ?
       GROUP BY t.id`,
      [supervisorId]
    );

    // 9) الطلاب الأكثر نشاطًا
    const [topStudents] = await pool.query(
      `SELECT u.name, COUNT(*) AS total
       FROM task_submissions ts
       JOIN users u ON u.id = ts.student_id
       JOIN tasks t ON t.id = ts.task_id
       WHERE t.supervisor_id = ?
       GROUP BY ts.student_id
       ORDER BY total DESC
       LIMIT 5`,
      [supervisorId]
    );

    return res.json({
      totalTasks: tasks.length,
      totalAssignments: assignments.length,
      totalSubmissions: submissions.length,
      recentSubs,
      upcoming,
      overdue,
      fallingBehind,
      submissionRate,
      topStudents,
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Server error." });
  }
};
