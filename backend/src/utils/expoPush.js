import fetch from "node-fetch";
import pool from "../config/db.js";

export async function sendExpoPushNotification(userId, { title, body }) {
  const [rows] = await pool.query(
    "SELECT expo_token FROM expo_tokens WHERE user_id = ?",
    [userId]
  );

  if (!rows.length) {
    console.log(" No Expo token found for user:", userId);
    return;
  }

  for (const row of rows) {
    const token = row.expo_token;

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title,
        body,
      }),
    });

    console.log(" Expo push sent to:", token);
  }
}
