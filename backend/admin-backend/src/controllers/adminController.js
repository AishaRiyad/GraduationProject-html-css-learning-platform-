// backend/admin-backend/src/controllers/adminController.js
import fs from "fs";
import path from "path";
import db from "../../../src/config/db.js";
import { sendPushNotificationToUser } from "../../../src/utils/pushNotifications.js";


/* ================== Helpers ================== */
function safeJson(v) {
  try { return JSON.parse(v); } catch { return v; }
}


// Resolve current admin user id
async function getCurrentAdminId(req) {
  // Prefer authenticated user from middleware
  if (req.user && req.user.id) return req.user.id;

  // Fallback: use the first admin user in the DB
  const [[admin]] = await db.query(
    "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
  );

  return admin?.id || null;
}

/* ================= DASHBOARD / STATS ================= */
export async function getOverviewStats(_req, res) {
  try {
    const [[users]]    = await db.query("SELECT COUNT(*) AS total FROM users");
    const [[students]] = await db.query("SELECT COUNT(*) AS total FROM users WHERE role='student'");
    const [[projects]] = await db.query("SELECT COUNT(*) AS total FROM projects_posts");
    const [[comments]] = await db.query("SELECT COUNT(*) AS total FROM project_comments");
    res.json({ users: users.total, students: students.total, projects: projects.total, comments: comments.total });
  } catch (e) {
    console.error("getOverviewStats:", e);
    res.status(500).json({ message: "Internal server error while loading overview stats." });
  }
}

export async function getRecentActivity(_req, res) {
  try {
    const [latestUsers]    = await db.query("SELECT id,name,email,created_at FROM users ORDER BY created_at DESC LIMIT 5");
    const [latestProjects] = await db.query("SELECT id,title,created_at FROM projects_posts ORDER BY created_at DESC LIMIT 5");
    const [latestComments] = await db.query("SELECT id,comment,created_at FROM project_comments ORDER BY created_at DESC LIMIT 5");
    res.json({ latestUsers, latestProjects, latestComments });
  } catch (e) {
    console.error("getRecentActivity:", e);
    res.status(500).json({ message: "Internal server error while loading recent activity." });
  }
}

/* ================= USERS ================= */
export async function listUsers(req, res) {
  try {
    const { search = "", role = "", level = "", page = 1, limit = 20 } = req.query;
    const off = (Number(page) - 1) * Number(limit);

    const where = [];
    const args  = [];
    if (search) { where.push("(name LIKE ? OR email LIKE ?)"); args.push(`%${search}%`, `%${search}%`); }
    if (role)   { where.push("role = ?"); args.push(role); }
    if (level)  { where.push("level = ?"); args.push(level); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await db.query(
      `SELECT id, name, email, role, level, last_login,
              COALESCE(active, 1) AS active, created_at
       FROM users
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...args, Number(limit), off]
    );
    res.json(rows);
  } catch (e) {
    console.error("listUsers error:", e);
    res.status(500).json({ message: "Internal server error while listing users." });
  }
}

export async function getUser(req, res) {
  try {
    const id = req.params.id;
    const [[user]] = await db.execute(
      "SELECT id,name,email,role,level,last_login,COALESCE(active,1) AS active,created_at FROM users WHERE id=?",
      [id]
    );
    const [progress] = await db.execute(
      "SELECT * FROM quiz_progress WHERE user_id=? ORDER BY updated_at DESC LIMIT 20",
      [id]
    );
    res.json({ user, quiz_progress: progress });
  } catch (e) {
    console.error("getUser:", e);
    res.status(500).json({ message: "Internal server error while loading user details." });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role = "student", level = "basic", active = 1 } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields: name, email, and password are required." });
    }

    const bcrypt = (await import("bcryptjs")).default;
    const hash = await bcrypt.hash(password, 10);

    const [r] = await db.execute(
      "INSERT INTO users (name,email,password,role,level,active,created_at) VALUES (?,?,?,?,?,?,NOW())",
      [name, email, hash, role, level, active ? 1 : 0]
    );

    // Optional notifications/audit; ignore if these tables do not exist
    try {
      await db.execute(
        "INSERT INTO notifications (user_id,type,message) VALUES (NULL,'user.created',?)",
        [`New ${role} created: ${name} (${email})`]
      );
    } catch {}
    try {
      await db.execute(
        "INSERT INTO audit_log (actor_id, action, target_type, target_id, details) VALUES (?,?,?,?,?)",
        [req.user?.id || null, "create_user", "user", r.insertId, JSON.stringify({ name, email, role, level })]
      );
    } catch {}

    res.status(201).json({ id: r.insertId });
  } catch (e) {
    console.error("createUser:", e);
    res.status(500).json({ message: "Internal server error while creating user." });
  }
}

export async function updateUser(req, res) {
  try {
    const id = req.params.id;
    const { name, email, role, level, active } = req.body;

    // Build dynamic UPDATE based on provided fields
    const fields = ["name=?", "email=?", "role=?", "level=?"];
    const vals   = [name, email, role, level];
    if (typeof active !== "undefined") { fields.push("active=?"); vals.push(active ? 1 : 0); }
    vals.push(id);

    await db.execute(`UPDATE users SET ${fields.join(", ")} WHERE id=?`, vals);

    try {
      await db.execute(
        "INSERT INTO notifications (user_id,type,message) VALUES (NULL,'user.updated',?)",
        [`User updated: ${name} (${email})`]
      );
    } catch {}
    try {
      await db.execute(
        "INSERT INTO audit_log (actor_id, action, target_type, target_id, details) VALUES (?,?,?,?,?)",
        [req.user?.id || null, "update_user", "user", id, JSON.stringify({ name, email, role, level, active })]
      );
    } catch {}

    res.json({ ok: true });
  } catch (e) {
    console.error("updateUser:", e);
    res.status(500).json({ message: "Internal server error while updating user." });
  }
}

export async function deleteUser(req, res) {
  const id = req.params.id;
  const force = String(req.query.force || "0") === "1";

  try {
    // First try: normal delete
    await db.execute("DELETE FROM users WHERE id=?", [id]);
    return res.json({ ok: true });
  } catch (e) {
    // 1451 = row is referenced by a foreign key
    const code = e?.code || e?.errno || "";
    if (!force || !(code === "ER_ROW_IS_REFERENCED_2" || code === 1451)) {
      console.error("deleteUser error:", e);
      return res.status(409).json({
        message: `Cannot delete user with ID ${id} because there are related records. Use force=1 to force delete.`,
        code,
      });
    }
  }

  // Force delete: remove dependent records in other tables, then delete user
  try {
    await db.execute("START TRANSACTION");

    // Delete anything that may reference this user
    // (Some of these tables may not exist; failures are intentionally ignored.)
    const uid = [id];

    // Activity and progress
    try { await db.execute("DELETE FROM lesson_progress WHERE user_id=?", uid); } catch {}
    try { await db.execute("DELETE FROM quiz_progress   WHERE user_id=?", uid); } catch {}
    try { await db.execute("DELETE FROM login_events    WHERE user_id=?", uid); } catch {}
    try { await db.execute("DELETE FROM achievements    WHERE user_id=?", uid); } catch {}

    // Profile data
    try { await db.execute("DELETE FROM profile WHERE user_id=?", uid); } catch {}

    // Projects and community activity
    try { await db.execute("DELETE FROM project_comments WHERE user_id=?", uid); } catch {}
    try { await db.execute("DELETE FROM project_likes    WHERE user_id=?", uid); } catch {}
    try { await db.execute("DELETE FROM projects_posts   WHERE user_id=?", uid); } catch {}

    // Project submissions (if they exist)
    try { await db.execute("DELETE FROM project_submissions WHERE user_id=?", uid); } catch {}

    // Direct notifications for this user
    try { await db.execute("DELETE FROM notifications WHERE user_id=?", uid); } catch {}

    // If audit_log has a strict FK, nullify actor_id to keep history
    try { await db.execute("UPDATE audit_log SET actor_id=NULL WHERE actor_id=?", uid); } catch {}

    // Finally: delete the user itself
    await db.execute("DELETE FROM users WHERE id=?", uid);

    await db.execute("COMMIT");
    res.json({ ok: true, forced: true });
  } catch (e2) {
    await db.execute("ROLLBACK");
    console.error("force deleteUser error:", e2);
    res.status(500).json({ message: `Internal server error while force-deleting user with ID ${id}.` });
  }
}

export async function patchUserRole(req, res) {
  try {
    const id = req.params.id;
    const { role } = req.body;
    await db.execute("UPDATE users SET role=? WHERE id=?", [role, id]);
    try {
      await db.execute(
        "INSERT INTO notifications (user_id,type,message) VALUES (NULL,'user.role',?)",
        [`Role of user #${id} set to ${role}`]
      );
    } catch {}
    res.json({ ok: true });
  } catch (e) {
    console.error("patchUserRole:", e);
    res.status(500).json({ message: "Internal server error while updating user role." });
  }
}

export async function patchUserStatus(req, res) {
  try {
    const id = req.params.id;
    const { active } = req.body;
    // If the "active" column exists, it will be updated; otherwise this update is ignored
    try {
      await db.execute("UPDATE users SET active=? WHERE id=?", [active ? 1 : 0, id]);
    } catch {}
    try {
      await db.execute(
        "INSERT INTO notifications (user_id,type,message) VALUES (NULL,'user.status',?)",
        [`Status of user #${id} set to ${active ? "active" : "inactive"}`]
      );
    } catch {}
    res.json({ ok: true });
  } catch (e) {
    console.error("patchUserStatus:", e);
    res.status(500).json({ message: "Internal server error while updating user status." });
  }
}

export async function resetUserPasswordAdmin(req, res) {
  try {
    const id = req.params.id;
    const bcrypt = (await import("bcryptjs")).default;
    const newPass = Math.random().toString(36).slice(2, 10);
    const hash = await bcrypt.hash(newPass, 10);
    await db.execute("UPDATE users SET password=? WHERE id=?", [hash, id]);
    try {
      await db.execute(
        "INSERT INTO notifications (user_id,type,message) VALUES (NULL,'user.password',?)",
        [`Password reset for user #${id}`]
      );
    } catch {}
    res.json({ new_password: newPass });
  } catch (e) {
    console.error("resetUserPasswordAdmin:", e);
    res.status(500).json({ message: "Internal server error while resetting user password." });
  }
}

/* ================= LESSONS (HTML) ================= */
export async function adminListLessons(req, res) {
  try {
    const { level = "" } = req.query;
    const where = level ? "WHERE level=?" : "";
    const args  = level ? [level] : [];
    const [rows] = await db.query(
      `SELECT id,title,lesson_order,level,content_file FROM lessons ${where} ORDER BY lesson_order ASC`,
      args
    );
    res.json(rows);
  } catch (e) { 
    console.error("adminListLessons:", e); 
    res.status(500).json({ message: "Internal server error while listing lessons." }); 
  }
}

export async function adminCreateLesson(req, res) {
  try {
    const { title, lesson_order, level, content_file } = req.body;
    await db.query(
      "INSERT INTO lessons (title, lesson_order, level, content_file) VALUES (?,?,?,?)",
      [title, lesson_order, level, content_file]
    );
    res.status(201).json({ message: "Lesson created successfully." });
  } catch (e) { 
    console.error("adminCreateLesson:", e); 
    res.status(500).json({ message: "Internal server error while creating lesson." }); 
  }
}

export async function adminUpdateLesson(req, res) {
  try {
    const { id } = req.params;
    const { title, lesson_order, level, content_file } = req.body;
    await db.query(
      "UPDATE lessons SET title=?, lesson_order=?, level=?, content_file=? WHERE id=?",
      [title, lesson_order, level, content_file, id]
    );
    res.json({ message: "Lesson updated successfully." });
  } catch (e) { 
    console.error("adminUpdateLesson:", e); 
    res.status(500).json({ message: "Internal server error while updating lesson." }); 
  }
}

export async function adminDeleteLesson(req, res) {
  const lessonId = req.params.id;

  try {
    const [result] = await db.query(
      "DELETE FROM lessons WHERE id = ?",
      [lessonId]
    );

    // No matching lesson
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: `Lesson with ID ${lessonId} was not found.` });
    }

    // Successful delete
    return res.json({
      message: `Lesson with ID ${lessonId} has been successfully deleted.`
    });

  } catch (e) {
    console.error("adminDeleteLesson:", e);

    // Cannot delete due to foreign key references
    if (e.code === "ER_ROW_IS_REFERENCED" || e.code === "ER_ROW_IS_REFERENCED_2") {
      return res
        .status(409)
        .json({
          message: `Lesson with ID ${lessonId} cannot be deleted because it is referenced by other records.`
        });
    }

    // Other errors
    return res
      .status(500)
      .json({ message: `Internal server error while deleting lesson with ID ${lessonId}.` });
  }
}

export async function validateLessonJSON(req, res) {
  try {
    const { id } = req.params;
    const [[row]] = await db.query("SELECT content_file FROM lessons WHERE id=?", [id]);
    if (!row) return res.status(404).json({ message: "Lesson not found." });
    const filePath = path.join(process.cwd(), "src", "data", "lessons", row.content_file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Lesson content file not found on disk." });
    JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json({ ok: true });
  } catch (e) { 
    res.status(400).json({ ok: false, message: `Invalid JSON in lesson content file: ${e.message}` }); 
  }
}

/* ================= CSS LESSONS ================= */
export async function adminListCssLessons(_req, res) {
  try {
    const [rows] = await db.query("SELECT id,title,order_index,json_path FROM css_lessons ORDER BY order_index ASC");
    res.json(rows);
  } catch (e) { 
    console.error("adminListCssLessons:", e); 
    res.status(500).json({ message: "Internal server error while listing CSS lessons." }); 
  }
}

export async function adminCreateCssLesson(req, res) {
  try {
    const { title, order_index, json_path } = req.body;
    await db.query("INSERT INTO css_lessons (title, order_index, json_path) VALUES (?,?,?)", [title, order_index, json_path]);
    res.status(201).json({ message: "CSS lesson created successfully." });
  } catch (e) { 
    console.error("adminCreateCssLesson:", e); 
    res.status(500).json({ message: "Internal server error while creating CSS lesson." }); 
  }
}

export async function adminUpdateCssLesson(req, res) {
  try {
    const { id } = req.params;
    const { title, order_index, json_path } = req.body;
    await db.query("UPDATE css_lessons SET title=?, order_index=?, json_path=? WHERE id=?", [title, order_index, json_path, id]);
    res.json({ message: "CSS lesson updated successfully." });
  } catch (e) { 
    console.error("adminUpdateCssLesson:", e); 
    res.status(500).json({ message: "Internal server error while updating CSS lesson." }); 
  }
}

export async function adminDeleteCssLesson(req, res) {
  try { 
    await db.query("DELETE FROM css_lessons WHERE id=?", [req.params.id]); 
    res.json({ message: "CSS lesson deleted successfully." }); 
  }
  catch (e) { 
    console.error("adminDeleteCssLesson:", e); 
    res.status(500).json({ message: "Internal server error while deleting CSS lesson." }); 
  }
}

export async function validateCssLessonJSON(req, res) {
  try {
    const [[row]] = await db.query("SELECT json_path FROM css_lessons WHERE id=?", [req.params.id]);
    if (!row) return res.status(404).json({ message: "CSS lesson not found." });
    const fullPath = path.join(process.cwd(), "src", "data", row.json_path);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: "CSS lesson JSON file not found on disk." });
    JSON.parse(fs.readFileSync(fullPath, "utf8"));
    res.json({ ok: true });
  } catch (e) { 
    res.status(400).json({ ok: false, message: `Invalid JSON in CSS lesson file: ${e.message}` }); 
  }
}

/* ================= QUIZZES ================= */
export async function adminListQuizLevels(req, res) {
  try {
    const topic = String(req.params.topic || "html");
    const [rows] = await db.query(
      `SELECT id,level_number,title,description,pass_threshold FROM quiz_levels WHERE topic=? ORDER BY level_number ASC`,
      [topic]
    );
    res.json(rows);
  } catch (e) { 
    console.error("adminListQuizLevels:", e); 
    res.status(500).json({ message: "Internal server error while listing quiz levels." }); 
  }
}

export async function adminCreateQuizLevel(req, res) {
  try {
    const topic = String(req.params.topic || "html");
    const { level_number, title, description, pass_threshold = 6 } = req.body;
    await db.query(
      `INSERT INTO quiz_levels (quiz_id,topic,level_number,title,description,pass_threshold) VALUES (1,?,?,?,?,?)`,
      [topic, level_number, title, description, pass_threshold]
    );
    res.status(201).json({ message: "Quiz level created successfully." });
  } catch (e) { 
    console.error("adminCreateQuizLevel:", e); 
    res.status(500).json({ message: "Internal server error while creating quiz level." }); 
  }
}

export async function adminUpdateQuizLevel(req, res) {
  try {
    const { id } = req.params;
    const { title, description, pass_threshold, level_number } = req.body;
    await db.query(
      `UPDATE quiz_levels SET title=?,description=?,pass_threshold=?,level_number=? WHERE id=?`,
      [title, description, pass_threshold, level_number, id]
    );
    res.json({ message: "Quiz level updated successfully." });
  } catch (e) { 
    console.error("adminUpdateQuizLevel:", e); 
    res.status(500).json({ message: "Internal server error while updating quiz level." }); 
  }
}

export async function adminDeleteQuizLevel(req, res) {
  try { 
    await db.query("DELETE FROM quiz_levels WHERE id=?", [req.params.id]); 
    res.json({ message: "Quiz level deleted successfully." }); 
  }
  catch (e) { 
    console.error("adminDeleteQuizLevel:", e); 
    res.status(500).json({ message: "Internal server error while deleting quiz level." }); 
  }
}

export async function adminListQuestions(req, res) {
  try {
    const { levelId } = req.params;
    const [rows] = await db.query(
      `SELECT id,text,q_type,tf_answer,options_json,correct_index FROM quiz_questions WHERE level_id=? ORDER BY id ASC`,
      [levelId]
    );
    res.json(rows.map(r => ({ ...r, options_json: safeJson(r.options_json) })));
  } catch (e) { 
    console.error("adminListQuestions:", e); 
    res.status(500).json({ message: "Internal server error while listing quiz questions." }); 
  }
}

export async function adminCreateQuestion(req, res) {
  try {
    const { levelId } = req.params;
    const { text, q_type, tf_answer = 0, options_json = [], correct_index = 0 } = req.body;
    const opts = Array.isArray(options_json) ? JSON.stringify(options_json) : options_json;
    await db.query(
      `INSERT INTO quiz_questions (level_id,text,q_type,tf_answer,options_json,correct_index) VALUES (?,?,?,?,?,?)`,
      [levelId, text, q_type, tf_answer ? 1 : 0, opts, correct_index]
    );
    res.status(201).json({ message: "Quiz question created successfully." });
  } catch (e) { 
    console.error("adminCreateQuestion:", e); 
    res.status(500).json({ message: "Internal server error while creating quiz question." }); 
  }
}

export async function adminUpdateQuestion(req, res) {
  try {
    const { questionId } = req.params;
    const { text, q_type, tf_answer = 0, options_json = [], correct_index = 0 } = req.body;
    const opts = Array.isArray(options_json) ? JSON.stringify(options_json) : options_json;
    await db.query(
      `UPDATE quiz_questions SET text=?,q_type=?,tf_answer=?,options_json=?,correct_index=? WHERE id=?`,
      [text, q_type, tf_answer ? 1 : 0, opts, correct_index, questionId]
    );
    res.json({ message: "Quiz question updated successfully." });
  } catch (e) { 
    console.error("adminUpdateQuestion:", e); 
    res.status(500).json({ message: "Internal server error while updating quiz question." }); 
  }
}

export async function adminDeleteQuestion(req, res) {
  try { 
    await db.query("DELETE FROM quiz_questions WHERE id=?", [req.params.questionId]); 
    res.json({ message: "Quiz question deleted successfully." }); 
  }
  catch (e) { 
    console.error("adminDeleteQuestion:", e); 
    res.status(500).json({ message: "Internal server error while deleting quiz question." }); 
  }
}

export async function adminQuizProgressOverview(_req, res) {
  try {
    const [rows] = await db.query(
      "SELECT user_id,unlocked_level_ids,scores,updated_at FROM quiz_progress ORDER BY updated_at DESC LIMIT 100"
    );
    res.json({ rows });
  } catch (e) { 
    console.error("adminQuizProgressOverview:", e); 
    res.status(500).json({ message: "Internal server error while loading quiz progress overview." }); 
  }
}

/* ================= PROJECTS & COMMENTS ================= */
export async function adminListProjects(req, res) {
  const { status = "", user = "", from = "", to = "" } = req.query;

  try {
    const where = [];
    const args = [];

    if (status === "hidden")   where.push("p.visible = 0");
    if (status === "featured") where.push("p.featured = 1");
    if (user)  { where.push("p.user_id = ?");  args.push(user); }
    if (from)  { where.push("p.created_at >= ?"); args.push(from); }
    if (to)    { where.push("p.created_at <= ?"); args.push(to); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await db.query(
      `SELECT 
          p.*,
          u.name  AS user_name,
          u.email AS user_email,
          (SELECT COUNT(*) FROM project_likes    WHERE post_id = p.id) AS likes_count,
          (SELECT COUNT(*) FROM project_comments WHERE post_id = p.id) AS comments_count
       FROM projects_posts p
       LEFT JOIN users u ON u.id = p.user_id
       ${whereSql}
       ORDER BY p.created_at DESC`,
      args
    );

    res.json(rows);
  } catch (e) {
    console.error("adminListProjects:", e);
    res.status(500).json({ message: "Internal server error while listing projects." });
  }
}


export async function adminToggleProjectVisibility(req, res) {
  try {
    const { id } = req.params; const { visible } = req.body;
    await db.query("UPDATE projects_posts SET visible=? WHERE id=?", [visible ? 1 : 0, id]);
    res.json({ message: "Project visibility updated successfully." });
  } catch (e) { 
    console.error("adminToggleProjectVisibility:", e); 
    res.status(500).json({ message: "Internal server error while updating project visibility." }); 
  }
}

export async function adminToggleProjectFeatured(req, res) {
  try {
    const { id } = req.params; const { featured } = req.body;
    await db.query("UPDATE projects_posts SET featured=? WHERE id=?", [featured ? 1 : 0, id]);
    res.json({ message: "Project featured status updated successfully." });
  } catch (e) { 
    console.error("adminToggleProjectFeatured:", e); 
    res.status(500).json({ message: "Internal server error while updating project featured status." }); 
  }
}

export async function adminDeleteProject(req, res) {
  try { 
    await db.query("DELETE FROM projects_posts WHERE id=?", [req.params.id]); 
    res.json({ message: "Project deleted successfully." }); 
  }
  catch (e) { 
    console.error("adminDeleteProject:", e); 
    res.status(500).json({ message: "Internal server error while deleting project." }); 
  }
}


/* ================= SUBMISSIONS ================= */
export async function adminListSubmissions(_req, res) {
  try { 
    const [rows] = await db.query("SELECT * FROM project_submissions ORDER BY updated_at DESC LIMIT 200"); 
    res.json(rows); 
  }
  catch (e) { 
    console.error("adminListSubmissions:", e); 
    res.status(500).json({ message: "Internal server error while listing submissions." }); 
  }
}

export async function adminGetSubmissionByUser(req, res) {
  try {
    const [[row]] = await db.query("SELECT * FROM project_submissions WHERE user_id=?", [req.params.userId]);
    if (!row) return res.status(404).json({ message: "Submission for this user was not found." });
    res.json(row);
  } catch (e) { 
    console.error("adminGetSubmissionByUser:", e); 
    res.status(500).json({ message: "Internal server error while loading submission." }); 
  }
}

export async function adminUpdateSubmissionStatus(req, res) {
  try {
    const { userId } = req.params; const { status = "reviewed" } = req.body;
    await db.query("UPDATE project_submissions SET status=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?", [status, userId]);
    res.json({ message: "Submission status updated successfully." });
  } catch (e) { 
    console.error("adminUpdateSubmissionStatus:", e); 
    res.status(500).json({ message: "Internal server error while updating submission status." }); 
  }
}

/* ================= ANNOUNCEMENT ================= */
export async function getAnnouncement(_req, res) {
  try {
    const [[row]] = await db.query("SELECT id,text,enabled,updated_at FROM announcements ORDER BY id DESC LIMIT 1");
    res.json(row || { id: null, text: "", enabled: 0, updated_at: null });
  } catch (e) { 
    console.error("getAnnouncement:", e); 
    res.status(500).json({ message: "Internal server error while loading announcement." }); 
  }
}

export async function upsertAnnouncement(req, res) {
  try {
    const { text = "", enabled = false } = req.body;
    const [[row]] = await db.query("SELECT id FROM announcements ORDER BY id DESC LIMIT 1");
    if (row) {
      await db.query(
        "UPDATE announcements SET text=?, enabled=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        [text, enabled ? 1 : 0, row.id]
      );
    } else {
      await db.query("INSERT INTO announcements (text, enabled) VALUES (?,?)", [text, enabled ? 1 : 0]);
    }
    res.json({ message: "Announcement saved successfully." });
  } catch (e) { 
    console.error("upsertAnnouncement:", e); 
    res.status(500).json({ message: "Internal server error while saving announcement." }); 
  }
}

/* ================= NOTIFICATIONS ================= */
export async function listNotifications(req, res) {
  try {
    // 1) read & sanitize limit
    let limit = parseInt(req.query.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 20;
    if (limit > 100) limit = 100;

    
    const adminId = await getCurrentAdminId(req);

    let sql;
    let params;

    if (adminId) {
      
      sql = `
        SELECT id, user_id, type, message, is_read, created_at
        FROM notifications
        WHERE user_id IS NULL OR user_id = ?
        ORDER BY id DESC
        LIMIT ?
      `;
      params = [adminId, limit];
    } else {
     
      sql = `
        SELECT id, user_id, type, message, is_read, created_at
        FROM notifications
        WHERE user_id IS NULL
        ORDER BY id DESC
        LIMIT ?
      `;
      params = [limit];
    }

    const [rows] = await db.query(sql, params);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (e) {
    console.error("listNotifications:", e);
    res
      .status(500)
      .json({ message: "Internal server error while listing notifications." });
  }
}






export async function markNotificationRead(req, res) {
  try {
    await db.execute("UPDATE notifications SET is_read=1 WHERE id=?", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error("markNotificationRead:", e);
    res.status(500).json({ message: "Internal server error while updating notification status." });
  }
}

/* ================= STATS ================= */
export async function statsOverview(_req, res) {
  try {
    const [[usersCount]]    = await db.execute("SELECT COUNT(*) AS c FROM users");
    const [[projectsCount]] = await db.execute("SELECT COUNT(*) AS c FROM projects_posts");
    const [[commentsCount]] = await db.execute("SELECT COUNT(*) AS c FROM project_comments");
    const [latestUsers]     = await db.execute("SELECT id,name,email,created_at FROM users ORDER BY id DESC LIMIT 5");
    const [latestProjects]  = await db.execute("SELECT id,title,created_at FROM projects_posts ORDER BY id DESC LIMIT 5");
    const [latestComments]  = await db.execute("SELECT id,comment,created_at FROM project_comments ORDER BY id DESC LIMIT 5");
    res.json({
      usersCount: usersCount.c,
      projectsCount: projectsCount.c,
      commentsCount: commentsCount.c,
      latestUsers, latestProjects, latestComments
    });
  } catch (e) { 
    console.error("statsOverview:", e); 
    res.status(500).json({ message: "Internal server error while loading stats overview." }); 
  }
}

export async function statsEngagement(_req, res) {
  try {
    const [logins] = await db.execute(`
      SELECT DATE(occurred_at) d, COUNT(*) c
      FROM login_events
      WHERE occurred_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(occurred_at) ORDER BY d
    `);
    res.json({ loginsByDay: logins });
  } catch (e) { 
    console.error("statsEngagement:", e); 
    res.status(500).json({ message: "Internal server error while loading engagement stats." }); 
  }
}

export async function statsQuizzes(_req, res) {
  try {
    const [rows] = await db.execute(`
      SELECT q.topic, AVG(CASE WHEN qp.passed=1 THEN 1 ELSE 0 END) AS pass_rate
      FROM quiz_progress qp
      JOIN quizzes q ON q.id = qp.quiz_id
      GROUP BY q.topic
    `);
    res.json({ passRates: rows });
  } catch (e) { 
    console.error("statsQuizzes:", e); 
    res.status(500).json({ message: "Internal server error while loading quiz stats." }); 
  }
}

/* === ANALYTICS HELPERS === */
// Safe query helper: returns [] on any error (missing table/column, etc.)
async function q(sql, params = []) {
  try { const [rows] = await db.query(sql, params); return rows; }
  catch (e) { console.warn("[analytics] skipped:", e.code || e.message); return []; }
}

/* ============== ANALYTICS (Overview + Per-User) ============== */
export async function analyticsOverview(_req, res) {
  try {
    // Logins per day for the last 14 days
    const loginsByDay = await q(`
      SELECT DATE(occurred_at) AS d, COUNT(*) AS c
      FROM login_events
      WHERE occurred_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(occurred_at) ORDER BY d ASC
    `);

    // Quiz pass rate per topic
    const quizPassRate = await q(`
      SELECT q.topic,
             AVG(CASE WHEN qp.passed = 1 THEN 1 ELSE 0 END) AS pass_rate
      FROM quiz_progress qp
      JOIN quizzes q ON q.id = qp.quiz_id
      GROUP BY q.topic
    `);

    // Most completed lessons
    const topLessons = await q(`
      SELECT lp.lesson_id, COUNT(*) AS completed
      FROM lesson_progress lp
      WHERE lp.is_completed = 1
      GROUP BY lp.lesson_id
      ORDER BY completed DESC
      LIMIT 10
    `);

    // Project activity for the last 14 days
    const projectsByDay = await q(`
      SELECT DATE(created_at) AS d, COUNT(*) AS c
      FROM projects_posts
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(created_at) ORDER BY d ASC
    `);

    // Comment activity for the last 14 days
    const commentsByDay = await q(`
      SELECT DATE(created_at) AS d, COUNT(*) AS c
      FROM project_comments
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(created_at) ORDER BY d ASC
    `);

    res.json({ loginsByDay, quizPassRate, topLessons, projectsByDay, commentsByDay });
  } catch (e) {
    console.error("analyticsOverview:", e);
    res.status(500).json({ message: "Internal server error while loading analytics overview." });
  }
}

export async function analyticsUsers(_req, res) {
  try {
    const rows = await q(`
      SELECT u.id, u.name, u.email, u.role, u.level, u.last_login, COALESCE(u.active,1) AS active
      FROM users u
      ORDER BY u.id DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (e) {
    console.error("analyticsUsers:", e);
    res.status(500).json({ message: "Internal server error while loading analytics users list." });
  }
}

export async function analyticsUserDetail(req, res) {
  try {
    const userId = req.params.userId;

    // Overall quiz summary (attempts, passes, average score)
    const quizSummaryArr = await q(`
      SELECT COUNT(*) AS attempts,
             SUM(CASE WHEN passed=1 THEN 1 ELSE 0 END) AS passes,
             AVG(score) AS avg_score
      FROM quiz_progress
      WHERE user_id = ?
    `, [userId]);
    const quizSummary = quizSummaryArr[0] || { attempts: 0, passes: 0, avg_score: null };

    // Breakdown by topic
    const quizByTopic = await q(`
      SELECT q.topic,
             COUNT(*) AS attempts,
             SUM(CASE WHEN qp.passed=1 THEN 1 ELSE 0 END) AS passes,
             AVG(qp.score) AS avg_score
      FROM quiz_progress qp
      JOIN quizzes q ON q.id = qp.quiz_id
      WHERE qp.user_id = ?
      GROUP BY q.topic
    `, [userId]);

    // Number of projects and comments for this user
    const projectsCntArr = await q(`SELECT COUNT(*) AS c FROM projects_posts   WHERE user_id=?`, [userId]);
    const commentsCntArr = await q(`SELECT COUNT(*) AS c FROM project_comments WHERE user_id=?`, [userId]);

    // Logins per day for this user in the last 14 days
    const loginsByDay = await q(`
      SELECT DATE(occurred_at) AS d, COUNT(*) AS c
      FROM login_events
      WHERE user_id = ? AND occurred_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY DATE(occurred_at) ORDER BY d ASC
    `, [userId]);

    res.json({
      quizSummary,
      quizByTopic,
      projectsCount: projectsCntArr[0]?.c || 0,
      commentsCount: commentsCntArr[0]?.c || 0,
      loginsByDay,
    });
  } catch (e) {
    console.error("analyticsUserDetail:", e);
    res.status(500).json({ message: "Internal server error while loading user analytics detail." });
  }
}


// List all comments across all projects (with user + post info)
export async function adminListAllComments(req, res) {
  try {
    const limit = Number(req.query.limit || 200);

    const [rows] = await db.query(
      `
      SELECT 
        c.id,
        c.post_id,
        c.user_id,
        u.name       AS user_name,
        u.email      AS user_email,
        p.title      AS post_title,
        c.comment,
        c.reply_to,
        c.created_at
      FROM project_comments c
      LEFT JOIN users          u ON u.id  = c.user_id
      LEFT JOIN projects_posts p ON p.id  = c.post_id
      ORDER BY c.created_at DESC
      LIMIT ?
      `,
      [limit]
    );

    res.json(rows);
  } catch (e) {
    console.error("adminListAllComments:", e);
    res.status(500).json({ message: "Internal server error while listing all comments." });
  }
}


export async function adminListProjectComments(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT id,user_id,comment,created_at FROM project_comments WHERE post_id=? ORDER BY created_at DESC",
      [req.params.id]
    );
    res.json(rows);
  } catch (e) { 
    console.error("adminListProjectComments:", e); 
    res.status(500).json({ message: "Internal server error while listing project comments." }); 
  }
}


/** Admin reply to a comment (stored as another row with reply_to = parent id) */
export async function adminReplyToComment(req, res) {
  try {
    const parentId = Number(req.params.commentId);
    const { text } = req.body;

    if (!Number.isFinite(parentId)) {
      return res.status(400).json({ message: "Invalid comment ID." });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Reply text is required." });
    }

    // Find parent comment to get post_id (and fallback user_id)
    const [[parent]] = await db.query(
      "SELECT post_id, user_id FROM project_comments WHERE id = ?",
      [parentId]
    );

    if (!parent) {
      return res
        .status(404)
        .json({ message: `Parent comment with ID ${parentId} was not found.` });
    }

    const adminId = req.user && req.user.id ? req.user.id : parent.user_id;

    const [r] = await db.query(
      `
      INSERT INTO project_comments (post_id, user_id, comment, reply_to, created_at)
      VALUES (?, ?, ?, ?, NOW())
      `,
      [parent.post_id, adminId, text.trim(), parentId]
    );

    // 🔔 Notification to the original commenter (DB + FCM)
    try {
      if (parent.user_id) {
        const msg = `An admin replied to your comment on project #${parent.post_id}.`;

        
        await db.execute(
          "INSERT INTO notifications (user_id, type, message) VALUES (?,?,?)",
          [parent.user_id, "comment.reply", msg]
        );

        
        await sendPushNotificationToUser(
          parent.user_id,
          "New reply on your comment",
          msg,
          {
            type: "comment_reply",
            post_id: String(parent.post_id),
            parent_comment_id: String(parentId),
            reply_id: String(r.insertId),
          }
        );
      }
    } catch (e) {
      console.warn(
        "adminReplyToComment notification failed:",
        e.code || e.message
      );
    }

    return res.status(201).json({
      id: r.insertId,
      message: "Reply added successfully.",
    });
  } catch (e) {
    console.error(
      "adminReplyToComment error:",
      e.code,
      e.sqlMessage || e.message
    );

    if (
      e.code === "ER_NO_REFERENCED_ROW_2" ||
      e.code === "ER_NO_REFERENCED_ROW"
    ) {
      return res.status(400).json({
        message:
          "Reply could not be saved because it references a non-existing post or user.",
      });
    }

    return res
      .status(500)
      .json({ message: "Internal server error while adding reply." });
  }
}





export async function adminDeleteComment(req, res) {
  try { 
    await db.query("DELETE FROM project_comments WHERE id=?", [req.params.commentId]); 
    res.json({ message: "Comment deleted successfully." }); 
  }
  catch (e) { 
    console.error("adminDeleteComment:", e); 
    res.status(500).json({ message: "Internal server error while deleting comment." }); 
  }
}



/* =============== ADMIN SELF PROFILE (SETTINGS) =============== */

export async function getMyProfile(req, res) {
  try {
    const id = req.user?.id;
    if (!id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token." });
    }

    const [[row]] = await db.query(
      "SELECT id, name, email, role, level, last_login, created_at FROM users WHERE id=?",
      [id]
    );

    if (!row) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(row);
  } catch (e) {
    console.error("getMyProfile:", e);
    res
      .status(500)
      .json({ message: "Internal server error while loading profile." });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const id = req.user?.id;
    if (!id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token." });
    }

    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Both name and email are required.",
      });
    }

    try {
      await db.query(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, id]
      );
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ message: "This email is already in use by another user." });
      }
      throw e;
    }

    res.json({ message: "Profile updated successfully." });
  } catch (e) {
    console.error("updateMyProfile:", e);
    res
      .status(500)
      .json({ message: "Internal server error while updating profile." });
  }
}

export async function changeMyPassword(req, res) {
  try {
    const id = req.user?.id;
    if (!id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: no user in token." });
    }

    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long.",
      });
    }

    const [[row]] = await db.query(
      "SELECT password FROM users WHERE id = ?",
      [id]
    );

    if (!row) {
      return res.status(404).json({ message: "User not found." });
    }

    const bcrypt = (await import("bcryptjs")).default;

    const matches = await bcrypt.compare(current_password, row.password);
    if (!matches) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    const hash = await bcrypt.hash(new_password, 10);

    await db.execute(
      "UPDATE users SET password = ?, password_length = ? WHERE id = ?",
      [hash, new_password.length, id]
    );

    res.json({ message: "Password changed successfully." });
  } catch (e) {
    console.error("changeMyPassword:", e);
    res
      .status(500)
      .json({ message: "Internal server error while changing password." });
  }
}