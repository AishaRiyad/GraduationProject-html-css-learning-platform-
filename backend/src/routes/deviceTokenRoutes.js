import express from "express";
import { saveToken } from "../controllers/deviceTokenController.js";

const router = express.Router();

// POST → حفظ توكن الويب
router.post("/save-token", saveToken);

export default router;
