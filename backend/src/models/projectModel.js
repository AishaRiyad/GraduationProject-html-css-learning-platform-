// backend/src/models/projectModel.js
import pool from "../config/db.js";

// إنشاء جدول المشاريع (مرّة واحدة فقط)
export async function initProjectsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      html TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createTableSQL);
}

// جلب جميع المشاريع لمستخدم معيّن
export async function listProjects(userId) {
  const [rows] = await pool.query("SELECT * FROM projects WHERE user_id = ?", [userId]);
  return rows;
}

// إنشاء مشروع جديد
export async function createProject(userId, { title, html }) {
  const [result] = await pool.query(
    "INSERT INTO projects (user_id, title, html) VALUES (?, ?, ?)",
    [userId, title, html]
  );
  return { id: result.insertId, userId, title, html };
}

// تحديث مشروع موجود
export async function updateProject(userId, id, { title, html }) {
  const [result] = await pool.query(
    "UPDATE projects SET title = ?, html = ? WHERE id = ? AND user_id = ?",
    [title, html, id, userId]
  );
  return result.affectedRows > 0 ? { id, title, html } : null;
}

// حذف مشروع
export async function deleteProject(userId, id) {
  const [result] = await pool.query("DELETE FROM projects WHERE id = ? AND user_id = ?", [
    id,
    userId,
  ]);
  return result.affectedRows > 0;
}
