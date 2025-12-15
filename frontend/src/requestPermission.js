// src/requestPermission.js
import { messaging } from "./firebase";
import { getToken } from "firebase/messaging";
import axios from "axios";

export async function requestPermission() {
  console.log("Requesting permission for notifications...");

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("Notification permission denied.");
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: "BA8DfpJGlu98A5QDHtkLny9uT6m6ZBGtF8MxKtWAjh8oqfhErkIUyR1jO-ezr96RmYBIZ-oD1fT4mL_dgCSBtkg", 
    });

    if (!token) {
      console.log("No FCM token returned.");
      return null;
    }

    console.log("FCM Token (requestPermission):", token);

   
    await axios.post("http://localhost:5000/api/save-token", {
      user_id: 10,
      token: token,
    });

    return token;
  } catch (err) {
    console.error("Error getting FCM token in requestPermission:", err);
    return null;
  }
}
