import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function TasksTab({ userId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    axios
      .get(`${API}/api/tasks/student/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTasks(res.data || []);
      })
      .catch((err) => {
        console.error("Error loading tasks:", err);
        setTasks([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p className="text-center mt-4">Loading tasks...</p>;

  if (tasks.length === 0)
    return <p className="text-gray-600 text-center mt-4">No tasks assigned yet.</p>;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year} — ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-yellow-600">Your Tasks 📝</h2>

      {tasks.map((task) => (
        <div
          key={task.assignment_id || task.task_id} //  FIX
          className="p-5 rounded-xl border border-yellow-300 bg-yellow-50 shadow-sm hover:shadow-md transition-all duration-300"
        >
          {/* ===== Top Row ===== */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Task #{task.task_id}
            </h3>

            <span
              className={`px-3 py-1 rounded-full text-sm font-medium 
                ${
                  task.status === "assigned"
                    ? "bg-blue-100 text-blue-700"
                    : task.status === "submitted"
                    ? "bg-yellow-100 text-yellow-700"
                    : task.status === "graded"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }
              `}
            >
              {String(task.status || "").toUpperCase()}
            </span>
          </div>

          {/* ===== Date Info ===== */}
          <div className="mt-3 text-sm text-gray-700 space-y-1">
            <p>
              <strong>Assigned on:</strong>{" "}
              {formatDate(task.assigned_at || task.task_created)} {/*  FIX */}
            </p>

            <p>
              <strong>Submitted at:</strong>{" "}
              {task.submitted_at ? formatDate(task.submitted_at) : "Not submitted yet"}
            </p>
          </div>

          {/* ===== Grade ===== */}
          <div className="mt-3 text-sm">
            <p>
              <strong>Grade:</strong>{" "}
              {task.assignment_grade ? (
                <span className="text-green-700 font-semibold">{task.assignment_grade}</span>
              ) : (
                <span className="text-gray-500">No grade yet</span>
              )}
            </p>
          </div>

          {/* ===== Feedback ===== */}
          <div className="mt-1 text-sm">
            <p>
              <strong>Feedback:</strong>{" "}
              {task.assignment_feedback ? (
                task.assignment_feedback
              ) : (
                <span className="text-gray-500">No feedback yet</span>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
