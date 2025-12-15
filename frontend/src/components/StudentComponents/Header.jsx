import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getSocket } from "../../socket";
import axios from "axios";

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon } from "@heroicons/react/24/solid";
import {
  Bell,
  MessageSquare,
  ChevronDown,
  User,
  Calendar,
  FileText,
  Globe,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import {
  requestStudentFCMToken,
  listenStudentForegroundMessages,
} from "../../firebase";

const ROOT = process.env.REACT_APP_API_BASE || "http://localhost:5000";

function ChallengeCalendarModal({ isOpen, onClose }) {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    if (isOpen) fetchChallenges();
  }, [isOpen]);

  const fetchChallenges = async () => {
    try {
      const res = await axios.get(`${ROOT}/api/challenges`);
      setChallenges(res.data || []);
    } catch (err) {
      console.error("Error fetching challenges:", err);
    }
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const challengesForDay = challenges.filter((c) => {
      const d = new Date(c.deadline);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

    if (challengesForDay.length === 0) return null;

    const titles = challengesForDay.map((c) => c.title).join(", ");
    const isPast = new Date(challengesForDay[0].deadline) < new Date();

    return (
      <div
        data-tooltip-id="challenge-tip"
        data-tooltip-content={titles}
        className="flex justify-center mt-1"
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isPast ? "bg-red-500" : "bg-yellow-400"
          }`}
        ></span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-yellow-50 rounded-2xl shadow-2xl p-6 w-[460px] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-red-500 hover:text-red-700 text-lg font-bold"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-yellow-700 mb-4 text-center flex items-center justify-center space-x-2">
          <span role="img" aria-label="calendar">
            📅
          </span>
          <span>Challenge Deadlines</span>
        </h2>

        <ReactCalendar
          tileContent={tileContent}
          className="rounded-xl shadow-inner bg-yellow-100 border border-yellow-200"
        />

        <Tooltip
          id="challenge-tip"
          place="top"
          style={{
            backgroundColor: "#facc15",
            color: "#000",
            fontWeight: "600",
            borderRadius: "8px",
            fontSize: "0.85rem",
          }}
        />
      </div>
    </div>
  );
}

function safeParseData(x) {
  if (!x) return null;
  if (typeof x === "object") return x;
  try {
    return JSON.parse(x);
  } catch {
    return null;
  }
}

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    return u?.id ? String(u.id) : null;
  } catch {
    return null;
  }
}

export default function Header({ onProfileClick, profileImage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [recentMessages, setRecentMessages] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [notiOpen, setNotiOpen] = useState(false);
  const notiRef = useRef(null);

  const [taskNotifications, setTaskNotifications] = useState([]);
  const [unreadTasks, setUnreadTasks] = useState(0);

  const notificationUnreadCount = notifications.filter(
    (n) => Number(n.is_read) === 0
  ).length;
  const totalBellCount = notificationUnreadCount + unreadTasks;

  const [notifTab, setNotifTab] = useState("system");

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );
  const [showLangMenu, setShowLangMenu] = useState(false);

  const userId = getCurrentUserId();
  const bellKey = userId
    ? `student_bell_notifications_${userId}`
    : "student_bell_notifications_guest";

  const myId = userId ? Number(userId) : null;

  function authHeaders(extra = {}) {
    const t = localStorage.getItem("token");
    return {
      ...extra,
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    };
  }

  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "");

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);

    if (lang === "ar") {
      try {
        const elements = document.querySelectorAll(
          "h1, h2, h3, p, span, button, label, a, li, th, td"
        );
        const texts = Array.from(elements)
          .map((el) => el.innerText.trim())
          .filter(Boolean);

        if (texts.length === 0) return;

        const batchSize = 20;
        for (let i = 0; i < texts.length; i += batchSize) {
          const batch = texts.slice(i, i + batchSize);
          const response = await fetch(
            "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=" +
              encodeURIComponent(batch.join("|||"))
          );
          const data = await response.json();
          const translated = data[0]
            .map((item) => item[0])
            .join("")
            .split("|||");

          batch.forEach((_, j) => {
            const el = elements[i + j];
            if (el && translated[j]) {
              el.style.direction = "rtl";
              el.innerText = translated[j];
              el.style.textAlign = "start";
            }
          });
        }

        document.body.dir = "ltr";
        document.body.style.fontFamily = "'Tajawal', sans-serif";
      } catch (error) {
        console.error("Translation failed:", error);
      }
    } else {
      window.location.reload();
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(bellKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved)) setNotifications(saved);
    } catch {}
  }, [bellKey]);

  useEffect(() => {
    try {
      localStorage.setItem(bellKey, JSON.stringify(notifications.slice(0, 20)));
    } catch {}
  }, [notifications, bellKey]);

  async function loadNotifications() {
    try {
      const res = await fetch(`${ROOT}/api/notifications?limit=10`, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("loadNotifications failed:", res.status, text);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) return;

      const seen = new Set();
      const unique = [];
      for (const n of data) {
        const k = String(n.id);
        if (seen.has(k)) continue;
        seen.add(k);
        unique.push(n);
      }

      setNotifications((old) => {
        const map = new Map();
        [...old, ...unique].forEach((n) => map.set(String(n.id), n));

        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );

        return merged.slice(0, 10);
      });
    } catch (e) {
      console.error("loadNotifications error:", e);
    }
  }

  async function markAllRead() {
    try {
      const unread = notifications.filter((n) => Number(n.is_read) === 0);

      await Promise.all(
        unread.map((n) =>
          fetch(`${ROOT}/api/notifications/${n.id}/read`, {
            method: "POST",
            headers: authHeaders(),
          })
        )
      );

      setNotifications((old) => old.map((n) => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error("markAllRead error:", e);
    }
  }

  async function markOneRead(id) {
    try {
      await fetch(`${ROOT}/api/notifications/${id}/read`, {
        method: "POST",
        headers: authHeaders(),
      }).catch(() => {});
      setNotifications((old) =>
        old.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch {}
  }

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onSubmission = (payload) => {
      setUnreadTasks((prev) => prev + 1);
      setTaskNotifications((prev) => [
        {
          type: "self_submission",
          taskId: payload?.taskId,
          message: payload?.message || "Submission received",
          time: new Date(),
        },
        ...prev,
      ]);
    };

    const onAssigned = (payload) => {
      setUnreadTasks((prev) => prev + 1);
      setTaskNotifications((prev) => [
        {
          type: "task_assigned",
          taskId: payload?.taskId,
          message: payload?.message || "New task assigned",
          time: new Date(),
        },
        ...prev,
      ]);
    };

    socket.on("submission_success", onSubmission);
    socket.on("task_assigned", onAssigned);

    return () => {
      socket.off("submission_success", onSubmission);
      socket.off("task_assigned", onAssigned);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onAnyChatMessage = (payload) => {
      const senderIdRaw =
        payload?.sender_id ?? payload?.from ?? payload?.fromId ?? payload?.userId;

      const receiverIdRaw = payload?.receiver_id ?? payload?.to ?? payload?.toId;

      const senderId = senderIdRaw != null ? Number(senderIdRaw) : null;
      const receiverId = receiverIdRaw != null ? Number(receiverIdRaw) : null;

      const text =
        payload?.body ??
        payload?.content ??
        payload?.message ??
        payload?.text ??
        "";

      if (!senderId) return;

      if (myId && senderId === myId) return;

      if (myId && receiverId && receiverId !== myId) return;

      const now = new Date().toISOString();

      const stableId = payload?.id
        ? `chat-${payload.id}`
        : `chat-${senderId}-${payload?.created_at || payload?.sent_at || now}-${Math.random()}`;

      setNotifications((old) => {
        const newNotif = {
          id: stableId,
          type: "chat",
          message: text || "New message",
          is_read: 0,
          created_at: payload?.created_at || payload?.sent_at || now,
          data: JSON.stringify({ partnerId: senderId }),
        };

        if (old.some((n) => String(n.id) === String(newNotif.id))) return old;
        return [newNotif, ...old].slice(0, 10);
      });

      setRecentMessages((prev) => {
        const exists = prev.find((p) => String(p.id) === String(senderId));
        if (exists) {
          return prev.map((p) =>
            String(p.id) === String(senderId)
              ? { ...p, lastMessage: text, unread: p.unread ?? 0 }
              : p
          );
        }

        return [
          { id: senderId, name: "User", lastMessage: text, unread: 0 },
          ...prev,
        ];
      });
    };

    socket.on("chat:newMessage", onAnyChatMessage);
    socket.on("new_unread_message", onAnyChatMessage);
    socket.on("message:new", onAnyChatMessage);

    return () => {
      socket.off("chat:newMessage", onAnyChatMessage);
      socket.off("new_unread_message", onAnyChatMessage);
      socket.off("message:new", onAnyChatMessage);
    };
  }, [myId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewNotification = (notif) => {
      setNotifications((old) => {
        if (!notif) return old;
        if (old.some((n) => String(n.id) === String(notif.id))) return old;
        return [notif, ...old].slice(0, 10);
      });
    };

    socket.on("notifications:new", onNewNotification);
    return () => socket.off("notifications:new", onNewNotification);
  }, []);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch(`${ROOT}/api/chat/header-messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        let data = await res.json();
        data = Array.isArray(data) ? data : [];

        const enriched = await Promise.all(
          data.map(async (p) => {
            try {
              const lastRes = await fetch(`${ROOT}/api/chat/thread/${p.id}`, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              });

              if (lastRes.ok) {
                const msgs = await lastRes.json();
                return {
                  ...p,
                  lastMessage:
                    msgs.length > 0 ? msgs[msgs.length - 1].body : null,
                  unread: p.unread ?? 0,
                };
              }
            } catch {}
            return p;
          })
        );

        setRecentMessages(enriched);
      } catch (err) {
        console.error("Error loading partners:", err);
      }
    }

    fetchRecent();
  }, []);

  useEffect(() => {
    listenStudentForegroundMessages();

    async function saveToken() {
      const token = await requestStudentFCMToken();
      if (!token) return;

      try {
        const res = await fetch(`${ROOT}/api/student/notifications/fcm-token`, {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ fcm_token: token }),
        });
        await res.json().catch(() => {});
      } catch (err) {
        console.error("saveStudentFcm error:", err);
      }
    }

    saveToken();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowLangMenu(false);
      }
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setNotiOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickNotification = async (n) => {
    setNotiOpen(false);

    if (Number(n.is_read) === 0) {
      await markOneRead(n.id);
    }

    if (n.type === "chat") {
      const data = safeParseData(n.data);
      const partnerId =
        data?.partnerId || data?.partner_id || data?.fromId || null;

      if (partnerId) navigate(`/chat?partner=${partnerId}`);
      else navigate("/chat");
      return;
    }

    if (n.type === "task") {
      navigate("/my-tasks");
      return;
    }
  };

  return (
    <header
      className={`w-full shadow-md flex justify-between items-center px-8 py-3 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-200 text-gray-900"
      }`}
    >
      {isCalendarOpen && (
        <ChallengeCalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}

      <div className="flex items-center space-x-8">
        <h1
          className="text-2xl font-bold tracking-tight cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <span className="text-black">HT</span>
          <span className="text-yellow-500">ML</span>
        </h1>

        <nav className="flex space-x-6 font-medium">
          {[
            "Home",
            "Lessons",
            "Project Hub",
            "Challenges Arena",
            "Code Editor",
            "Chat",
            "My Tasks",
            "Sessions",
            "Evaluate Supervisor",
            "Contact",
          ].map((item) => (
            <span
              key={item}
              className="hover:text-yellow-500 transition-colors duration-200 cursor-pointer"
              onClick={() => {
                if (item === "Home") navigate("/dashboard");
                else if (item === "Lessons") navigate("/lessons");
                else if (item === "Code Editor") navigate("/editor");
                else if (item === "Project Hub") navigate("/project-hub");
                else if (item === "Challenges Arena") navigate("/challenges");
                else if (item === "Chat") navigate("/chat");
                else if (item === "My Tasks") navigate("/my-tasks");
                else if (item === "Sessions") navigate("/student/sessions");
                else if (item === "Evaluate Supervisor")
                  navigate("/student/evaluate-supervisor");
                else navigate(`/${item.toLowerCase().replace(/ /g, "-")}`);
              }}
            >
              {item}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-6 relative">
        <div ref={notiRef} className="relative">
          <button
            className="relative"
            type="button"
            onClick={() => {
              setNotiOpen((v) => {
                const next = !v;
                if (next) loadNotifications();
                return next;
              });
            }}
          >
            <Bell className="w-6 h-6 hover:text-yellow-500 transition" />
            {totalBellCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-xs w-4 h-4 flex items-center justify-center rounded-full text-black font-bold">
                {totalBellCount}
              </span>
            )}
          </button>

          {notiOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-xl shadow-lg overflow-hidden border z-30 bg-white border-yellow-200">
              <div className="flex items-center justify-between px-3 py-2 border-b border-yellow-100">
                <div className="flex gap-2">
                  <button
                    className={`text-xs px-3 py-1 rounded-full border ${
                      notifTab === "system"
                        ? "bg-yellow-100 border-yellow-300 font-semibold"
                        : "bg-white border-gray-200"
                    }`}
                    onClick={() => setNotifTab("system")}
                  >
                    System ({notificationUnreadCount})
                  </button>
                  <button
                    className={`text-xs px-3 py-1 rounded-full border ${
                      notifTab === "tasks"
                        ? "bg-yellow-100 border-yellow-300 font-semibold"
                        : "bg-white border-gray-200"
                    }`}
                    onClick={() => setNotifTab("tasks")}
                  >
                    Tasks ({unreadTasks})
                  </button>
                </div>

                {notifTab === "system" && (
                  <button
                    className="text-xs text-pink-700 hover:underline"
                    onClick={markAllRead}
                  >
                    Mark all read
                  </button>
                )}

                {notifTab === "tasks" && (
                  <button
                    className="text-xs text-pink-700 hover:underline"
                    onClick={() => setUnreadTasks(0)}
                  >
                    Clear badge
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifTab === "system" && (
                  <>
                    {notifications.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-gray-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleClickNotification(n)}
                          className={`px-3 py-2 text-sm border-b last:border-b-0 hover:bg-yellow-50 cursor-pointer ${
                            Number(n.is_read) === 0 ? "bg-yellow-50" : "bg-white"
                          }`}
                        >
                          <div className="text-gray-800">{n.message}</div>
                          <div className="text-xs text-gray-400">
                            {fmtDate(n.created_at)}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {notifTab === "tasks" && (
                  <>
                    {taskNotifications.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-gray-500">
                        No task notifications.
                      </div>
                    ) : (
                      taskNotifications.map((t, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 text-sm border-b last:border-b-0 hover:bg-yellow-50 cursor-pointer"
                          onClick={() => {
                            setNotiOpen(false);
                            setUnreadTasks(0);
                            navigate("/my-tasks");
                          }}
                        >
                          <div className="text-gray-800 font-semibold">
                            {t.message}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(t.time).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          className="relative"
          onClick={() => {
            const raw = localStorage.getItem("user");
            const user = raw ? JSON.parse(raw) : null;
            if (!user || !user.id) return;

            setUnreadCount(0);
            setShowMessagesDropdown(!showMessagesDropdown);
          }}
        >
          <MessageSquare className="w-6 h-6 hover:text-yellow-500 transition" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-xs w-4 h-4 flex items-center justify-center rounded-full text-black font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-black flex items-center justify-center">
              {profileImage ? (
                <img
                  src={
                    profileImage.startsWith("http") ||
                    profileImage.startsWith("/")
                      ? profileImage
                      : `${process.env.REACT_APP_API_BASE}${profileImage}`
                  }
                  alt="/user-avatar.jpg"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-6 h-6 text-black" />
              )}
            </div>

            <ChevronDown className="w-5 h-5 text-yellow-500" />
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className={`absolute right-0 mt-3 w-56 rounded-xl shadow-lg overflow-visible border z-40 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-yellow-50 border-yellow-100"
              }`}
            >
              <ul className="flex flex-col text-sm">
                <li
                  className="flex items-center px-4 py-2 hover:bg-yellow-200 cursor-pointer"
                  onClick={() => onProfileClick()}
                >
                  <User className="w-4 h-4 mr-2" /> Profile
                </li>

                <li
                  className="flex items-center px-4 py-2 hover:bg-yellow-200 cursor-pointer"
                  onClick={() => setIsCalendarOpen(true)}
                >
                  <Calendar className="w-4 h-4 mr-2" /> Calendar
                </li>

                <li
                  className="flex items-center px-4 py-2 hover:bg-yellow-200 cursor-pointer"
                  onClick={() => navigate("/certificate/html")}
                >
                  <FileText className="w-4 h-4 mr-2" /> HTML Certificate
                </li>

                <li
                  className="flex items-center px-4 py-2 hover:bg-yellow-200 cursor-pointer"
                  onClick={() => navigate("/certificate/css")}
                >
                  <FileText className="w-4 h-4 mr-2" /> CSS Certificate
                </li>

                <li className="relative">
                  <div
                    className="flex items-center px-4 py-2 hover:bg-yellow-200 cursor-pointer"
                    onClick={() => setShowLangMenu(!showLangMenu)}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Language
                  </div>

                  {showLangMenu && (
                    <ul className="absolute top-0 right-full mr-2 bg-yellow-50 border border-yellow-100 rounded-xl shadow-lg z-50 w-40">
                      <li
                        onClick={() => {
                          handleLanguageChange("en");
                          setShowLangMenu(false);
                        }}
                        className="px-4 py-2 hover:bg-yellow-200 cursor-pointer flex items-center space-x-2"
                      >
                        <span>🇺🇸</span>
                        <span>English</span>
                      </li>
                      <li
                        onClick={() => {
                          handleLanguageChange("ar");
                          setShowLangMenu(false);
                        }}
                        className="px-4 py-2 hover:bg-yellow-200 cursor-not-allowed flex items-center space-x-2"
                      >
                        <span>🇸🇦</span>
                        <span>العربية</span>
                      </li>
                    </ul>
                  )}
                </li>

                <li
                  className="flex items-center px-4 py-2 hover:bg-yellow-200 cursor-pointer"
                  onClick={() => setIsDarkMode((v) => !v)}
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Moon className="w-4 h-4 mr-2" />
                  )}
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </li>

                <li
                  className="flex items-center px-4 py-2 hover:bg-yellow-200 cursor-pointer text-red-600 border-t"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
