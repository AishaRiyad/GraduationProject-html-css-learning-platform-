import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  let role = null;
  try {
    if (token) role = JSON.parse(atob(token.split(".")[1])).role;
  } catch {}
  if (role !== "admin") return <Navigate to="/login" replace />;
  return children;
}
