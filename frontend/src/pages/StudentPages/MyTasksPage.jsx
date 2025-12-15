import axios from "axios";
import React, { useEffect, useState } from "react";

const API = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const [tempFile, setTempFile] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem("token");

     
      const res = await axios.get(`${API}/api/tasks/student/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(res.data || []);

      
      const subsRes = await axios.get(
        `${API}/api/tasks/submissions/student/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

     
      const subMap = {};
      (subsRes.data || []).forEach((s) => (subMap[s.task_id] = s));
      setSubmissions(subMap);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-GB") + " — " + dt.toLocaleTimeString();
  };

  const handleUpload = async (taskId, file) => {
    const form = new FormData();
    form.append("file", file);
    form.append("task_id", taskId);
    form.append("student_id", userId);

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${API}/api/tasks/submissions/upload`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Submission uploaded successfully!");
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API}/api/tasks/submissions/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Submission deleted successfully!");
      loadTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to delete submission");
    }
  };

  if (loading) return <p className="mt-10 text-center">Loading tasks...</p>;

  if (!userId) return <p className="mt-10 text-center">Please login again.</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-yellow-600 mb-8 flex items-center space-x-2">
        <span>Your Tasks</span> <span>📄</span>
      </h1>

      <div className="space-y-5">
        {tasks.map((task) => {
          const submission = submissions[task.task_id];

          return (
            <div
              key={task.assignment_id || task.task_id} //  FIX: key stable
              className="p-6 bg-yellow-50 border border-yellow-300 rounded-xl shadow-sm"
            >
              {/* عنوان التاسك */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{task.title}</h2>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium 
                    ${submission ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}
                  `}
                >
                  {submission ? "SUBMITTED" : "PENDING"}
                </span>
              </div>

              
              <p className="text-gray-700 mt-3">{task.description}</p>

              <div className="text-sm mt-4 space-y-1">
                <p>
                  <strong>Assigned on:</strong>{" "}
                  {formatDate(task.assigned_at || task.task_created)} {/*  FIX */}
                </p>
                <p>
                  <strong>Deadline:</strong> {formatDate(task.due_date)}
                </p>
              </div>

           
              {submission ? (
                <div className="mt-4 text-sm space-y-2 border-t pt-3">
                  <p>
                    <strong>Submitted at:</strong> {formatDate(submission.submitted_at)}
                  </p>

                  <p>
                    <strong>File:</strong>{" "}
                    <a
                      href={`${API}${submission.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View file
                    </a>
                  </p>

                  <p>
                    <strong>Grade:</strong>{" "}
                    {submission.grade || <span className="text-gray-500">No grade yet</span>}
                  </p>

                  <p>
                    <strong>Feedback:</strong>{" "}
                    {submission.feedback || <span className="text-gray-500">No feedback yet</span>}
                  </p>

                  {/* Buttons: Replace + Delete */}
                  <div className="flex space-x-3 mt-3">
                    <label className="cursor-pointer px-3 py-2 bg-blue-100 border rounded-lg hover:bg-blue-200">
                      Replace File
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUpload(task.task_id, e.target.files?.[0])}
                      />
                    </label>

                    <button
                      onClick={() => handleDeleteSubmission(submission.id)}
                      className="px-3 py-2 bg-red-100 border rounded-lg hover:bg-red-200 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="text-sm font-medium">Upload submission:</label>

                  <div className="mt-4">
                    <input
                      type="file"
                      className="block border p-2 rounded mt-2"
                      onChange={(e) =>
                        setTempFile({ taskId: task.task_id, file: e.target.files?.[0] })
                      }
                    />

                    {tempFile?.taskId === task.task_id && (
                      <button
                        onClick={() => handleUpload(task.task_id, tempFile.file)}
                        className="mt-3 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
                      >
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
