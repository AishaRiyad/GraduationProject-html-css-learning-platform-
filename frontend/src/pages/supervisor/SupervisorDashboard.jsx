import React, { useState, useEffect } from "react";

import {
  HomeIcon,
  UserCircleIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

import SupervisorProfile from "./SupervisorProfile";
import HomeContent from "./HomeContent";
import MyStudent from "./MyStudent";
import SupervisorSubmissions from "./SupervisorSubmissions";
import SupervisorTasks from "./SupervisorTasks";
import SupervisorMessages from "./SupervisorMessages";

import EvaluateStudents from "./EvaluateStudents";
import SupervisorSessions from "./SupervisorSessions";

import { io } from "socket.io-client";

const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function SupervisorDashboard({ supervisorId }) {
  const [unreadSupervisor, setUnreadSupervisor] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [user, setUser] = useState(null);
  const [active, setActive] = useState("Home");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");

      if (!raw) {
        window.location.href = "/login";
        return;
      }

      const parsed = JSON.parse(raw);

      if (!parsed || !parsed.id || !parsed.role) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      setUser(parsed);
    } catch (err) {
      console.error("Invalid JSON in localStorage(user):", err);
      localStorage.clear();
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const s = io(ROOT, {
      auth: { token: token.startsWith("Bearer ") ? token : `Bearer ${token}` },
    });

    const addUiNotif = (n) => {
      const id = n?.id ? String(n.id) : null;

      setNotifications((prev) => {
        if (id && prev.some((x) => String(x.id) === id)) return prev;

        const createdAt = n?.created_at || new Date().toISOString();

        let partnerId = null;
        try {
          const dataObj =
            typeof n?.data === "string" ? JSON.parse(n.data) : n?.data || {};
          partnerId = dataObj?.partnerId ?? dataObj?.from ?? null;
        } catch {}

        const uiItem = {
          id: n?.id ?? `${Date.now()}-${Math.random()}`,
          type: n?.type || "notification",
          studentId: partnerId,
          message: n?.message || "New notification",
          time: createdAt,
          data: n?.data,
        };

        return [uiItem, ...prev];
      });

      if (Number(n?.is_read) === 0 || n?.is_read === undefined) {
        setUnreadSupervisor((prev) => prev + 1);
      }
    };

    s.on("new_unread_message", (payload) => {
      if (payload?.to === user.id) {
        setUnreadSupervisor((prev) => prev + 1);

        setNotifications((prev) => [
          {
            id: `${Date.now()}-${Math.random()}`,
            type: "message",
            studentId: payload.from,
            message: payload.content,
            time: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    });

    s.on("task_submitted", (payload) => {
      setUnreadSupervisor((prev) => prev + 1);

      setNotifications((prev) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          type: "submission",
          studentId: payload.studentId,
          message: payload.message,
          time: payload.time || new Date().toISOString(),
          taskId: payload.taskId,
        },
        ...prev,
      ]);
    });

    s.on("notifications:new", (notif) => {
      addUiNotif(notif);
    });

    return () => {
      s.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (active === "Messages") {
      setUnreadSupervisor(0);
    }
  }, [active]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700 text-xl">
        Loading...
      </div>
    );
  }

  const menuItems = [
    { label: "Home", icon: HomeIcon },
    { label: "Profile", icon: UserCircleIcon },
    { label: "My Students", icon: UsersIcon },
    { label: "Submissions", icon: ClipboardDocumentListIcon },
    { label: "Tasks", icon: ClipboardDocumentCheckIcon },
    { label: "Sessions", icon: ClipboardDocumentListIcon },
    { label: "Evaluate Students", icon: UsersIcon },
    { label: "Messages", icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <div className="relative w-64 bg-white shadow-xl border-r flex flex-col py-6">
        <h2 className="text-2xl font-extrabold px-6 mb-8 text-yellow-600 tracking-tight">
          Supervisor
        </h2>

        <div
          className="absolute left-0 w-2 bg-yellow-500 rounded-r-full transition-all duration-300"
          style={{
            top: `${menuItems.findIndex((m) => m.label === active) * 56 + 98}px`,
            height: "48px",
          }}
        />

        <div className="mt-2 space-y-1 relative z-10">
          {menuItems.map(({ label, icon: Icon }) => (
            <div
              key={label}
              onClick={() => setActive(label)}
              className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition 
              ${
                active === label
                  ? "bg-yellow-100 text-yellow-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </div>
          ))}
        </div>

        <div className="mt-auto px-6">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500
            text-black font-semibold rounded-xl shadow hover:scale-105 transition"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 h-full overflow-y-auto">
        <div className="w-full bg-white/80 backdrop-blur-md shadow p-4 px-6 flex justify-between items-center border-b sticky top-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {active}
          </h1>

          <div className="flex items-center gap-6 relative">
            <div
              className="relative cursor-pointer group"
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setUnreadSupervisor(0);
              }}
            >
              <BellIcon className="h-7 w-7 text-gray-700 group-hover:text-yellow-500 transition" />

              {unreadSupervisor > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full 
                  flex items-center justify-center animate-bounce"
                >
                  {unreadSupervisor}
                </span>
              )}
            </div>

            {showNotifMenu && (
              <div className="absolute right-0 top-10 w-72 bg-white shadow-lg rounded-xl z-50 border">
                <div className="px-4 py-2 border-b font-semibold text-gray-700">
                  Notifications
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm p-4 text-center">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n, idx) => (
                      <div
                        key={n.id || idx}
                        onClick={() => {
                          setShowNotifMenu(false);

                          if (
                            n.type === "message" ||
                            n.type === "chat.message"
                          ) {
                            setActive("Messages");
                            if (n.studentId) {
                              localStorage.setItem(
                                "open_student_id",
                                n.studentId
                              );
                            }
                          } else if (n.type === "submission") {
                            setActive("Submissions");
                            if (n.studentId) {
                              localStorage.setItem(
                                "open_submission_student",
                                n.studentId
                              );
                            }
                            if (n.taskId) {
                              localStorage.setItem(
                                "open_submission_task",
                                n.taskId
                              );
                            }
                          }
                        }}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-yellow-50 cursor-pointer border-b"
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          🔔
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {n.type === "chat.message"
                              ? "New message"
                              : "Notification"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {new Date(n.time).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition">
              <img
                src={user?.profile_image || "/user-avatar.jpg"}
                className="w-10 h-10 rounded-full border-2 border-yellow-500 shadow"
                alt="profile"
              />
              <span className="font-semibold text-gray-700">
                {user?.full_name || user?.name || "Supervisor"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-10">
          {active === "Home" && <HomeContent supervisorId={20} />}
          {active === "Profile" && <SupervisorProfile />}
          {active === "My Students" && <MyStudent />}
          {active === "Submissions" && <SupervisorSubmissions />}
          {active === "Tasks" && <SupervisorTasks supervisorId={user.id} />}
          {active === "Messages" && (
            <SupervisorMessages supervisorId={user.id} />
          )}
          {active === "Sessions" && <SupervisorSessions />}
          {active === "Evaluate Students" && (
            <EvaluateStudents supervisorId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}
