// backend/src/routes/submitProjectRoutes.js

import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { submissionUpload } from "../middlewares/uploadSubmission.js"; 
import { deleteSingleSubmissionFile } from "../controllers/projectController.js";
import {
  getProject,
  getMySubmission,
  uploadMySubmission,
  removeMySubmission,
} from "../controllers/projectController.js";

const router = Router();

// 🟡 Get project by slug or ID
router.get("/:projectIdOrSlug", protect, getProject);

// 🟡 Get my submission for this project
router.get("/submission/me", protect, getMySubmission);

// 🟡 Upload / Replace submission
router.post(
  "/submission",
  protect,
  submissionUpload.array("files"),
  uploadMySubmission
);

// 🟡 Delete submission
router.delete("/submission", protect, removeMySubmission);

router.delete("/submission/single", protect, deleteSingleSubmissionFile);
export default router;
