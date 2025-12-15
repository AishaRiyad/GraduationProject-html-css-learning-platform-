import express from "express";
import { 
  createProjectPost, 
  getAllProjects, 
  getSingleProject, 
  toggleLikeProject, 
  addComment, 
  getComments,
   updateProject,
     deleteProject 
} from "../controllers/projectHubController.js";
import upload from "../middlewares/upload.js"; 
import { protect } from "../middlewares/authMiddleware.js"; 


const router = express.Router();

// إنشاء مشروع جديد
router.post("/create",protect, upload.single("image"), createProjectPost);

// جلب كل المشاريع
router.get("/", getAllProjects);

// جلب مشروع محدد بالتفصيل
router.get("/:id", getSingleProject);

// الإعجاب أو إلغاء الإعجاب
router.post("/:id/like", protect, toggleLikeProject);

// إضافة تعليق
router.post("/:id/comment", protect, addComment);

// جلب التعليقات
router.get("/:id/comments", getComments);

// ✅ Update project (only owner)
router.put("/:id/update", protect, upload.single("image"), updateProject);



// ✅ Delete project (only owner)
router.delete("/:id", protect, deleteProject);


export default router;
