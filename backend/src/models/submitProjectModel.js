import db from "../config/db.js";

export async function getProjectBySlug(slug) {
  const [rows] = await db.execute("SELECT * FROM submit_projects WHERE slug = ? LIMIT 1", [slug]);
  return rows[0] || null;
}
export async function getProjectById(id) {
  const [rows] = await db.execute("SELECT * FROM submit_projects WHERE id = ? LIMIT 1", [id]);
  return rows[0] || null;
}

export async function getUserSubmission(userId) {
  const [rows] = await db.execute(
    `SELECT * FROM project_submissions WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function upsertSubmission({ userId, file_url, original_name, mime_type, size }) {
  const [exists] = await db.execute(
    `SELECT id FROM project_submissions WHERE user_id = ? LIMIT 1`,
    [userId]
  );

  if (exists.length) {
    await db.execute(
      `UPDATE project_submissions
       SET file_url = ?, original_name = ?, mime_type = ?, size = ?, status = 'replaced',
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [file_url, original_name, mime_type, size, userId]
    );
  } else {
    await db.execute(
      `INSERT INTO project_submissions (user_id, file_url, original_name, mime_type, size, status)
       VALUES (?, ?, ?, ?, ?, 'submitted')`,
      [userId, file_url, original_name, mime_type, size]
    );
  }
}

export async function deleteSubmission(userId) {
  await db.execute(`DELETE FROM project_submissions WHERE user_id = ?`, [userId]);
}
