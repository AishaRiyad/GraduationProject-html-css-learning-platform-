import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
  addLike,
  removeLike,
  getLikesCount,
} from "../controllers/interactionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/challenges/:id/comments", protect , addComment);
router.get("/challenges/:id/comments", getComments);
router.delete("/comments/:id", protect , deleteComment);
router.post("/submissions/:id/like", protect , addLike);
router.delete("/submissions/:id/like", protect , removeLike);
router.get("/submissions/:id/likes", getLikesCount);

export default router;
