// backend/admin-backend/src/routes/adminRoutes.js
import { Router } from "express";
import {
  analyticsOverview,
  analyticsStudent,
} from "../controllers/analyticsController.js";
import {
  analyticsUsers,
  analyticsUserDetail,
} from "../controllers/adminController.js";
import { protect } from "../../../src/middlewares/authMiddleware.js";

import {
  // Dashboard
  getOverviewStats,
  getRecentActivity,

  // Users
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  patchUserRole,
  patchUserStatus,
  resetUserPasswordAdmin,
  getMyProfile,
  updateMyProfile,
  changeMyPassword,

  // Lessons (HTML)
  adminListLessons,
  adminCreateLesson,
  adminUpdateLesson,
  adminDeleteLesson,
  validateLessonJSON,

  // CSS Lessons
  adminListCssLessons,
  adminCreateCssLesson,
  adminUpdateCssLesson,
  adminDeleteCssLesson,
  validateCssLessonJSON,

  // Quizzes
  adminListQuizLevels,
  adminCreateQuizLevel,
  adminUpdateQuizLevel,
  adminDeleteQuizLevel,
  adminListQuestions,
  adminCreateQuestion,
  adminUpdateQuestion,
  adminDeleteQuestion,
  adminQuizProgressOverview,

  // Projects & Comments
  adminListProjects,
  adminToggleProjectVisibility,
  adminToggleProjectFeatured,
  adminDeleteProject,
  adminListProjectComments,
  adminDeleteComment,
  adminListAllComments,      
  adminReplyToComment,       

  // Submissions
  adminListSubmissions,
  adminGetSubmissionByUser,
  adminUpdateSubmissionStatus,

  // Announcement
  getAnnouncement,
  upsertAnnouncement,

  // Notifications
  listNotifications,
  markNotificationRead,

  // Stats
  statsOverview,
  statsEngagement,
  statsQuizzes,
} from "../controllers/adminController.js";

const router = Router();
router.use(protect);


/* ================= DASHBOARD ================= */
router.get("/overview", getOverviewStats);
router.get("/recent",   getRecentActivity);

/* =============== ADMIN SELF PROFILE (SETTINGS) =============== */
router.get("/me",                getMyProfile);
router.put("/me",                updateMyProfile);
router.post("/me/change-password", changeMyPassword);

/* ================= USERS ================= */
router.get("/users",           listUsers);
router.get("/users/:id",       getUser);
router.post("/users",          createUser);
router.put("/users/:id",       updateUser);
router.delete("/users/:id",    deleteUser);
router.patch("/users/:id/role",   patchUserRole);
router.patch("/users/:id/active", patchUserStatus);
router.post("/users/:id/reset-password", resetUserPasswordAdmin);

/* ================= LESSONS (HTML) ================= */
router.get("/lessons",            adminListLessons);
router.post("/lessons",           adminCreateLesson);
router.put("/lessons/:id",        adminUpdateLesson);
router.delete("/lessons/:id",     adminDeleteLesson);
router.post("/lessons/:id/validate", validateLessonJSON);

/* ================= CSS LESSONS ================= */
router.get("/css-lessons",            adminListCssLessons);
router.post("/css-lessons",           adminCreateCssLesson);
router.put("/css-lessons/:id",        adminUpdateCssLesson);
router.delete("/css-lessons/:id",     adminDeleteCssLesson);
router.post("/css-lessons/:id/validate", validateCssLessonJSON);

/* ================= QUIZZES ================= */
// topic: 'html' | 'css'
router.get("/quizzes/:topic/levels",         adminListQuizLevels);
router.post("/quizzes/:topic/levels",        adminCreateQuizLevel);
router.put("/quizzes/levels/:id",            adminUpdateQuizLevel);
router.delete("/quizzes/levels/:id",         adminDeleteQuizLevel);

router.get("/quizzes/levels/:levelId/questions",        adminListQuestions);
router.post("/quizzes/levels/:levelId/questions",       adminCreateQuestion);
router.put("/quizzes/questions/:questionId",            adminUpdateQuestion);
router.delete("/quizzes/questions/:questionId",         adminDeleteQuestion);
router.get("/quizzes/progress/overview",                adminQuizProgressOverview);

/* ================= PROJECTS & COMMENTS ================= */
router.get("/projects",                adminListProjects);
router.patch("/projects/:id/visible",  adminToggleProjectVisibility);
router.patch("/projects/:id/featured", adminToggleProjectFeatured);
router.delete("/projects/:id",         adminDeleteProject);
router.get("/projects/:id/comments",   adminListProjectComments);
router.delete("/comments/:commentId",  adminDeleteComment);
router.get("/comments",                adminListAllComments);
router.post("/comments/:commentId/reply", adminReplyToComment);

/* ================= SUBMISSIONS ================= */
router.get("/submissions",                adminListSubmissions);
router.get("/submissions/:userId",        adminGetSubmissionByUser);
router.patch("/submissions/:userId",      adminUpdateSubmissionStatus);

/* ================= ANNOUNCEMENT ================= */
router.get("/announcement",  getAnnouncement);
router.post("/announcement", upsertAnnouncement);

/* ================= NOTIFICATIONS ================= */
router.get("/notifications",           listNotifications);
router.post("/notifications/:id/read", markNotificationRead);

/* ================= STATS ================= */
router.get("/stats/overview",   statsOverview);
router.get("/stats/engagement", statsEngagement);
router.get("/stats/quizzes",    statsQuizzes);

router.get("/analytics/overview", analyticsOverview);
router.get("/analytics/student/:userId", analyticsStudent);
router.get("/analytics/users",    analyticsUsers);
router.get("/analytics/users/:userId", analyticsUserDetail);

export default router;
