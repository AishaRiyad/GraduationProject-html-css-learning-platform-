// backend/src/routes/supervisorRoutes.js
import express from "express";
import upload from "../middlewares/upload.js";

import {
  updateSupervisorProfile,
  getSupervisorStudents,
  getStudentSubmissions,
  getStudentOverview,
  getSupervisorSubmissions,
  getSingleSubmission,
} from "../controllers/supervisorController.js";

import { addReview, getReviewForSubmission } from "../controllers/supervisorReviewController.js";
import { getSupervisorDashboard } from "../controllers/supervisorDashboard.js";

const router = express.Router();

router.put("/update-profile/:id", upload.single("profile"), updateSupervisorProfile);

// Students for this supervisor only (requires supervisorId query)
router.get("/students", getSupervisorStudents);

router.get("/students/:studentId", getStudentOverview);
router.get("/students/:studentId/submissions", getStudentSubmissions);

router.get("/submissions", getSupervisorSubmissions);
router.get("/submission/:id", getSingleSubmission);

router.post("/review", addReview);
router.get("/review/:submissionId", getReviewForSubmission);

router.get("/dashboard/:supervisorId", getSupervisorDashboard);

export default router;
