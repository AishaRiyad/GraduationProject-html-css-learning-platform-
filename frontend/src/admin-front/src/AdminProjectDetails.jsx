// frontend/src/admin-front/src/AdminProjectDetails.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectDetails from "../../pages/StudentPages/ProjectDetails.jsx";

/**
 * AdminProjectDetails:
 * Simple wrapper to show the existing user ProjectDetails
 * inside the admin layout (so admin stays in the console).
 */
export default function AdminProjectDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-pink-700 mb-2">
        Project Details 
      </h1>

      <div className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow">
        {/* 
          Reuse the existing student ProjectDetails component.
          It already knows how to fetch and display the project by id.
        */}
        <ProjectDetails adminMode={true} />
      </div>
    </div>
  );
}
