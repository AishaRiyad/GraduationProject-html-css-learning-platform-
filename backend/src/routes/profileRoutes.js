import express from "express";
import multer from "multer";
import { updateProfileImage, getProfile ,updateProfile,changePassword } from "../controllers/profileController.js";
import { protect } from "../middlewares/authMiddleware.js"; // الميدل وير للتحقق من التوكن
import upload from "../middlewares/upload.js";

const router = express.Router();



// GET /api/profile
router.get("/", protect, getProfile);

router.post("/upload", protect, upload.single("profile_image"), updateProfileImage);
router.put("/", protect, updateProfile);
router.put("/password", protect, changePassword);
router.put("/update", protect, updateProfile);

export default router;
