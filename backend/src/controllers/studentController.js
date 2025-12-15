import db from "../config/db.js";

export const getStudentOverview = async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1) عدد الدروس المنجزة (محسوب من lesson_progress)
    const [completedRows] = await db.execute(
      `SELECT COUNT(*) AS completed 
       FROM lesson_progress 
       WHERE user_id = ? AND is_completed = 1`,
      [userId]
    );
    const completedLessons = completedRows[0].completed;

    // 2) عدد دروس الـ basic فقط
    const [totalRows] = await db.execute(
      `SELECT COUNT(*) AS total 
       FROM lessons 
       WHERE level = 'basic'`
    );
    const totalLessons = totalRows[0].total;

    // 3) نسبة التقدم
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    res.json({
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
      progress_percentage: progressPercentage,
    });
  } catch (err) {
    console.error("Overview error:", err);
    res.status(500).json({ error: "Failed to load student overview" });
  }
};
