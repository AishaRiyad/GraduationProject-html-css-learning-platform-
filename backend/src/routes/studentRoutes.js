import express from "express";
import { getStudentOverview } from "../controllers/studentController.js";
import { getStudentDashboard } from "../controllers/dashboardController.js";
const router = express.Router();
import { protect } from "../middlewares/authMiddleware.js";
router.get("/overview/:userId", getStudentOverview);
router.get("/dashboard/:userId", protect, getStudentDashboard);
export default router;
