// frontend/src/admin-front/src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBQUTp5g56jTZ66gfmE08Q1gVf_z94VdUY",
  authDomain: "html-learning-project-58b5c.firebaseapp.com",
  projectId: "html-learning-project-58b5c",
  storageBucket: "html-learning-project-58b5c.firebasestorage.app",
  messagingSenderId: "723669871988",
  appId: "1:723669871988:web:652a7772fdb2db098a1021",
  measurementId: "G-CR7QC025SD"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export async function requestFCMToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey:
        "BA8DfpJGlu98A5QDHtkLny9uT6m6ZBGtF8MxKtWAjh8oqfhErkIUyR1jO-ezr96RmYBIZ-oD1fT4mL_dgCSBtkg",
    });

    if (token) {
      console.log(" FCM TOKEN (admin-front):", token);
      return token;
    } else {
      console.log("No token returned (user maybe denied permission)");
      return null;
    }
  } catch (err) {
    console.error(" Error getting FCM token (admin-front):", err);
    return null;
  }
}

export function listenForegroundMessages() {
  onMessage(messaging, (payload) => {
    console.log(" FCM foreground message (admin-front):", payload);
  });
}
