import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const VAPID_KEY =
  "BA8DfpJGlu98A5QDHtkLny9uT6m6ZBGtF8MxKtWAjh8oqfhErkIUyR1jO-ezr96RmYBIZ-oD1fT4mL_dgCSBtkg";

export default function useAdminFCM() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported");
      return;
    }

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(async (registration) => {
        try {
          const fcmToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          if (fcmToken) {
            await axios.post(
              `${API}/api/admin/notifications/fcm-token`,
              { token: fcmToken },
              {
                headers: {
                  Authorization: token.startsWith("Bearer ")
                    ? token
                    : `Bearer ${token}`,
                },
              }
            );
            console.log("Admin FCM token saved");
          }
        } catch (err) {
          console.error(" Error getting FCM token:", err);
        }
      });

    onMessage(messaging, (payload) => {
      console.log(" FCM foreground:", payload);
    });
  }, []);
}
