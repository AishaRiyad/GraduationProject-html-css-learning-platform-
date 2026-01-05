import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { getSocket } from "../socket"; 


const API = "http://10.0.2.2:5000"; // Android emulator

async function getAuthHeader() {
  const token = await AsyncStorage.getItem("token");
  if (!token) return null;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

export default function useAdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let socket;

    (async () => {
      const auth = await getAuthHeader();
      if (!auth) return;

      // 1) fetch latest notifications
      try {
        const res = await axios.get(`${API}/api/admin/notifications?limit=20`, {
          headers: { Authorization: auth },
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      } catch {}

      // 2) socket realtime
      socket = await getSocket(); 
      if (!socket) return;

      socket.on("connect_error", async (err) => {
        if (String(err?.message || "").includes("jwt expired")) {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          try {
            socket.disconnect();
          } catch {}
          Alert.alert("Session expired", "Please login again.");
        }
      });

      socket.on("notifications:new", (notif) => {
        if (!notif?.id) return;

        setNotifications((prev) => {
          if (prev.some((n) => n.id === notif.id)) return prev;
          return [notif, ...prev];
        });

        if (!notif?.is_read) setUnreadCount((c) => c + 1);
      });
    })();

    return () => {
      try {
        if (socket) socket.disconnect();
      } catch {}
    };
  }, []);

  const markAsRead = async (id) => {
    const auth = await getAuthHeader();
    if (!auth) return;

    try {
      await axios.post(
        `${API}/api/admin/notifications/${id}/read`,
        {},
        { headers: { Authorization: auth } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  return { notifications, unreadCount, markAsRead };
}
