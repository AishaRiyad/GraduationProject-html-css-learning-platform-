// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");


firebase.initializeApp({
  apiKey: "AIzaSyBQUTp5g56jTZ66gfmE08Q1gVf_z94VdUY",
  authDomain: "html-learning-project-58b5c.firebaseapp.com",
  projectId: "html-learning-project-58b5c",
  storageBucket: "html-learning-project-58b5c.firebasestorage.app",
  messagingSenderId: "723669871988",
  appId: "1:723669871988:web:652a7772fdb2db098a1021",
  measurementId: "G-CR7QC025SD",
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw] Background message:", payload);

  const notificationTitle = payload.notification?.title || "New notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


