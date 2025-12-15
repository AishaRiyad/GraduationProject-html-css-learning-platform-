// backend/src/controllers/taskController.js
import db from "../config/db.js";
import { getIO } from "../socket.js";

/* ======================================================
   1) Get Tasks Assigned to a Student
   ====================================================== */
export const getStudentTasks = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        ta.id AS assignment_id,
        ta.status,
        ta.created_at AS assigned_at,
        ta.submitted_at,
        ta.grade AS assignment_grade,
        ta.feedback AS assignment_feedback,

        t.id AS task_id,
        t.title,
        t.description,
        t.due_date,
        t.supervisor_id,
        t.created_at AS task_created
      FROM task_assignments ta
      JOIN tasks t ON t.id = ta.task_id
      WHERE ta.user_id = ?
      ORDER BY ta.created_at DESC
      `,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("Error loading tasks:", err);
    return res.status(500).json({ message: "Failed to load tasks" });
  }
};

/* ======================================================
   2) Get All Submissions for a Student
   ====================================================== */
export const getStudentSubmissions = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        task_id,
        student_id,
        file_path,
        submitted_at,
        feedback,
        grade
      FROM task_submissions
      WHERE student_id = ?
      ORDER BY submitted_at DESC
      `,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error(" Error loading submissions:", err);
    return res.status(500).json({ message: "Failed to load submissions" });
  }
};

/* ======================================================
   3) Upload a Submission (Insert or Update)
   ====================================================== */
export const uploadSubmission = async (req, res) => {
  const { task_id, student_id } = req.body;

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const filePath = `/uploads/submissions/${req.file.filename}`;

  try {
    // 1) Save / Update submission
    await db.query(
      `
      INSERT INTO task_submissions (task_id, student_id, file_path, submitted_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        file_path = VALUES(file_path),
        submitted_at = NOW()
      `,
      [task_id, student_id, filePath]
    );

    // 2) Update assignment status
    await db.query(
      `
      UPDATE task_assignments
      SET status = 'submitted', submitted_at = NOW()
      WHERE task_id = ? AND user_id = ?
      `,
      [task_id, student_id]
    );

    // 3) Socket notifications
    const io = getIO();

    const [taskRows] = await db.query(
      `SELECT supervisor_id, title FROM tasks WHERE id = ?`,
      [task_id]
    );

    const task = taskRows?.[0];
    if (task) {
      io.to(`user:${task.supervisor_id}`).emit("task_submitted", {
        taskId: task_id,
        studentId: student_id,
        message: `A student submitted task "${task.title}"`,
        time: new Date(),
      });
    }

    io.to(`user:${student_id}`).emit("submission_success", {
      taskId: task_id,
      message: "Your submission was uploaded successfully!",
      time: new Date(),
    });

    return res.json({
      success: true,
      file_path: filePath,
      message: "Submission uploaded & assignment updated!",
    });
  } catch (err) {
    console.error("Error uploading submission:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
};

export const deleteSubmission = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM task_submissions WHERE id = ?`, [id]);
    return res.json({ success: true, message: "Submission deleted" });
  } catch (err) {
    console.error("Error deleting submission:", err);
    return res.status(500).json({ message: "Failed to delete submission" });
  }
};

export const gradeSubmission = async (req, res) => {
  const { id } = req.params;
  const { grade, feedback } = req.body;

  try {
    // 1) update task_submissions
    await db.query(
      `UPDATE task_submissions SET grade = ?, feedback = ? WHERE id = ?`,
      [grade, feedback, id]
    );

    // 2) get task_id, student_id
    const [rows] = await db.query(
      `SELECT task_id, student_id FROM task_submissions WHERE id = ?`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: "Submission not found" });

    const { task_id, student_id } = rows[0];

    // 3) update task_assignments
    await db.query(
      `UPDATE task_assignments
       SET grade = ?, feedback = ?, status = 'graded'
       WHERE task_id = ? AND user_id = ?`,
      [grade, feedback, task_id, student_id]
    );

    res.json({ success: true });
  } catch (e) {
    console.error("gradeSubmission ERROR:", e);
    res.status(500).json({ message: "Failed to grade submission" });
  }
};
