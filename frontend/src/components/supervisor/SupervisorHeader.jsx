import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { getSocket } from "../../socket";

const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function authHeaders(extra = {}) {
  const t = localStorage.getItem("token");
  if (!t) return { ...extra };
  const auth = t.startsWith("Bearer ") ? t : `Bearer ${t}`;
  return { ...extra, Authorization: auth };
}

export default function SupervisorHeader({ user }) {
  // ✅ Hooks لازم تيجي أولًا دايمًا
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter((n) => Number(n.is_read) === 0).length;

  // ✅ نحدد إذا بدنا نخفي الهيدر (بدون return هون)
  const path =
    typeof window !== "undefined" ? window.location.pathname : "";
  const hide = path === "/supervisor-dashboard";

  async function load() {
    const r = await fetch(`${ROOT}/api/notifications?limit=10`, {
      headers: authHeaders(),
    });
    if (r.ok) {
      const data = await r.json();
      setNotifications(Array.isArray(data) ? data : []);
    }
  }

  async function markAllRead() {
    await Promise.all(
      notifications
        .filter((n) => Number(n.is_read) === 0)
        .map((n) =>
          fetch(`${ROOT}/api/notifications/${n.id}/read`, {
            method: "POST",
            headers: authHeaders(),
          })
        )
    );
    setNotifications((prev) => prev.map((x) => ({ ...x, is_read: 1 })));
  }

  // ✅ useEffect دايمًا موجود، بس نعمل skip إذا hide
  useEffect(() => {
    if (hide) return;

    load();

    const socket = getSocket();
    if (!socket) return;

    const onNotif = (n) => {
      setNotifications((old) =>
        old.some((x) => String(x.id) === String(n.id)) ? old : [n, ...old]
      );
    };

    socket.on("notifications:new", onNotif);
    return () => socket.off("notifications:new", onNotif);
  }, [hide]);

  useEffect(() => {
    if (hide) return;

    const h = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [hide]);

  // ✅ بعد ما خلصنا كل hooks/effects، هون مسموح نعمل return null
  if (hide) return null;

  return (
    <div className="w-full bg-white border-b shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold">Supervisor Dashboard</h1>

      <div className="flex items-center gap-6 relative" ref={ref}>
        <button
          type="button"
          onClick={() => {
            setOpen(!open);
            if (!open) load();
          }}
          className="relative"
        >
          <Bell className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-80 bg-white border rounded-xl shadow">
            <div className="flex justify-between px-3 py-2 border-b">
              <span className="font-semibold text-sm">Notifications</span>
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-pink-600"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-3 py-2 text-sm border-b ${
                      Number(n.is_read) === 0 ? "bg-yellow-50" : ""
                    }`}
                  >
                    {n.message}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <img
            src={user?.profile_image || "/user-avatar.jpg"}
            alt=""
            className="w-9 h-9 rounded-full"
          />
          <span className="font-semibold">{user?.name}</span>
        </div>
      </div>
    </div>
  );
}
