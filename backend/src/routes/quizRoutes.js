import { Router } from "express";
import { getQuizByTopic, getUserProgress, saveUserProgress ,getCertificate,  } from "../controllers/quizController.js";
// import { requireAuth } from "../middlewares/authMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js"; 
const router = Router();

// router.use(requireAuth);
router.use(protect);
router.get("/:topic/levels", getQuizByTopic);

// استرجاع تقدّم موضوع معيّن بإرسال ?topic=html|css
router.get("/progress/:quizId/:userId", getUserProgress);
router.get("/progress/:quizId", getUserProgress);

router.post("/progress", saveUserProgress);
router.get("/certificate/:topic", getCertificate);
export default router;
