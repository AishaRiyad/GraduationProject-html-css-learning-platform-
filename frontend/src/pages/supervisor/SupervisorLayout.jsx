import React from "react";
import { Outlet } from "react-router-dom";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";


export default function SupervisorLayout() {
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  return (
    <>
      <SupervisorHeader user={user} />
      <Outlet />
    </>
  );
}
