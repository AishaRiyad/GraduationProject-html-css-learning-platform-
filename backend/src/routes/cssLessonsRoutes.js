import express from "express";
import { getAllCSSLessons, getSingleCSSLesson } from "../controllers/cssLessonsController.js";

const router = express.Router();

// Get all CSS lessons (for sidebar)
router.get("/", getAllCSSLessons);

// Get single CSS lesson by ID
router.get("/:id", getSingleCSSLesson);

export default router;
