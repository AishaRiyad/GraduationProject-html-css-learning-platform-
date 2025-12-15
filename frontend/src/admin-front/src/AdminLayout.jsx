// frontend/src/admin-front/src/AdminLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import useAdminFCM from "./useAdminFCM";
import AdminHeader from "./AdminHeader.jsx";

/*
  ================================================================
    CLEAN & SIMPLE ADMIN LAYOUT
    - Removes sidebar completely
    - AdminHeader now contains all navigation (responsive)
    - Outlet is full width below the header
  ================================================================
*/

export default function AdminLayout() {
  useAdminFCM();
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-yellow-50">

      {/* Top Navigation (Logo + Links + Hamburger) */}
      <AdminHeader />

      {/*  Page Content (full width, responsive) */}
      <main className="max-w-7xl mx-auto p-4">
        <Outlet />
      </main>

    </div>
  );
}
