// backend/src/routes/taskRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import unzipper from "unzipper";
import fs from "fs";
import db from "../config/db.js";

import {
  getStudentTasks,
  getStudentSubmissions,
  uploadSubmission,
  deleteSubmission,
  gradeSubmission,
} from "../controllers/taskController.js";

const router = express.Router();

/* -------------------- Multer Setup -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/submissions/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

/* -------------------- Student Routes -------------------- */

// 1 Get tasks assigned to student
router.get("/student/:userId", protect, getStudentTasks);

// 2 Get submissions of student
router.get("/submissions/student/:userId", protect, getStudentSubmissions);

// 3 Upload/Replace submission
router.post("/submissions/upload", protect, upload.single("file"), uploadSubmission);

// 4 Delete submission
router.delete("/submissions/:id", protect, deleteSubmission);

// 5 Grade submission (original)
router.put("/submissions/:id/grade", protect, gradeSubmission);

// Alias for your frontend (WITHOUT changing frontend)
router.put("/submissions/:id/grade", protect, gradeSubmission);

// 6 Preview submission ZIP (original)
router.get("/submissions/preview/:id", protect, async (req, res) => {
  const submissionId = req.params.id;

  try {
    const [rows] = await db.execute(
      "SELECT file_path FROM task_submissions WHERE id=?",
      [submissionId]
    );

    if (!rows.length) return res.status(404).json({ error: "Submission not found" });

    const filePath = rows[0].file_path;
    const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ""));

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    const directory = await unzipper.Open.file(fullPath);

    const files = await Promise.all(
      directory.files.map(async (file) => {
        if (file.type === "Directory") return { name: file.path, folder: true };
        const content = (await file.buffer()).toString("utf8");
        return { name: file.path, folder: false, content };
      })
    );

    res.json({ files });
  } catch (err) {
    console.error("Preview ERROR:", err);
    res.status(500).json({ error: "Failed to preview submission" });
  }
});

//  Alias for your frontend preview (WITHOUT changing frontend)
router.get("/submissions/preview/:id", protect, async (req, res) => {
  const submissionId = req.params.id;

  try {
    const [rows] = await db.execute(
      "SELECT file_path FROM task_submissions WHERE id=?",
      [submissionId]
    );

    if (!rows.length) return res.status(404).json({ error: "Submission not found" });

    const filePath = rows[0].file_path;
    const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ""));

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    const directory = await unzipper.Open.file(fullPath);

    const files = await Promise.all(
      directory.files.map(async (file) => {
        if (file.type === "Directory") return { name: file.path, folder: true };
        const content = (await file.buffer()).toString("utf8");
        return { name: file.path, folder: false, content };
      })
    );

    res.json({ files });
  } catch (err) {
    console.error("Preview ERROR:", err);
    res.status(500).json({ error: "Failed to preview submission" });
  }
});

export default router;
