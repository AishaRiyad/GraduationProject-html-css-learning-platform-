import express from "express";
import db from "../config/db.js";  // 👈 تأكدي إن اسم الملف db.js وهو بنفس هذا المسار
import { getIO } from "../socket.js";

const router = express.Router();

// GET: كل التاسكات لمشرف معيّن مع أعداد الطلاب والحالات
router.get("/tasks", async (req, res) => {
  try {
    const supervisorId = req.query.supervisorId;
    if (!supervisorId) {
      return res.status(400).json({ message: "supervisorId is required" });
    }

    const [rows] = await db.execute(
      `
      SELECT 
        t.*,
        COUNT(ta.id) AS total_assigned,
        SUM(ta.status = 'submitted') AS submitted_count,
        SUM(ta.status = 'graded') AS graded_count
      FROM tasks t
      LEFT JOIN task_assignments ta ON ta.task_id = t.id
      WHERE t.supervisor_id = ?
      GROUP BY t.id
      ORDER BY t.due_date IS NULL, t.due_date ASC, t.created_at DESC
      `,
      [supervisorId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: تفاصيل تاسك معيّن + الطلاب المعيّن لهم
router.get("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const [[task]] = await db.execute(`SELECT * FROM tasks WHERE id = ?`, [
      taskId,
    ]);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const [assignments] = await db.execute(
      `
    
  SELECT 
    ta.id AS assignment_id,
    ta.status,
    ta.submitted_at,
    ta.grade,
    ta.feedback,
    u.id AS user_id,
    u.name,
    u.email,
    u.role
  FROM task_assignments ta
  INNER JOIN users u ON ta.user_id = u.id
  WHERE ta.task_id = ?
  ORDER BY u.name
  `,
  [taskId]
    );

    res.json({ task, assignments });
  } catch (err) {
    console.error("GET /tasks/:taskId error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST: إنشاء تاسك جديد
router.post("/tasks", async (req, res) => {
  try {
    const { title, description, due_date, supervisor_id } = req.body;

    if (!title || !supervisor_id) {
      return res
        .status(400)
        .json({ message: "title and supervisor_id are required" });
    }

    const [result] = await db.execute(
      `
      INSERT INTO tasks (title, description, due_date, supervisor_id)
      VALUES (?, ?, ?, ?)
      `,
      [title, description || null, due_date || null, supervisor_id]
    );

    const insertedId = result.insertId;

    const [[task]] = await db.execute(`SELECT * FROM tasks WHERE id = ?`, [
      insertedId,
    ]);

    res.status(201).json(task);
  } catch (err) {
    console.error("POST /tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: تعديل تاسك
router.put("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, due_date } = req.body;

    await db.execute(
      `
      UPDATE tasks
      SET title = ?, description = ?, due_date = ?
      WHERE id = ?
      `,
      [title, description || null, due_date || null, taskId]
    );

    const [[task]] = await db.execute(`SELECT * FROM tasks WHERE id = ?`, [
      taskId,
    ]);

    res.json(task);
  } catch (err) {
    console.error("PUT /tasks/:taskId error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE: حذف تاسك + تعييناته
router.delete("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    await db.execute(`DELETE FROM task_assignments WHERE task_id = ?`, [
      taskId,
    ]);
    await db.execute(`DELETE FROM tasks WHERE id = ?`, [taskId]);

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("DELETE /tasks/:taskId error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST: Assign لمجموعة طلاب
router.post("/tasks/:taskId/assign", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "studentIds array is required" });
    }

    const io = getIO(); // 👈 هنا

    for (const sId of studentIds) {
      // 1) INSERT assignment إذا مش موجود
      await db.execute(
        `
        INSERT INTO task_assignments (task_id, user_id, status)
        SELECT ?, ?, 'assigned'
        WHERE NOT EXISTS (
          SELECT 1 FROM task_assignments WHERE task_id = ? AND user_id = ?
        )
        `,
        [taskId, sId, taskId, sId]
      );

      // 2) 🔥 Send Real-Time Socket Notification
      io.to(`user:${sId}`).emit("task_assigned", {
        taskId,
        studentId: sId,
        message: `A new task (#${taskId}) was assigned to you.`,
        time: new Date(),
      });

      console.log("📨 Sent task_assigned event to user:", sId);
    }

    res.json({ message: "Students assigned successfully" });
  } catch (err) {
    console.error("POST /tasks/:taskId/assign error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// POST: Unassign طالب
router.post("/tasks/:taskId/unassign", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { studentId } = req.body;

    await db.execute(
      `DELETE FROM task_assignments WHERE task_id = ? AND user_id = ?`,
      [taskId, studentId]
    );

    res.json({ message: "Student unassigned" });
  } catch (err) {
    console.error("POST /tasks/:taskId/unassign error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: تغيير حالة تاسك لطالب معيّن
router.put(
  "/tasks/:taskId/assignments/:assignmentId/status",
  async (req, res) => {
    try {
      const { taskId, assignmentId } = req.params;
      const { status, grade, feedback } = req.body;

      await db.execute(
        `
      UPDATE task_assignments
      SET status = ?, 
          grade = ?, 
          feedback = ?,
          submitted_at = CASE 
            WHEN ? = 'submitted' AND submitted_at IS NULL THEN NOW()
            ELSE submitted_at
          END
      WHERE id = ? AND task_id = ?
      `,
        [status, grade || null, feedback || null, status, assignmentId, taskId]
      );

      res.json({ message: "Assignment status updated" });
    } catch (err) {
      console.error(
        "PUT /tasks/:taskId/assignments/:assignmentId/status error:",
        err
      );
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
