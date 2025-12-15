import db from "../config/db.js";
import bcrypt from "bcryptjs";

function runQuery(sql, params = []) {
  return db.execute(sql, params).then(([rows]) => rows);
}

function buildPhotoUrl(img) {
  const base = "http://localhost:5000";

  if (!img || img.trim() === "") {
    return `/user-avatar.jpg`;
  }

  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }

  
  if (!img.startsWith("/")) {
    return `${base}/uploads/${img}`;
  }

  return `${base}${img}`;
}

/* ==========================================================
   UPDATE SUPERVISOR PROFILE  
========================================================== */
export const updateSupervisorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password } = req.body;

    let profileImage = null;

    if (req.file) {
      profileImage = "/uploads/" + req.file.filename;
    }

    const params = [];
    let query = "UPDATE users SET ";

    if (full_name) {
      query += "full_name=?, ";
      params.push(full_name);
    }

    if (email) {
      query += "email=?, ";
      params.push(email);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += "password=?, ";
      params.push(hashed);
    }

    if (profileImage) {
      query += "profile_image=?, ";
      params.push(profileImage);
    }

    query = query.slice(0, -2);
    query += " WHERE id=?";
    params.push(id);

    await db.execute(query, params);

    const [updated] = await db.execute(
      "SELECT id, full_name, email, profile_image, role FROM users WHERE id=?",
      [id]
    );

    res.json({ user: updated[0], message: "Profile updated successfully" });

  } catch (err) {
    console.error("PROFILE_UPDATE_ERROR:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};




export async function getSupervisorStudents(req, res) {
  try {
    const supervisorId = req.query.supervisorId;

    if (!supervisorId) {
      return res.status(400).json({ message: "supervisorId is required" });
    }

    const sql = `
      SELECT 
        u.id AS user_id,
        COALESCE(p.full_name, u.name) AS full_name,
        u.email,
        p.profile_image,
        u.last_login,

        COALESCE(lp.completed_lessons, 0) AS completed_lessons,
        COALESCE(lp.total_lessons, 0) AS total_lessons,
        COALESCE(lp.progress_percent, 0) AS progress,

        (
          SELECT COUNT(*) 
          FROM project_submissions ps 
          WHERE ps.user_id = u.id
        ) AS submissions_count

      FROM supervisor_students ss
      JOIN users u ON u.id = ss.student_id
      LEFT JOIN profile p ON p.user_id = u.id

      LEFT JOIN (
        SELECT 
          lp.user_id,
          SUM(CASE WHEN lp.is_completed = 1 THEN 1 ELSE 0 END) AS completed_lessons,
          (SELECT COUNT(*) FROM lessons) AS total_lessons,
          CASE 
            WHEN (SELECT COUNT(*) FROM lessons) = 0 THEN 0
            ELSE ROUND(
              (SUM(CASE WHEN lp.is_completed = 1 THEN 1 ELSE 0 END) /
              (SELECT COUNT(*) FROM lessons)) * 100
            )
          END AS progress_percent
        FROM lesson_progress lp
        GROUP BY lp.user_id
      ) lp ON lp.user_id = u.id

      WHERE ss.supervisor_id = ?
        AND u.role = 'student'
      ORDER BY full_name ASC;
    `;

    const rows = await runQuery(sql, [supervisorId]);

    const totalLessons =
      rows.length > 0 ? rows[0].total_lessons || 0 : 0;

    const students = rows.map((r) => ({
      user_id: r.user_id,
      full_name: r.full_name || "Unnamed Student",
      email: r.email || "",
      photo_url: buildPhotoUrl(r.profile_image),

      progress: r.progress || 0,
      completed_lessons: r.completed_lessons || 0,
      total_lessons: r.total_lessons || totalLessons,

      last_active: r.last_login,
      submissions_count: r.submissions_count || 0,

      is_top_performer: (r.progress || 0) >= 80,
      csv_export_ready: true,
    }));

    const avgProgress = students.length
      ? Math.round(students.reduce((s, x) => s + x.progress, 0) / students.length)
      : 0;

    return res.json({
      success: true,
      total_students: students.length,
      total_lessons: totalLessons,
      average_progress: avgProgress,
      students,
    });
  } catch (err) {
    console.error("getSupervisorStudents error:", err);
    res.status(500).json({ message: "Server error" });
  }
}






/* ==========================================================
    GET STUDENT OVERVIEW  
========================================================== */
export async function getStudentOverview(req, res) {
  try {
    const { studentId } = req.params;
    console.log("studentId received:", req.params.studentId);

    /* ----------------------------- 1) BASIC INFO ----------------------------- */
    const basicSql = `
      SELECT 
        u.id AS user_id,
        COALESCE(p.full_name, u.name) AS full_name,
        u.email,
        p.profile_image AS profile_image,
        p.city,
        p.address,
        p.about_me,
        p.phone_number,
        u.last_login
      FROM users u
      LEFT JOIN profile p ON p.user_id = u.id
      WHERE u.id = ?;
    `;
    const [basic] = await runQuery(basicSql, [studentId]);

    if (!basic) {
      return res.status(404).json({ message: "Student not found" });
    }

    /* ----------------------------- 2) LESSON PROGRESS ----------------------------- */
    const lessonSql = `
      SELECT 
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) AS completed_lessons,
        (SELECT COUNT(*) FROM lessons) AS total_lessons,
        ROUND(
            (SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) /
            (SELECT COUNT(*) FROM lessons)) * 100
        ) AS progress_percent
      FROM lesson_progress
      WHERE user_id = ?;
    `;
    const [lessonProgress] = await runQuery(lessonSql, [studentId]);

    /* ----------------------------- 3) QUIZ PROGRESS ----------------------------- */
    const quizSql = `
      SELECT 
        COALESCE(AVG(JSON_EXTRACT(scores, '$[*]')), 0) AS avg_score
      FROM quiz_progress
      WHERE user_id = ?;
    `;
    const [quizProgress] = await runQuery(quizSql, [studentId]);

    /* ----------------------------- 4) PROJECT COUNT ----------------------------- */
    const projectSql = `
      SELECT COUNT(*) AS total_projects
      FROM project_submissions
      WHERE user_id = ?;
    `;
    const [projectProgress] = await runQuery(projectSql, [studentId]);

    /* ----------------------------- 5) TIMELINE ----------------------------- */
    const timelineSql = `
      SELECT 
        'lesson' AS type, 
        lesson_id AS ref_id, 
        NULL AS timestamp
      FROM lesson_progress
      WHERE user_id = ?

      UNION ALL

      SELECT 
        'quiz' AS type, 
        quiz_id AS ref_id, 
        NULL AS timestamp
      FROM quiz_progress
      WHERE user_id = ?

      UNION ALL

      SELECT 
        'project' AS type, 
        id AS ref_id, 
        created_at AS timestamp
      FROM project_submissions
      WHERE user_id = ?

      ORDER BY timestamp IS NULL, timestamp DESC
      LIMIT 50;
    `;

    const timeline = await runQuery(timelineSql, [studentId, studentId, studentId]);

    /* ----------------------------- 6) STATISTICS ----------------------------- */
    const stats = {
      total_projects: projectProgress.total_projects || 0,
      avg_score: quizProgress.avg_score || 0,
      commitment: lessonProgress.progress_percent || 0,
      hours: 0
    };

    return res.json({
      student: {
        user_id: basic.user_id,
        full_name: basic.full_name,
        email: basic.email,
        city: basic.city,
        address: basic.address,
        about_me: basic.about_me,
        phone_number: basic.phone_number,
        last_login: basic.last_login,
        photo_url: buildPhotoUrl(basic.profile_image),
      },
      progress: {
        lessons: lessonProgress.progress_percent || 0,
        quizzes: quizProgress.avg_score || 0,
        projects: projectProgress.total_projects || 0,
      },
      statistics: stats,
      timeline
    });

  } catch (err) {
    console.error("getStudentOverview error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getStudentSubmissions(req, res) {
  try {
    const { studentId } = req.params;

    const sql = `
      SELECT 
        id,
        original_name,
        mime_type,
        size,
        status,
        created_at,
        file_url
      FROM project_submissions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    const rows = await runQuery(sql, [studentId]);

    const cleaned = rows.map((r) => {
      let raw = r.file_url;

      try {
        if (raw && raw.trim().startsWith("{")) {
          const parsed = JSON.parse(raw);
          raw = parsed.url || parsed.file_url || raw;
        }

        if (raw && raw.trim().startsWith("[")) {
          const arr = JSON.parse(raw);
          if (arr[0]) {
            raw = arr[0].url || arr[0].file_url || raw;
          }
        }
      } catch (e) {}

      raw = String(raw || "")
        .replace(/"/g, "")
        .replace(/\\+/g, "")
        .trim();

      const match = raw.match(/\/uploads\/[^"'\s]+/);
      if (match) raw = match[0];

      if (raw && !raw.startsWith("/")) {
        const idx = raw.indexOf("uploads");
        if (idx !== -1) raw = "/" + raw.substring(idx);
      }

      return { ...r, file_url: raw };
    });

    console.log(" FINAL fixed URLs =", cleaned.map(c => c.file_url));
    return res.json(cleaned);

  } catch (err) {
    console.error("getStudentSubmissions ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export const getSupervisorSubmissions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ps.*, u.name AS student_name
      FROM project_submissions ps
      JOIN users u ON u.id = ps.user_id
      ORDER BY ps.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSingleSubmission = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ps.*, u.name AS student_name
       FROM project_submissions ps
       JOIN users u ON ps.user_id = u.id
       WHERE ps.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
