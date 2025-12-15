import express from "express";
import {
  getLessonsByLevel,
  getLessonContent,
  completeLesson,
  getCurrentLesson,
  initializeLessonProgress,
   getLessonProgress,
} from "../controllers/lessonController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();0
router.post("/initialize", protect, initializeLessonProgress);
router.get("/progress/:userId", protect, getLessonProgress);
// ✅ الترتيب مهم جدًا
router.get("/content/:lessonId", protect, getLessonContent);
router.post("/complete", protect, completeLesson);
router.get("/current/:userId", protect, getCurrentLesson);
router.get("/:userId/:level", protect, getLessonsByLevel);
router.get("/content/:lessonId", protect, getLessonContent);



console.log("✅ Lesson routes file loaded"); // ← أضيفي هذا السطر مؤقتًا

export default router;
