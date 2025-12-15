import express from "express";
import {
  createChallenge,
  getAllChallenges,
  getChallengeById,
  getWeeklyChallenges,
  updateChallenge,
  deleteChallenge,
  submitChallenge,
  getSubmissionsForChallenge,
  getMySubmissions,
  evaluateSubmission,
  getTopSubmissions,
  deleteSubmission, 
  updateSubmission 
} from "../controllers/challengeController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

router.post("/", protect, createChallenge);
router.get("/", getAllChallenges);
router.get("/weekly", getWeeklyChallenges);
router.get("/:id", getChallengeById);
router.put("/:id", protect, updateChallenge);
router.delete("/:id", protect, deleteChallenge);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/submissions"); // 📁 المجلد اللي رح تنحفظ فيه الملفات
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });
router.post("/:id/submit",protect, upload.fields([{ name: "html" }, { name: "css" }]), submitChallenge);

router.get("/:id/submissions", protect, getSubmissionsForChallenge);
router.get("/my/submissions", protect, getMySubmissions);
router.post("/:id/evaluate", protect, evaluateSubmission);
router.get("/:id/top", getTopSubmissions);
router.delete("/submissions/:submissionId", deleteSubmission);
router.put("/submissions/:submissionId", upload.fields([{ name: "html" }, { name: "css" }]), updateSubmission);

export default router;
