import db from "../config/db.js";  

//
export async function saveToken(req, res) {
  try {
    const { user_id, token } = req.body;

    if (!user_id || !token) {
      return res.status(400).json({ error: "Missing user_id or token" });
    }

    await db.query(
      "INSERT INTO device_tokens (user_id, token, platform) VALUES (?, ?, 'web')",
      [user_id, token]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving token:", err);
    res.status(500).json({ error: "Server error" });
  }
}
