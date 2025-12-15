import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function useAdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const auth = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    axios
      .get(`${API}/api/admin/notifications?limit=20`, {
        headers: { Authorization: auth },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      })
      .catch(() => {});

    const socket = io(API, {
      auth: { token: auth },
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect_error", (err) => {
      if (String(err?.message || "").includes("jwt expired")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        try {
          socket.disconnect();
        } catch {}
        window.location.href = "/login";
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

    return () => {
      try {
        socket.disconnect();
      } catch {}
    };
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const auth = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

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
