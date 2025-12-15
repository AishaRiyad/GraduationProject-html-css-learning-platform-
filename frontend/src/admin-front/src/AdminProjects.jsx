import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listProjects, deleteProject } from "./AdminApi";

export default function AdminProjects() {
  const [projectsByUser, setProjectsByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const nav = useNavigate();

  // Helper to format dates safely
  const fmt = (d) =>
    d ? String(d).replace("T", " ").slice(0, 19) : "";

  // Load projects from API and group them by user
  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const rows = await listProjects(); // no filters for now
      // Group projects by user_id
      const grouped = rows.reduce((acc, p) => {
        const uid = p.user_id || "unknown";
        if (!acc[uid]) {
          acc[uid] = {
            userId: p.user_id,
            userName: p.user_name || "(Unknown user)",
            userEmail: p.user_email || "",
            projects: [],
          };
        }
        acc[uid].projects.push(p);
        return acc;
      }, {});
      setProjectsByUser(grouped);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  // Handle project deletion
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      // Re-load list after deletion
      await loadProjects();
    } catch (e) {
      alert(e.message || "Failed to delete project.");
    }
  }

   // Navigate to project view INSIDE the admin panel
  function handleView(id) {
    nav(`/admin/projects/${id}`);
  }


  const userGroups = Object.values(projectsByUser);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-pink-700">
        Projects by Students
      </h1>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {loading && (
        <div className="p-3 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200">
          Loading projects...
        </div>
      )}

      {!loading && userGroups.length === 0 && (
        <div className="p-3 rounded-xl bg-white border border-yellow-200 text-slate-600">
          No projects found.
        </div>
      )}

      {/* Loop over each student and show their projects */}
      <div className="space-y-4">
        {userGroups.map((group) => (
          <div
            key={group.userId || group.userName}
            className="rounded-2xl border-2 border-yellow-300 bg-white p-4 shadow"
          >
            {/* Student header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 mb-3">
              <div>
                <div className="font-bold text-pink-800 text-lg">
                  {group.userName}
                </div>
                {group.userEmail && (
                  <div className="text-xs text-slate-500">
                    {group.userEmail}
                  </div>
                )}
              </div>
              <div className="text-xs text-slate-500">
                Total projects: {group.projects.length}
              </div>
            </div>

            {/* Projects list for this student */}
            <div className="space-y-2">
              {group.projects.map((p) => (
                <div
                  key={p.id}
                  className="border border-yellow-200 rounded-xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold">
                      {p.title || "(No title)"}
                    </div>
                    <div className="text-xs text-slate-500">
                      Created: {fmt(p.created_at)}
                    </div>
                    <div className="text-xs text-slate-400">
                      Likes: {p.likes_count ?? 0} · Comments:{" "}
                      {p.comments_count ?? 0}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(p.id)}
                      className="px-3 py-1 rounded-lg text-sm bg-yellow-200 hover:bg-yellow-300 text-pink-800 font-semibold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 rounded-lg text-sm bg-red-100 hover:bg-red-200 text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
