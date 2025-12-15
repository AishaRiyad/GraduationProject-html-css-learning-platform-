import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { requestFCMToken } from "./firebase";
import { getMyProfile } from "./AdminApi";
import { getSocket } from "./socket";

const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function parseNotifData(n) {
  try {
    if (!n) return null;
    if (typeof n.data === "object" && n.data) return n.data;
    if (typeof n.data === "string" && n.data.trim()) return JSON.parse(n.data);
    return null;
  } catch {
    return null;
  }
}

export default function AdminHeader() {
  const nav = useNavigate();
  const [noti, setNoti] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  function authHeaders(extra = {}) {
    const t = localStorage.getItem("token");
    return {
      ...(t ? { Authorization: t.startsWith("Bearer ") ? t : `Bearer ${t}` } : {}),
      ...extra,
    };
  }

  useEffect(() => {
    async function loadMe() {
      try {
        const data = await getMyProfile();
        setAdminUser(data || null);
      } catch (e) {
        console.error("Failed to load admin profile:", e);
      }
    }
    loadMe();
  }, []);

  async function loadNoti() {
    try {
      const r = await fetch(`${ROOT}/api/notifications?limit=5`, {
        headers: authHeaders(),
      });
      if (r.ok) {
        const data = await r.json();
        setNoti(Array.isArray(data) ? data : []);
      }
    } catch {}
  }

  async function markAllRead() {
    try {
      const unread = noti.filter((n) => Number(n.is_read) === 0);
      await Promise.all(
        unread.map((n) =>
          fetch(`${ROOT}/api/notifications/${n.id}/read`, {
            method: "POST",
            headers: authHeaders(),
          })
        )
      );
      setNoti((old) => old.map((n) => ({ ...n, is_read: 1 })));
    } catch {}
  }

  useEffect(() => {
    loadNoti();
    const t = setInterval(loadNoti, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;

    requestFCMToken().then((fcmToken) => {
      if (!fcmToken) return;

      fetch(`${ROOT}/api/admin/notifications/fcm-token`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ token: fcmToken }),
      }).catch((err) => {
        console.error("Error saving FCM token:", err);
      });
    });
  }, []);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onNotif = (notif) => {
      setNoti((old) => {
        if (!notif) return old;
        if (old.some((n) => String(n.id) === String(notif.id))) return old;
        return [notif, ...old].slice(0, 5);
      });
    };

    s.on("notifications:new", onNotif);
    return () => s.off("notifications:new", onNotif);
  }, []);

  const unreadCount = noti.filter((n) => Number(n.is_read) === 0).length;

  const linkDesktop = (to, label) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `text-sm md:text-base hover:underline ${isActive ? "font-bold text-pink-800" : ""}`
      }
    >
      {label}
    </NavLink>
  );

  const linkMobile = (to, label) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `block w-full text-left px-2 py-1 rounded-lg text-sm ${
          isActive ? "bg-yellow-200 text-pink-800 font-semibold" : "hover:bg-yellow-100"
        }`
      }
      onClick={() => setMenuOpen(false)}
    >
      {label}
    </NavLink>
  );

  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "");

  async function markSingleRead(id) {
    try {
      await fetch(`${ROOT}/api/notifications/${id}/read`, {
        method: "POST",
        headers: authHeaders(),
      });
      setNoti((old) => old.map((x) => (x.id === id ? { ...x, is_read: 1 } : x)));
    } catch {}
  }

  function handleNotifClick(n) {
    setNotiOpen(false);

    if (Number(n.is_read) === 0) markSingleRead(n.id);

    if (n.type === "chat") {
      const data = parseNotifData(n);
      const partnerId = Number(data?.partnerId || n.partnerId || n.partner_id);
      if (partnerId) {
        nav(`/admin/chat?partner=${partnerId}`);
        return;
      }
      nav("/admin/chat");
      return;
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-yellow-100 to-yellow-200 border-b border-yellow-300">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between relative">
        <div className="font-black text-pink-700 text-xl">Admin Console</div>

        <nav className="hidden md:flex items-center gap-4">
          {linkDesktop("/admin", "Dashboard")}
          {linkDesktop("/admin/users", "Users")}
          {linkDesktop("/admin/lessons", "Lessons")}
          {linkDesktop("/admin/css-lessons", "CSS Lessons")}
          {linkDesktop("/admin/quizzes", "Quizzes")}
          {linkDesktop("/admin/projects", "Projects")}
          {linkDesktop("/admin/comments", "Comments")}
          {linkDesktop("/admin/analytics", "Analytics")}
          {linkDesktop("/admin/settings", "Settings")}
          {linkDesktop("/admin/chat", "Chat")}

          <button
            type="button"
            className="relative ml-2"
            onClick={() => setNotiOpen((v) => !v)}
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 text-xs bg-pink-600 text-white rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 ml-2">
            <img
              src={adminUser?.profile_image || "/user-avatar.jpg"}
              alt={adminUser?.name || "Admin"}
              className="w-8 h-8 rounded-full object-cover border border-yellow-300"
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-pink-800">
                {adminUser?.name || "Admin"}
              </div>
              <div className="text-[10px] text-slate-500">
                {adminUser?.role || "admin"}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              nav("/login");
            }}
            className="ml-2 text-sm underline"
          >
            Logout
          </button>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <div className="flex items-center gap-2">
            <img
              src={adminUser?.profile_image || "/user-avatar.jpg"}
              alt={adminUser?.name || "Admin"}
              className="w-8 h-8 rounded-full object-cover border border-yellow-300"
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-pink-800">
                {adminUser?.name || "Admin"}
              </div>
              <div className="text-[10px] text-slate-500">
                {adminUser?.role || "admin"}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="relative"
            onClick={() => setNotiOpen((v) => !v)}
          >
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 text-xs bg-pink-600 text-white rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              nav("/login");
            }}
            className="text-xs underline"
          >
            Logout
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded-md border border-yellow-400 bg-yellow-100"
            aria-label="Toggle navigation"
          >
            <span className="block w-5 h-0.5 bg-pink-700 mb-1" />
            <span className="block w-5 h-0.5 bg-pink-700 mb-1" />
            <span className="block w-5 h-0.5 bg-pink-700" />
          </button>
        </div>

        {notiOpen && (
          <div className="absolute right-4 top-full mt-2 w-80 bg-white border border-yellow-300 rounded-2xl shadow-lg z-50">
            <div className="flex items-center justify-between px-3 py-2 border-b border-yellow-200">
              <span className="font-semibold text-pink-800 text-sm">Notifications</span>
              <button
                className="text-xs text-pink-700 hover:underline"
                onClick={markAllRead}
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {noti.length === 0 && (
                <div className="px-3 py-2 text-sm text-slate-500">
                  No notifications yet.
                </div>
              )}

              {noti.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`px-3 py-2 text-sm border-b last:border-b-0 cursor-pointer hover:bg-yellow-50 ${
                    Number(n.is_read) === 0 ? "bg-yellow-50" : "bg-white"
                  }`}
                >
                  <div className="text-slate-800">{n.message}</div>
                  <div className="text-xs text-slate-400">{fmtDate(n.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-yellow-300 bg-yellow-50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-1">
            {linkMobile("/admin", "Dashboard")}
            {linkMobile("/admin/users", "Users")}
            {linkMobile("/admin/lessons", "Lessons")}
            {linkMobile("/admin/css-lessons", "CSS Lessons")}
            {linkMobile("/admin/quizzes", "Quizzes")}
            {linkMobile("/admin/projects", "Projects")}
            {linkMobile("/admin/comments", "Comments")}
            {linkMobile("/admin/analytics", "Analytics")}
            {linkMobile("/admin/settings", "Settings")}
            {linkMobile("/admin/chat", "Chat")}
          </div>
        </nav>
      )}
    </header>
  );
}
