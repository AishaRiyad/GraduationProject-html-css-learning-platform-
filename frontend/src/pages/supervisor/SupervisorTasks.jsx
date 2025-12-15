import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const API = "http://localhost:5000";

/* ===================== Preview Modal ===================== */
function PreviewModal({ files, onClose }) {
  const [activeFile, setActiveFile] = useState(files.find((f) => !f.folder));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] w-[95%] h-[90%] rounded-xl shadow-xl flex">

        {/* LEFT SIDEBAR */}
        <div className="w-64 bg-[#252526] text-gray-300 border-r border-gray-700 p-3 overflow-auto">
          <h2 className="font-bold mb-4 text-lg">📁 ZIP Content</h2>

          {files.map((f, index) => (
            <div
              key={index}
              className={`cursor-pointer px-3 py-2 rounded ${
                activeFile?.name === f.name ? "bg-[#37373d]" : "hover:bg-[#2e2e33]"
              }`}
              onClick={() => !f.folder && setActiveFile(f)}
            >
              {f.folder ? "📂 " : "📄 "} {f.name}
            </div>
          ))}
        </div>

        {/* RIGHT VIEWER */}
        <div className="flex-1 bg-[#1e1e1e] text-gray-200 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 px-4 py-1 bg-red-500 text-white rounded"
          >
            X
          </button>

          <div className="p-6 overflow-auto h-full">
            {activeFile ? (
              <pre className="whitespace-pre-wrap bg-[#1e1e1e] border border-gray-700 p-4 rounded">
                <code>{activeFile.content}</code>
              </pre>
            ) : (
              <p className="text-gray-400">Select a file to preview.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Grade Modal ===================== */
function GradeModal({ submission, onClose, onSave }) {
  const [grade, setGrade] = useState(submission.grade || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");

  const submitGrade = async () => {
    const token = localStorage.getItem("token");
    const auth = { headers: { Authorization: `Bearer ${token}` } };

    // FIX: grade endpoint
    await axios.put(
      `${API}/api/submissions/${submission.submission_id}/grade`,
      { grade, feedback },
      auth
    );

    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          Grade Submission — {submission.name}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="font-semibold">Grade</label>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded-xl"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold">Feedback</label>
            <textarea
              rows="3"
              className="w-full border px-3 py-2 rounded-xl"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end mt-5 gap-3">
          <button className="px-4 py-2 bg-gray-200 rounded-xl" onClick={onClose}>
            Cancel
          </button>

          <button className="px-4 py-2 bg-yellow-500 text-white rounded-xl" onClick={submitGrade}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Main Component ===================== */
export default function SupervisorTasks({ supervisorId }) {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const [loading, setLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [assigning, setAssigning] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (!supervisorId) return;
    fetchTasks();
    fetchStudents();
  }, [supervisorId]);

  const authHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/api/supervisor/tasks?supervisorId=${supervisorId}`,
        authHeader()
      );
      setTasks(res.data);
    } catch (err) {
      console.error("fetchTasks error:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // FIX: Students of THIS supervisor only
      const res = await axios.get(
        `${API}/api/supervisor/students?supervisorId=${supervisorId}`,
        authHeader()
      );

      const arr = res.data.students || [];

      const formatted = arr.map((s) => ({
        id: s.user_id,
        name: s.full_name,
        email: s.email || "",
        photo_url: s.photo_url || "/user-avatar.jpg",
      }));

      setStudents(formatted);
    } catch (err) {
      console.error("fetchStudents error:", err);
      setStudents([]);
    }
  };

  const fetchSubmissions = async (taskId) => {
    try {
      const res = await axios.get(
        `${API}/api/supervisor/tasks/${taskId}/submissions`,
        authHeader()
      );
      setSubmissions(res.data);
    } catch (err) {
      console.error("fetchSubmissions error:", err);
      setSubmissions([]);
    }
  };

  const fetchTaskDetails = async (id) => {
    setSubmissions([]);
    try {
      const res = await axios.get(`${API}/api/supervisor/tasks/${id}`, authHeader());
      setSelectedTask(res.data);
      fetchSubmissions(id);
    } catch (err) {
      console.error("fetchTaskDetails error:", err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API}/api/supervisor/tasks/${id}`, authHeader());
      if (selectedTask?.task?.id === id) setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      console.error("deleteTask error:", err);
    }
  };

  const toggleSelectStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const assignStudents = async () => {
    if (!selectedTask?.task) return;

    setAssigning(true);
    try {
      await axios.post(
        `${API}/api/supervisor/tasks/${selectedTask.task.id}/assign`,
        { studentIds: selectedStudentIds },
        authHeader()
      );
      setSelectedStudentIds([]);
      fetchTaskDetails(selectedTask.task.id);
      fetchTasks();
    } catch (err) {
      console.error("assignStudents error:", err);
    } finally {
      setAssigning(false);
    }
  };

  const unassignStudent = async (studentId) => {
    try {
      await axios.post(
        `${API}/api/supervisor/tasks/${selectedTask.task.id}/unassign`,
        { studentId },
        authHeader()
      );

      fetchTaskDetails(selectedTask.task.id);
      fetchTasks();
    } catch (err) {
      console.error("unassign error:", err);
    }
  };

  const openCreateModal = () => {
    setEditTask(null);
    setShowTaskModal(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setShowTaskModal(true);
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setShowGradeModal(true);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const formatPrettyDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const previewFile = async (submission) => {
    try {
      // FIX: preview endpoint
      const res = await axios.get(
        `${API}/api/submissions/preview/${submission.submission_id}`,
        authHeader()
      );

      setPreviewData(res.data.files);
      setPreviewUrl(true);
    } catch (err) {
      console.error("Preview error:", err);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8">

      {/* LEFT – Tasks List */}
      <div className="bg-white rounded-3xl p-8 shadow-md border border-yellow-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span role="img">📄</span> All Tasks
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create, assign, and manage tasks for your students.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 transition text-sm font-bold text-white shadow"
          >
            <PlusIcon className="w-5 h-5" /> New Task
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-400 border border-dashed border-yellow-200 p-6 rounded-xl">
            No tasks created yet.
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => fetchTaskDetails(t.id)}
                className={`p-5 rounded-2xl cursor-pointer border transition ${
                  selectedTask?.task?.id === t.id
                    ? "bg-yellow-50 border-yellow-400"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{t.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                      <ClockIcon className="w-4 h-4" />
                      {t.due_date ? formatDate(t.due_date) : "No due date"}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        {t.total_assigned} students
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircleIcon className="w-4 h-4" />
                        {t.submitted_count} submitted
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(t);
                      }}
                      className="p-2 rounded-xl hover:bg-yellow-100 text-gray-700"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(t.id);
                      }}
                      className="p-2 rounded-xl hover:bg-red-100 text-red-500"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT – Task Details */}
      <div className="bg-white rounded-3xl p-8 shadow-md border border-yellow-100">
        {!selectedTask ? (
          <p className="text-center text-gray-400 mt-20">
            Select a task to view its details.
          </p>
        ) : (
          <>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedTask.task.title}
                </h2>

                {selectedTask.task.due_date ? (
                  <p className="text-gray-600 text-sm flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />{" "}
                    {formatDate(selectedTask.task.due_date)}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm">No due date</p>
                )}
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 rounded-xl hover:bg-gray-50"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Students Assigned */}
            <h3 className="font-semibold text-gray-800 mb-2">Assigned Students</h3>
            <div className="border rounded-xl p-3 bg-gray-50 mb-5 max-h-64 overflow-y-auto">
              {selectedTask.assignments.map((a) => (
                <div
                  key={a.assignment_id}
                  className="flex justify-between items-center p-3 border-b last:border-none"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                      {a.status}
                    </span>

                    <button
                      onClick={() => unassignStudent(a.user_id)}
                      className="p-2 rounded-full hover:bg-red-100 transition"
                      title="Remove this student from task"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="red"
                        className="w-5 h-5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Assign Students Section */}
            <h3 className="font-semibold text-gray-800 mb-2">Assign Students</h3>
            <div className="border rounded-xl p-3 bg-gray-50 max-h-64 overflow-y-auto space-y-2">
              {students.map((s) => (
                <label
                  key={s.id}
                  className={`flex justify-between items-center px-3 py-2 rounded-xl cursor-pointer ${
                    selectedStudentIds.includes(s.id)
                      ? "bg-yellow-100 border border-yellow-400"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(s.id)}
                    onChange={() => toggleSelectStudent(s.id)}
                    className="w-4 h-4"
                  />
                </label>
              ))}
            </div>

            <button
              disabled={assigning || selectedStudentIds.length === 0}
              onClick={assignStudents}
              className="mt-4 w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-bold rounded-xl shadow disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {assigning ? "Assigning..." : "Assign Students"}
            </button>

            {/* Submissions */}
            <h3 className="font-semibold text-lg mt-6 mb-3">Submissions</h3>
            <div className="bg-gray-50 rounded-xl p-4 border">
              {submissions.length === 0 ? (
                <p className="text-center text-gray-400 py-6">No submissions yet.</p>
              ) : (
                submissions.map((s) => (
                  <div
                    key={s.submission_id}
                    className="flex justify-between items-center border-b last:border-none py-3"
                  >
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                      <p className="text-xs text-gray-400">{formatPrettyDate(s.submitted_at)}</p>
                      <p className="text-xs text-green-700 mt-1">
                        {s.grade ? `Grade: ${s.grade}` : "No grade yet"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {s.feedback ? `Feedback: ${s.feedback}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => previewFile(s)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => openGradeModal(s)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"
                      >
                        Grade
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <GradeModal
          submission={selectedSubmission}
          onClose={() => setShowGradeModal(false)}
          onSave={() => {
            if (selectedTask?.task?.id) fetchSubmissions(selectedTask.task.id);
          }}
        />
      )}

      {/* Preview Modal */}
      {previewUrl && previewData && (
        <PreviewModal
          files={previewData}
          onClose={() => {
            setPreviewUrl(false);
            setPreviewData(null);
          }}
        />
      )}

      {/* Modal – Create/Edit */}
      {showTaskModal && (
        <TaskModal
          onClose={() => setShowTaskModal(false)}
          onSave={fetchTasks}
          supervisorId={supervisorId}
          task={editTask}
        />
      )}
    </div>
  );
}

/* ===================== Task Modal ===================== */
function TaskModal({ onClose, supervisorId, onSave, task }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      title,
      description,
      due_date: dueDate
        ? new Date(dueDate).toISOString().slice(0, 19).replace("T", " ")
        : null,
      supervisor_id: supervisorId,
    };

    const token = localStorage.getItem("token");
    const auth = { headers: { Authorization: `Bearer ${token}` } };

    if (task) {
      await axios.put(`${API}/api/supervisor/tasks/${task.id}`, body, auth);
    } else {
      await axios.post(`${API}/api/supervisor/tasks`, body, auth);
    }

    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl border border-yellow-100">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {task ? "Edit Task" : "Create Task"}
          </h3>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">Title</label>
            <input
              className="w-full border border-gray-300 rounded-xl px-3 py-2 mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-xl px-3 py-2 mt-1 min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Due Date</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 mt-1"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-white py-2 rounded-xl font-bold mt-4"
            type="submit"
          >
            {task ? "Save Changes" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
