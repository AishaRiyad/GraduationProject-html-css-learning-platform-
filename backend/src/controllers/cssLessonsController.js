import db from "../config/db.js";
import fs from "fs";
import path from "path";

export const getAllCSSLessons = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, title, order_index FROM css_lessons ORDER BY order_index ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching CSS lessons:", err);
    res.status(500).json({ error: "Failed to fetch CSS lessons" });
  }
};

export const getSingleCSSLesson = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query("SELECT json_path FROM css_lessons WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Lesson not found" });

    const jsonPath = rows[0].json_path;

    // ✅ استخدم src/data بدل data
    const fullPath = path.join(process.cwd(), "src", "data", jsonPath);

    console.log("📁 Reading file from:", fullPath);

    const data = fs.readFileSync(fullPath, "utf8");
if (!data.trim()) {
  return res.status(400).json({ error: `Lesson file ${jsonPath} is empty.` });
}

let lesson;
try {
  lesson = JSON.parse(data);
} catch (parseErr) {
  console.error("⚠️ Invalid JSON in", jsonPath, parseErr.message);
  return res.status(400).json({ error: `Invalid JSON format in ${jsonPath}` });
}


    res.json(lesson);
  } catch (err) {
    console.error("❌ Error fetching CSS lesson:", err);
    res.status(500).json({ error: "Failed to fetch CSS lesson" });
  }
};
