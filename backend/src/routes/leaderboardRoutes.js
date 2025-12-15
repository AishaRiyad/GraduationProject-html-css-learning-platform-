import express from "express";
import { getLeaderboard, updateUserPoints } from "../controllers/leaderboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getLeaderboard);
router.put("/update", protect , updateUserPoints);

export default router;
