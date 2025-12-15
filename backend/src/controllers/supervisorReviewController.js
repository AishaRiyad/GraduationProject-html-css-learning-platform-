import db from "../config/db.js";

export const addReview = async (req, res) => {
  const { submission_id, supervisor_id, rating, feedback } = req.body;

  if (!submission_id || !supervisor_id || !rating) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO project_submission_reviews (submission_id, supervisor_id, rating, feedback)
       VALUES (?, ?, ?, ?)`,
      [submission_id, supervisor_id, rating, feedback]
    );

    res.json({ success: true, message: "Review added successfully" });
  } catch (err) {
    console.error("Add Review Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getReviewForSubmission = async (req, res) => {
  const { submissionId } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM project_submission_reviews WHERE submission_id = ?`,
      [submissionId]
    );

    res.json(rows[0] || null);
  } catch (err) {
    console.error("Get Review Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
