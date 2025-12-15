import React from "react";
import SupervisorSidebar from "../components/supervisor/SupervisorSidebar";
import SupervisorHeader from "../components/supervisor/SupervisorHeader";
import { Outlet } from "react-router-dom";

export default function SupervisorLayout() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="flex">
      {/* Sidebar */}
      <SupervisorSidebar />

      {/* Content */}
      <div className="flex-1 h-screen overflow-y-auto bg-gray-50">
        <SupervisorHeader user={user} />
        
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
