// src/controllers/dashboardController.js
import db from "../config/db.js";

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.params.userId;

    // ================================
    // (1) Profile Info
    // ================================
    const [profileRows] = await db.query(
      `SELECT full_name, email, profile_image
       FROM  profile
       WHERE id = ?`,
      [userId]
    );
    const profile = profileRows[0];

   // (2) Lessons Progress — FIXED
const [lessonStats] = await db.query(
  `
  SELECT 
      (SELECT COUNT(*) FROM lessons WHERE level = 'basic') AS total_lessons,

      SUM(lp.is_completed = 1) AS completed_lessons,

      (
        SELECT l.lesson_order
        FROM lesson_progress lp2
        JOIN lessons l ON l.id = lp2.lesson_id
        WHERE lp2.user_id = ? 
          AND lp2.is_unlocked = 1
          AND lp2.is_completed = 0
        ORDER BY l.lesson_order ASC
        LIMIT 1
      ) AS current_lesson
  FROM lesson_progress lp
  WHERE lp.user_id = ?
  `,
  [userId, userId]
);


    const totalLessons = lessonStats[0].total_lessons;
    const completedLessons = lessonStats[0].completed_lessons;
    const currentLesson = lessonStats[0].current_lesson;

    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;


    const [quizScore] = await db.query(
      `SELECT JSON_EXTRACT(scores, '$[last]') AS last_score
       FROM quiz_progress
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    const lastQuizScore = quizScore[0]?.last_score ?? null;

    // ================================
    // (3) Tasks Summary
    // ================================
    const [taskStats] = await db.query(
      `SELECT 
          SUM(status = 'assigned') AS assigned,
          SUM(status = 'submitted') AS submitted,
          SUM(status = 'graded') AS graded
       FROM task_assignments
       WHERE user_id = ?`,
      [userId]
    );

    // Upcoming Task
    const [upcomingTask] = await db.query(
      `SELECT t.id, t.title, t.due_date
       FROM task_assignments ta
       JOIN tasks t ON ta.task_id = t.id
       WHERE ta.user_id = ? AND ta.status = 'assigned'
       ORDER BY t.due_date ASC
       LIMIT 1`,
      [userId]
    );

    // ================================
    // (4) Challenge Summary
    // ================================
    const [challengeStats] = await db.query(
      `SELECT 
          COUNT(*) AS attempts,
          MAX(ai_score) AS last_score,
          MAX(submitted_at) AS last_submit
       FROM challenge_submissions
       WHERE user_id = ?`,
      [userId]
    );

    let latestFeedback = null;

    if (challengeStats[0].last_submit) {
      const [feedbackRow] = await db.query(
        `SELECT feedback
         FROM challenge_submissions
         WHERE user_id = ?
         ORDER BY submitted_at DESC
         LIMIT 1`,
        [userId]
      );
      latestFeedback = feedbackRow[0]?.feedback ?? null;
    }

    // ================================
    // (5) Projects Count
    // ================================
    const [projects] = await db.query("SELECT COUNT(*) AS c FROM projects");
    const projectsCount = projects[0].c;

    // ================================
    // SEND RESPONSE
    // ================================
    res.json({
      profile,
      progress: {
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        current_lesson: currentLesson,
        progress_percentage: progressPercentage,
        last_quiz_score: lastQuizScore,
      },
      tasks: {
        assigned: taskStats[0].assigned,
        submitted: taskStats[0].submitted,
        graded: taskStats[0].graded,
        upcoming_task: upcomingTask[0] || null,
      },
      challenges: {
        attempts: challengeStats[0].attempts,
        last_score: challengeStats[0].last_score,
        latest_feedback: latestFeedback,
      },
      projects_count: projectsCount,
    });
  } catch (err) {
    console.log("❌ Dashboard Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
