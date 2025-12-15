// backend/src/utils/pushNotifications.js
import db from "../config/db.js";
import admin from "../config/firebaseAdmin.js";

function normalizeData(data = {}) {
  const result = {};
  for (const [k, v] of Object.entries(data)) {
    result[k] = v != null ? String(v) : "";
  }
  return result;
}

export async function sendPushNotificationToAdmins(title, body, data = {}) {
  try {
    const [admins] = await db.query(
      "SELECT fcm_token FROM users WHERE role = 'admin' AND fcm_token IS NOT NULL"
    );

    if (!admins.length) {
      console.log(" No admin FCM tokens found");
      return;
    }

    const tokens = admins
      .map((a) => a.fcm_token)
      .filter(Boolean);

    if (!tokens.length) {
      console.log(" Admins do not have FCM tokens yet");
      return;
    }

    const message = {
      notification: { title, body },
      data: normalizeData(data),
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log("FCM sent:", response.successCount, "success,", response.failureCount, "failed");
  } catch (err) {
    console.error("sendPushNotificationToAdmins error:", err.message || err);
  }
}

export async function sendPushNotificationToUser(
  userId,
  title,
  body,
  data = {}
) {
  try {
    const [rows] = await db.query(
      "SELECT fcm_token FROM users WHERE id = ? AND fcm_token IS NOT NULL",
      [userId]
    );

    if (!rows.length) {
      console.log(` No FCM token for user ${userId}`);
      return;
    }

    const tokens = rows.map((r) => r.fcm_token).filter(Boolean);
    if (!tokens.length) {
      console.log(` User ${userId} has no valid FCM token`);
      return;
    }

    const message = {
      notification: { title, body },
      data: normalizeData({ userId, ...data }),
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(
      `FCM to user ${userId}:`,
      response.successCount,
      "success,",
      response.failureCount,
      "failed"
    );
  } catch (err) {
    console.error("sendPushNotificationToUser error:", err.message || err);
  }
}
