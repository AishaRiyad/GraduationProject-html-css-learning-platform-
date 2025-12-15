import React from "react";
import { NavLink } from "react-router-dom";
import {
  UserCircleIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
   ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function SupervisorSidebar() {
  const links = [
    { name: "Profile", to: "/supervisor/profile", icon: <UserCircleIcon className="h-6 w-6" /> },
    { name: "My Students", to: "/supervisor/students", icon: <UsersIcon className="h-6 w-6" /> },
    { name: "Submissions", to: "/supervisor/submissions", icon: <ClipboardDocumentListIcon className="h-6 w-6" /> },
    { name: "Tasks", to: "/supervisor/tasks", icon: < ClipboardDocumentCheckIcon className="h-6 w-6" /> },
   
    { name: "Messages", to: "/supervisor/communication", icon: <ChatBubbleLeftRightIcon className="h-6 w-6" /> },
    
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-yellow-400 to-yellow-500 shadow-xl text-black flex flex-col justify-between py-6">

      {/* TOP - MENU */}
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold px-6 mb-4">Supervisor</h2>

        {links.map((link, i) => (
          <NavLink
            key={i}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-md font-medium 
              ${isActive ? "bg-white text-yellow-600 shadow-md rounded-l-full" : "text-black/90 hover:bg-yellow-300"}`
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </div>

      {/* BOTTOM - LOGOUT */}
      <div className="px-6">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 w-full px-5 py-3 text-black bg-white rounded-xl shadow hover:bg-yellow-100 transition"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6" />
          Logout
        </button>
      </div>
    </div>
  );
}
