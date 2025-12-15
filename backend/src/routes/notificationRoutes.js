// backend/src/routes/notificationRoutes.js
import express from "express";
import {
  sendMessage,
  listMyNotifications,
  markNotificationRead,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/notifications", protect, listMyNotifications);

router.post("/notifications/:id/read", protect, markNotificationRead);


router.post("/send-notification", protect, sendMessage);

export default router;
