import React from "react";
import { useNavigate } from "react-router-dom";
import ProjectForm from "../../components/StudentComponents/ProjectForm";

export default function AddProject() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
      <ProjectForm onSubmitSuccess={() => navigate("/project-hub")} />
    </div>
  );
}
