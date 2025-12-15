// backend/src/utils/pushHelper.js
import pool from "../config/db.js";
import admin from "../firebaseAdmin.js";


export async function sendPush(userId, { title, body }) {
 
  const [rows] = await pool.query(
    "SELECT token FROM device_tokens WHERE user_id = ?",
    [userId]
  );

  if (!rows.length) {
    console.log(" No device tokens for user", userId);
    return;
  }

  
  for (const row of rows) {
    try {
      await admin.messaging().send({
        token: row.token,
        notification: { title, body },
      });
      console.log("Push sent to", row.token);
    } catch (err) {
      console.error("Error sending push:", err.message);
    }
  }
}
