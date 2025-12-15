import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { saveAdminFcmToken } from "../controllers/adminNotificationController.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
  getAdminNotifications,
  markAdminNotificationRead,
} from "../controllers/adminNotificationController.js";

const router = express.Router();


router.use(protect, authorizeRoles("admin"));


router.get("/", getAdminNotifications);


router.post("/:id/read", markAdminNotificationRead);
router.post("/fcm-token", protect, saveAdminFcmToken);

export default router;
