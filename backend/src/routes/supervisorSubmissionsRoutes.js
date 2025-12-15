import express from "express";
import db from "../config/db.js";
import multer from "multer";

const router = express.Router();

/* ------------------------------------------
   1) MULTER UPLOAD CONFIG
------------------------------------------- */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/submissions/");
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ------------------------------------------
   2) POST – STUDENT SUBMISSION UPLOAD
------------------------------------------- */
// route: POST /api/supervisor/tasks/:taskId/submit

router.post("/tasks/:taskId/submit", upload.single("file"), async (req, res) => {
  try {
    const { taskId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const filePath = req.file.path.replace(/\\/g, "/");

    // Save submission
    await db.execute(
      `INSERT INTO task_submissions (task_id, student_id, file_path)
       VALUES (?, ?, ?)`,
      [taskId, studentId, filePath]
    );

    // Update assignment status
    await db.execute(
      `UPDATE task_assignments
       SET status = 'submitted', submitted_at = NOW()
       WHERE task_id = ? AND user_id = ?`,
      [taskId, studentId]
    );

    res.json({ success: true, message: "Submission uploaded successfully." });

  } catch (err) {
    console.error("Submit error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------
   3) GET – FETCH SUBMISSIONS FOR A TASK
------------------------------------------- */
// route: GET /api/supervisor/tasks/:taskId/submissions

router.get("/tasks/:taskId/submissions", async (req, res) => {
  try {
    const { taskId } = req.params;

    const [rows] = await db.execute(
      `SELECT 
          s.id AS submission_id,
          s.task_id,
          s.student_id,
          s.file_path,
          s.submitted_at,
          s.feedback,
          s.grade,
          u.name,
          u.email
        FROM task_submissions s
        JOIN users u ON u.id = s.student_id
        WHERE s.task_id = ?
        ORDER BY s.submitted_at DESC`,
      [taskId]
    );

    res.json(rows);

  } catch (err) {
    console.error("GET submissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------
   4) PUT – ADD / UPDATE GRADING + FEEDBACK
------------------------------------------- */
// route: PUT /api/supervisor/tasks/:taskId/submissions/:subId

router.put("/tasks/:taskId/submissions/:subId", async (req, res) => {
  try {
    const { subId } = req.params;
    const { grade, feedback } = req.body;

    await db.execute(
      `UPDATE task_submissions
       SET grade = ?, feedback = ?
       WHERE id = ?`,
      [grade || null, feedback || null, subId]
    );

    res.json({ success: true, message: "Submission graded successfully." });

  } catch (err) {
    console.error("Grading error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
