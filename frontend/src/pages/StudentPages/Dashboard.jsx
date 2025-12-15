import React, { useEffect, useState } from "react";
import axios from "axios";

// ICONS
import {
  FiArrowRightCircle,
  FiBookOpen,
  FiCheckCircle,
  FiFolder,
  FiActivity,
  FiBell,
  FiMessageSquare,
} from "react-icons/fi";

// Navigation
import { useNavigate } from "react-router-dom";

// CHART (DOUGHNUT)
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StudentDashboard({ currentUser }) {
  const API = "http://localhost:5000";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API}/api/student/dashboard/${currentUser.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setDashboard(res.data);
      } catch (err) {
        console.log("Dashboard Fetch Error:", err);
      }

      setLoading(false);
    }

    fetchDashboard();
  }, [currentUser]);

  if (loading || !dashboard) {
    return (
      <div className="w-full py-40 text-center text-xl font-semibold text-gray-700">
        Loading Dashboard...
      </div>
    );
  }

  const { profile, progress, tasks, challenges, projects_count } = dashboard;

  // ================== DOUGHNUT CHART ==================
  const doughnutData = {
    labels: ["Progress", "Remaining"],
    datasets: [
      {
        data: [
          progress.progress_percentage,
          100 - progress.progress_percentage,
        ],
        backgroundColor: ["#FACC15", "#FDE68A"], // yellow tones
        borderWidth: 1,
      },
    ],
  };

  const QuickCard = ({ icon: Icon, title, link }) => (
    <div
      onClick={() => navigate(link)}
      className="flex items-center gap-4 px-5 py-4 bg-white/80 backdrop-blur-sm cursor-pointer 
                 border rounded-2xl shadow hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div className="p-3 bg-yellow-100 text-yellow-700 rounded-xl shadow-inner">
        <Icon size={24} />
      </div>
      <p className="text-lg font-semibold text-gray-700">{title}</p>
    </div>
  );

  return (
    <div className="px-6 py-10 bg-gradient-to-b from-yellow-50 via-yellow-100 to-yellow-200 min-h-screen">

      {/* ================= HERO ================= */}
      <div className="bg-white/70 backdrop-blur-sm border rounded-2xl shadow-lg p-8 mb-12 flex flex-col lg:flex-row justify-between items-center">

        {/* LEFT SIDE: Name + Progress Bar */}
        <div className="flex items-center gap-8">

          

          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-1">
              Welcome back  {profile?.full_name}
            </h1>

            <p className="text-gray-700 text-lg">
              Completed Lessons:{" "}
              <b>{progress.completed_lessons}</b> / {progress.total_lessons}
            </p>

            <div className="mt-4 w-72 h-3 bg-gray-300 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all duration-700"
                style={{ width: `${progress.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: DOUGHNUT */}
        <div className="w-36 mt-6 lg:mt-0">
          <Doughnut data={doughnutData} />

          <p className="text-center text-xl font-bold text-yellow-700 mt-2">
            {progress.progress_percentage}%
          </p>
        </div>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-14">
        <QuickCard icon={FiBookOpen} title="Lessons" link="/learning" />
        <QuickCard icon={FiCheckCircle} title="Tasks" link="/my-tasks" />
        <QuickCard icon={FiActivity} title="Challenges" link="/challenges" />
        <QuickCard icon={FiFolder} title="Project Hub" link="/project-hub" />
        <QuickCard icon={FiBell} title="Notifications" link="/notifications" />
        <QuickCard icon={FiMessageSquare} title="Messages" link="/contact" />
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* Continue Learning */}
        <div className="bg-white/80 backdrop-blur-md p-7 rounded-2xl shadow-md border hover:shadow-xl transition-all">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Continue Learning</h3>

          <p className="text-gray-700 text-lg">
            Current Lesson: <b>{progress.current_lesson}</b>
          </p>

          <button
            onClick={() => navigate(`/lesson-viewer/${progress.current_lesson}`)}
            className="mt-6 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 transition rounded-lg font-semibold flex items-center gap-2 shadow"
          >
            Resume <FiArrowRightCircle />
          </button>
        </div>

        {/* Tasks */}
        <div className="bg-white/80 backdrop-blur-md p-7 rounded-2xl shadow-md border hover:shadow-xl transition-all">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Tasks Overview</h3>

          <p>Assigned: <b>{tasks.assigned}</b></p>
          <p>Submitted: <b>{tasks.submitted}</b></p>
          <p>Graded: <b>{tasks.graded}</b></p>

          {tasks.upcoming_task && (
            <div className="mt-5 p-4 bg-yellow-50 rounded-xl shadow-inner border border-yellow-200">
              <p className="font-semibold text-gray-900">Upcoming Task:</p>
              <p className="text-gray-700">{tasks.upcoming_task.title}</p>
              <p className="text-sm text-gray-600">
                Due: {tasks.upcoming_task.due_date}
              </p>

              <button
                onClick={() => navigate("/my-tasks")}
                className="mt-3 text-yellow-700 underline hover:opacity-75"
              >
                Continue Task →
              </button>
            </div>
          )}
        </div>

        {/* Challenges */}
        <div className="bg-white/80 backdrop-blur-md p-7 rounded-2xl shadow-md border hover:shadow-xl transition-all">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Challenges Arena</h3>

          <p>Total Attempts: <b>{challenges.attempts}</b></p>
          <p>Latest Score: <b>{challenges.last_score ?? "—"}</b></p>
          <p className="text-gray-600 mt-3 italic">{challenges.latest_feedback}</p>

          <button
            onClick={() => navigate("/challenges")}
            className="mt-6 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 transition rounded-lg font-semibold flex items-center gap-2 shadow"
          >
            Go to Arena <FiArrowRightCircle />
          </button>
        </div>

        {/* Projects */}
        <div className="bg-white/80 backdrop-blur-md p-7 rounded-2xl shadow-md border hover:shadow-xl transition-all">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Project Hub</h3>

          <p>You have <b>{projects_count}</b> projects available.</p>

          <button
            onClick={() => navigate("/project-hub")}
            className="mt-6 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 transition rounded-lg font-semibold flex items-center gap-2 shadow"
          >
            View Projects <FiArrowRightCircle />
          </button>
        </div>

      </div>
    </div>
  );
}
