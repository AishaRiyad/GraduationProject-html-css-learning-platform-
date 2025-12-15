// backend/admin-backend/src/controllers/analyticsController.js
import db from "../../../src/config/db.js";

/**
 * General KPIs + Charts
 */
export async function analyticsOverview(_req, res) {
  try {
    const [[users]] = await db.query(`SELECT COUNT(*) AS c FROM users`);
    const [[projects]] = await db.query(`SELECT COUNT(*) AS c FROM projects_posts`);

    const [logins30] = await db.query(`
      SELECT d AS day, SUM(cnt) AS logins
      FROM v_login_daily
      WHERE d >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY d ORDER BY d
    `);

    const [loginsByUser30] = await db.query(`
      SELECT u.name AS name, COUNT(*) AS logins
      FROM login_events le
      JOIN users u ON u.id = le.user_id
      WHERE le.occurred_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY u.id, u.name
      ORDER BY logins DESC
      LIMIT 20
    `);

    const [roles] = await db.query(`
      SELECT role, COUNT(*) AS c
      FROM users GROUP BY role
    `);

    const [topStudents] = await db.query(`
      SELECT u.id, u.name, u.email,
             COALESCE(p.posts,0)  AS projects,
             COALESCE(l.logins,0) AS logins
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS posts
        FROM projects_posts GROUP BY user_id
      ) p ON p.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS logins
        FROM login_events
        WHERE occurred_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY user_id
      ) l ON l.user_id = u.id
      WHERE u.role='student'
      ORDER BY (COALESCE(p.posts,0)*2 + COALESCE(l.logins,0)) DESC
      LIMIT 5
    `);

    const [topByProjects] = await db.query(`
      SELECT u.id, u.name, COUNT(pp.id) AS projects
      FROM users u
      JOIN projects_posts pp ON pp.user_id = u.id
      WHERE u.role='student'
      GROUP BY u.id, u.name
      ORDER BY projects DESC
      LIMIT 10
    `);

    // ---- Top students by quiz (JSON scores) ----
    const [rawQuiz] = await db.query(`
      SELECT u.id AS user_id, u.name, qp.scores
      FROM users u
      LEFT JOIN quiz_progress qp ON qp.user_id = u.id
      WHERE u.role = 'student'
    `);

    const quizStats = new Map();
    for (const row of rawQuiz) {
      if (!row.scores) continue;

      let scoresJSON;
      try {
        scoresJSON = typeof row.scores === "string" ? JSON.parse(row.scores) : row.scores;
      } catch {
        continue;
      }

      if (!quizStats.has(row.user_id)) {
        quizStats.set(row.user_id, { id: row.user_id, name: row.name, attempts: 0, passes: 0 });
      }
      const s = quizStats.get(row.user_id);

      const accumulateTopic = (topicData) => {
        if (!topicData || typeof topicData !== "object") return;

        const perLevel =
          topicData.scores && typeof topicData.scores === "object"
            ? topicData.scores
            : topicData;

        Object.values(perLevel || {}).forEach((lvl) => {
          if (!lvl) return;

          const correct = Number(lvl.correct ?? lvl.score ?? 0);
          const total = Number(lvl.total ?? lvl.max ?? 0);

          if (Number.isFinite(correct) && (total > 0 || correct > 0)) {
            s.attempts += 1;
          }

          const passedFlag =
            typeof lvl.passed !== "undefined"
              ? !!lvl.passed
              : Number.isFinite(correct) && correct >= (lvl.pass_threshold ?? 6);

          if (passedFlag) s.passes += 1;
        });
      };

      if (scoresJSON && typeof scoresJSON === "object" && (scoresJSON.html || scoresJSON.css || scoresJSON.js)) {
        accumulateTopic(scoresJSON.html);
        accumulateTopic(scoresJSON.css);
        accumulateTopic(scoresJSON.js);
      } else {
        accumulateTopic(scoresJSON);
      }
    }

    const topByQuiz = Array.from(quizStats.values())
      .filter((s) => s.attempts > 0)
      .map((s) => ({
        id: s.id,
        name: s.name,
        passes: s.passes,
        pass_rate: s.attempts ? Math.round((s.passes / s.attempts) * 100) : 0,
      }))
      .sort((a, b) => b.passes - a.passes || b.pass_rate - a.pass_rate)
      .slice(0, 10);

    // ✅ Evaluations Aggregations (داخل الدالة)
    const [supervisorRatings] = await db.query(`
      SELECT
        e.evaluatee_user_id AS supervisor_id,
        COALESCE(p.full_name, u.name) AS supervisor_name,
        COUNT(*) AS total_reviews,
        ROUND(AVG(e.rating_overall), 2) AS avg_overall
      FROM evaluations e
      JOIN users u ON u.id = e.evaluatee_user_id
      LEFT JOIN profile p ON p.user_id = u.id
      WHERE e.direction='student_to_supervisor'
      GROUP BY e.evaluatee_user_id, supervisor_name
      ORDER BY avg_overall DESC
      LIMIT 20
    `);

    const [studentRatings] = await db.query(`
      SELECT
        e.evaluatee_user_id AS student_id,
        COALESCE(p.full_name, u.name) AS student_name,
        COUNT(*) AS total_reviews,
        ROUND(AVG(e.rating_overall), 2) AS avg_overall
      FROM evaluations e
      JOIN users u ON u.id = e.evaluatee_user_id
      LEFT JOIN profile p ON p.user_id = u.id
      WHERE e.direction='supervisor_to_student'
      GROUP BY e.evaluatee_user_id, student_name
      ORDER BY avg_overall DESC
      LIMIT 20
    `);

    res.json({
      kpi: { users: users.c, projects: projects.c },
      logins30,
      loginsByUser30,
      roles,
      topStudents,
      topByProjects,
      topByQuiz,
      supervisorRatings,
      studentRatings,
    });
  } catch (e) {
    console.error("analyticsOverview:", e);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Analytics for a single student
 * (ملاحظة: ما أضفت evaluations هون لأنك كنتِ حاطتهم غلط داخل res.json)
 */
export async function analyticsStudent(req, res) {
  try {
    const userId = Number(req.params.userId);

    const [[user]] = await db.query(
      `
      SELECT id, name, email, role, level, last_login, created_at
      FROM users WHERE id=?
    `,
      [userId]
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const [qp] = await db.query(
      `
      SELECT id, quiz_id, unlocked_level_ids, scores, updated_at
      FROM quiz_progress
      WHERE user_id=?
      ORDER BY updated_at DESC
    `,
      [userId]
    );

    const quizLevels = [];
    for (const row of qp) {
      if (!row.scores) continue;
      let s;
      try {
        s = JSON.parse(row.scores);
      } catch {
        s = null;
      }
      if (Array.isArray(s)) {
        for (const it of s) {
          quizLevels.push({
            topic: it.topic ?? "html",
            level_number: it.level_number ?? null,
            score: it.score ?? null,
            passed: Number(typeof it.passed !== "undefined" ? it.passed : it.score >= (it.pass_threshold ?? 6)),
            updated_at: row.updated_at,
          });
        }
      }
    }

    const [projectsByMonth] = await db.query(
      `
      SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS ym, COUNT(*) AS c
      FROM projects_posts
      WHERE user_id=?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')
      ORDER BY ym
      LIMIT 12
    `,
      [userId]
    );

    const [logins] = await db.query(
      `
      SELECT d AS day, cnt
      FROM v_login_daily
      WHERE user_id=? AND d >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ORDER BY d
    `,
      [userId]
    );

    const [[projTotal]] = await db.query(`SELECT COUNT(*) AS c FROM projects_posts WHERE user_id=?`, [userId]);

    const passRate = quizLevels.length
      ? (quizLevels.filter((x) => Number(x.passed) === 1).length / quizLevels.length) * 100
      : 0;

    res.json({
      user,
      summary: {
        projects_total: projTotal.c,
        quiz_attempts: quizLevels.length,
        quiz_pass_rate: Math.round(passRate),
      },
      charts: {
        quizzes: quizLevels,
        projectsMonthly: projectsByMonth,
        logins30: logins,
      },
    });
  } catch (e) {
    console.error("analyticsStudent:", e);
    res.status(500).json({ message: "Server error" });
  }
}
