import db from "../config/db.js";

/* =======================
    CHALLENGES SECTION
======================= */


export const createChallenge = async (req, res) => {
  try {
    const { title, description, difficulty, deadline } = req.body;
    const user_id = req.user.id;

    await db.query(
      "INSERT INTO challenges (title, description, difficulty, created_by, deadline) VALUES (?, ?, ?, ?, ?)",
      [title, description, difficulty, user_id, deadline]
    );

    res.status(201).json({ message: "Challenge created successfully ✅" });
  } catch (err) {
    console.error("❌ Error creating challenge:", err);
    res.status(500).json({ error: "Error creating challenge" });
  }
};


export const getAllChallenges = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let query = "SELECT * FROM challenges";
    const params = [];

    if (difficulty) {
      query += " WHERE difficulty = ?";
      params.push(difficulty);
    }

    const [rows] = await db.query(query + " ORDER BY created_at DESC", params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching challenges" });
  }
};


export const getChallengeById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM challenges WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Challenge not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching challenge" });
  }
};


export const getWeeklyChallenges = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM challenges 
      WHERE WEEK(created_at) = WEEK(CURRENT_DATE())
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching weekly challenges" });
  }
};


export const updateChallenge = async (req, res) => {
  try {
    const { title, description, difficulty, deadline } = req.body;
    await db.query(
      "UPDATE challenges SET title=?, description=?, difficulty=?, deadline=? WHERE id=?",
      [title, description, difficulty, deadline, req.params.id]
    );
    res.json({ message: "Challenge updated ✅" });
  } catch (err) {
    res.status(500).json({ error: "Error updating challenge" });
  }
};

export const deleteChallenge = async (req, res) => {
  try {
    await db.query("DELETE FROM challenges WHERE id=?", [req.params.id]);
    res.json({ message: "Challenge deleted 🗑️" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting challenge" });
  }
};

/* =======================
    SUBMISSIONS SECTION
======================= */


export const submitChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; 
    const htmlFile = req.files?.html?.[0];
    const cssFile = req.files?.css?.[0];

    if (!htmlFile && !cssFile) {
      return res.status(400).json({ error: "Please upload at least one file (HTML or CSS)" });
    }

    const htmlPath = htmlFile ? `/uploads/${htmlFile.filename}` : null;
    const cssPath = cssFile ? `/uploads/${cssFile.filename}` : null;

   
    const htmlName = htmlFile ? htmlFile.originalname : null;
    const cssName = cssFile ? cssFile.originalname : null;

    await db.query(
      `INSERT INTO challenge_submissions 
        (challenge_id, user_id, html_path, css_path, html_name, css_name, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, userId, htmlPath, cssPath, htmlName, cssName]
    );

    res.json({ message: "✅ Submission uploaded successfully" });
  } catch (err) {
    console.error("❌ Error submitting challenge:", err);
    res.status(500).json({ error: "Server error while submitting challenge" });
  }
};



export const getSubmissionsForChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; 

    const [rows] = await db.query(
      `
      SELECT 
        cs.id,
        cs.challenge_id,
        cs.user_id,
        cs.html_path,
        cs.css_path,
        cs.html_name,
        cs.css_name,
        cs.submitted_at,
        u.name AS user_name
      FROM challenge_submissions cs
      LEFT JOIN users u ON cs.user_id = u.id
      WHERE cs.challenge_id = ? AND cs.user_id = ?
      ORDER BY cs.submitted_at DESC
      `,
      [id, userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching submissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};





export const getMySubmissions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const [rows] = await db.query(
      `SELECT cs.*, c.title 
       FROM challenge_submissions cs 
       JOIN challenges c ON cs.challenge_id = c.id 
       WHERE cs.user_id = ? ORDER BY cs.submitted_at DESC`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching your submissions" });
  }
};


export const evaluateSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    await db.query(
      "UPDATE challenge_submissions SET ai_score=?, feedback=? WHERE id=?",
      [score, feedback, req.params.id]
    );

    res.json({ message: "Submission evaluated ✅" });
  } catch (err) {
    res.status(500).json({ error: "Error evaluating submission" });
  }
};


export const getTopSubmissions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cs.*, u.full_name FROM challenge_submissions cs
       JOIN users u ON cs.user_id = u.id
       WHERE challenge_id = ?
       ORDER BY ai_score DESC LIMIT 3`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching top submissions" });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const [result] = await db.query(
      "DELETE FROM challenge_submissions WHERE id = ?",
      [submissionId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Submission not found" });

    res.json({ message: "✅ Submission deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting submission:", error);
    res.status(500).json({ error: "Server error while deleting submission" });
  }
};

export const updateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const htmlFile = req.files?.html?.[0];
    const cssFile = req.files?.css?.[0];

    if (!htmlFile && !cssFile)
      return res.status(400).json({ error: "No files uploaded" });

    const updateFields = [];
    const params = [];

    if (htmlFile) {
      updateFields.push("html_path = ?");
      params.push(`/uploads/${htmlFile.filename}`);
    }
    if (cssFile) {
      updateFields.push("css_path = ?");
      params.push(`/uploads/${cssFile.filename}`);
    }

    params.push(submissionId);

    const [result] = await db.query(
      `UPDATE challenge_submissions SET ${updateFields.join(", ")} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Submission not found" });

    res.json({ message: "✅ Submission updated successfully" });
  } catch (error) {
    console.error("❌ Error updating submission:", error);
    res.status(500).json({ error: "Server error while updating submission" });
  }
};

