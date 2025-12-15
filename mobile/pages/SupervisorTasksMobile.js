// mobile/pages/SupervisorTasksMobile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import axios from "axios";

const API = "http://10.0.2.2:5000";

// ======================= MAIN COMPONENT =========================

export default function SupervisorTasksMobile({ supervisorId }) {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [assigning, setAssigning] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Modals
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [gradeSubmission, setGradeSubmission] = useState(null);

  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewFiles, setPreviewFiles] = useState(null);

  // ---------------- Fetch Tasks + Students ----------------
  useEffect(() => {
    if (!supervisorId) return;
    fetchTasks();
    fetchStudents();
  }, [supervisorId]);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await axios.get(
        `${API}/api/supervisor/tasks?supervisorId=${supervisorId}`
      );
      setTasks(res.data || []);
    } catch (err) {
      console.error("fetchTasks error:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `${API}/api/supervisor/students?supervisorId=${supervisorId}`
      );

      const arr = res.data.students || [];
      const formatted = arr.map((s) => ({
        id: s.user_id,
        name: s.full_name,
        email: s.email || "",
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
        `${API}/api/supervisor/tasks/${taskId}/submissions`
      );
      setSubmissions(res.data || []);
    } catch (err) {
      console.error("fetchSubmissions error:", err);
      setSubmissions([]);
    }
  };

  const fetchTaskDetails = async (id) => {
    try {
      setLoadingDetails(true);
      setSubmissions([]);
      const res = await axios.get(`${API}/api/supervisor/tasks/${id}`);
      setSelectedTask(res.data);
      await fetchSubmissions(id);
    } catch (err) {
      console.error("fetchTaskDetails error:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ---------------- Assign / Unassign ----------------
  const toggleSelectStudent = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const assignStudents = async () => {
    if (!selectedTask?.task) return;
    try {
      setAssigning(true);
      await axios.post(
        `${API}/api/supervisor/tasks/${selectedTask.task.id}/assign`,
        { studentIds: selectedStudentIds }
      );
      setSelectedStudentIds([]);
      await fetchTaskDetails(selectedTask.task.id);
      await fetchTasks();
    } catch (err) {
      console.error("assignStudents error:", err);
    } finally {
      setAssigning(false);
    }
  };

  const unassignStudent = async (studentId) => {
    if (!selectedTask?.task) return;
    try {
      await axios.post(
        `${API}/api/supervisor/tasks/${selectedTask.task.id}/unassign`,
        { studentId }
      );
      await fetchTaskDetails(selectedTask.task.id);
      await fetchTasks();
    } catch (err) {
      console.error("unassignStudent error:", err);
    }
  };

  // ---------------- Task CRUD (Create / Edit / Delete) ----------------
  const openCreateModal = () => {
    setEditTask(null);
    setTaskModalVisible(true);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setTaskModalVisible(true);
  };

  const handleTaskSaved = async () => {
    await fetchTasks();
    if (selectedTask?.task?.id) {
      await fetchTaskDetails(selectedTask.task.id);
    }
  };

  const deleteTask = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API}/api/supervisor/tasks/${id}`);
              if (selectedTask?.task?.id === id) setSelectedTask(null);
              await fetchTasks();
            } catch (err) {
              console.error("deleteTask error:", err);
            }
          },
        },
      ]
    );
  };

  // ---------------- Grade Modal ----------------
  const openGradeModal = (submission) => {
    setGradeSubmission(submission);
    setGradeModalVisible(true);
  };

  const handleGradeSaved = async () => {
    if (selectedTask?.task?.id) {
      await fetchSubmissions(selectedTask.task.id);
    }
  };

  // ---------------- Preview Modal ----------------
  const previewFile = async (submission) => {
    try {
      const res = await axios.get(
        `${API}/api/submissions/preview/${submission.submission_id}`
      );
      setPreviewFiles(res.data.files || []);
      setPreviewModalVisible(true);
    } catch (err) {
      console.error("previewFile error:", err);
    }
  };

  const formatPrettyDate = (dateStr) => {
    if (!dateStr) return "";
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

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "";

  // ======================= RENDER =========================

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        <Text style={styles.pageTitle}>Tasks</Text>

        {/* ------------- LEFT: TASKS LIST ------------- */}
        <View style={styles.sectionBox}>
         <View style={{ position: "relative" }}>

  {/* زر نيو في زاوية الكارد */}
  <TouchableOpacity
    style={styles.newTaskFloating}
    onPress={openCreateModal}
  >
    <Text style={styles.newTaskBtnText}>+ New Task</Text>
  </TouchableOpacity>

  {/* العنوان */}
  <View style={styles.tasksHeader}>
    <Text style={styles.tasksHeaderTitle}>All Tasks</Text>
    
  </View>

</View>



          {loadingTasks ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#facc15" />
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : tasks.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No tasks created yet.</Text>
            </View>
          ) : (
            tasks.map((t, index) => (
              <TouchableOpacity
                key={t.id?.toString() || `task-${index}`}
                style={[
                  styles.taskCard,
                  selectedTask?.task?.id === t.id && styles.taskCardActive,
                ]}
                onPress={() => fetchTaskDetails(t.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>{t.title}</Text>
                  <Text style={styles.taskSmallText}>
                    {t.due_date ? formatDate(t.due_date) : "No due date"}
                  </Text>
                  <Text style={styles.taskSmallText2}>
                    {t.total_assigned} students • {t.submitted_count} submitted
                  </Text>
                </View>

                <View style={styles.taskActions}>
                  <TouchableOpacity onPress={() => openEditModal(t)}>
                    <Text style={styles.actionEdit}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deleteTask(t.id)}>
                    <Text style={styles.actionDelete}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ------------- RIGHT: TASK DETAILS ------------- */}
        <View style={styles.sectionBox}>
          {!selectedTask ? (
            <View style={styles.centerBox}>
              <Text style={styles.emptyText}>
                Select a task to view its details.
              </Text>
            </View>
          ) : loadingDetails ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="small" color="#facc15" />
              <Text style={styles.loadingText}>Loading details...</Text>
            </View>
          ) : (
            <>
              {/* Header */}
              <View style={styles.taskDetailsHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailsTitle}>
                    {selectedTask.task.title}
                  </Text>

                  {selectedTask.task.due_date ? (
                    <Text style={styles.detailsDate}>
                      {formatDate(selectedTask.task.due_date)}
                    </Text>
                  ) : (
                    <Text style={styles.noDateText}>No due date</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.clearSelectionBtn}
                  onPress={() => setSelectedTask(null)}
                >
                  <Text style={styles.clearSelectionText}>Clear</Text>
                </TouchableOpacity>
              </View>

              {/* Assigned Students */}
              <Text style={styles.subHeader}>Assigned Students</Text>
              <View style={styles.boxWithBorder}>
                {selectedTask.assignments.length === 0 ? (
                  <Text style={styles.emptyText}>No students assigned yet.</Text>
                ) : (
                  selectedTask.assignments.map((a, index) => (
                    <View
                      key={
                        a.assignment_id?.toString() || `assign-${index}`
                      }
                      style={styles.studentRow}
                    >
                      <View>
                        <Text style={styles.studentName}>{a.name}</Text>
                        <Text style={styles.studentEmail}>{a.email}</Text>
                        <Text style={styles.statusBadge}>{a.status}</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => unassignStudent(a.user_id)}
                      >
                        <Text style={styles.unassignText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              {/* Assign Students */}
              <Text style={styles.subHeader}>Assign Students</Text>
              <View style={styles.boxWithBorder}>
                {students.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No students available to assign.
                  </Text>
                ) : (
                  students.map((s, index) => (
                    <TouchableOpacity
                      key={s.id?.toString() || `stud-${index}`}
                      style={[
                        styles.assignRow,
                        selectedStudentIds.includes(s.id) &&
                          styles.assignRowActive,
                      ]}
                      onPress={() => toggleSelectStudent(s.id)}
                    >
                      <View>
                        <Text style={styles.studentName}>{s.name}</Text>
                        <Text style={styles.studentEmail}>{s.email}</Text>
                      </View>

                      <View style={styles.checkbox}>
                        {selectedStudentIds.includes(s.id) && (
                          <Text style={{ fontSize: 14 }}>✓</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                )}

                <TouchableOpacity
                  disabled={assigning || selectedStudentIds.length === 0}
                  onPress={assignStudents}
                  style={[
                    styles.assignBtn,
                    (assigning || selectedStudentIds.length === 0) && {
                      opacity: 0.4,
                    },
                  ]}
                >
                  <Text style={styles.assignBtnText}>
                    {assigning ? "Assigning..." : "Assign Students"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submissions */}
              <Text style={styles.subHeader}>Submissions</Text>
              <View style={styles.boxWithBorder}>
                {submissions.length === 0 ? (
                  <Text style={styles.emptyText}>No submissions yet.</Text>
                ) : (
                  submissions.map((s, index) => (
                    <View
                      key={
                        s.id?.toString() ||
                        s.submission_id?.toString() ||
                        `sub-${index}`
                      }
                      style={styles.submissionRow}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentName}>{s.name}</Text>
                        <Text style={styles.studentEmail}>{s.email}</Text>
                        {s.submitted_at && (
                          <Text style={styles.dateSmall}>
                            {formatPrettyDate(s.submitted_at)}
                          </Text>
                        )}

                        <Text style={styles.gradeInfo}>
                          {s.grade ? `Grade: ${s.grade}` : "No grade yet"}
                        </Text>
                        {s.feedback ? (
                          <Text style={styles.feedbackText}>
                            Feedback: {s.feedback}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.submissionButtons}>
                        <TouchableOpacity
                          style={styles.previewBtn}
                          onPress={() => previewFile(s)}
                        >
                          <Text style={styles.previewBtnText}>Preview</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.gradeBtn}
                          onPress={() => openGradeModal(s)}
                        >
                          <Text style={styles.gradeBtnText}>Grade</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* ========== MODALS ========== */}

      {/* Task Create / Edit */}
      <TaskModal
        visible={taskModalVisible}
        onClose={() => setTaskModalVisible(false)}
        supervisorId={supervisorId}
        onSaved={handleTaskSaved}
        task={editTask}
      />

      {/* Grade Modal */}
      <GradeModal
        visible={gradeModalVisible}
        submission={gradeSubmission}
        onClose={() => setGradeModalVisible(false)}
        onSaved={handleGradeSaved}
      />

      {/* Preview Modal */}
      <PreviewModal
        visible={previewModalVisible}
        files={previewFiles || []}
        onClose={() => setPreviewModalVisible(false)}
      />
    </View>
  );
}

// ======================= Task Modal =========================

function TaskModal({ visible, onClose, supervisorId, onSaved, task }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setDueDate(
      task?.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ""
    );
  }, [task, visible]);

  const handleSave = async () => {
    if (!title.trim()) return;
    try {
      setSaving(true);
      const body = {
        title,
        description,
        due_date: dueDate
          ? new Date(dueDate).toISOString().slice(0, 19).replace("T", " ")
          : null,
        supervisor_id: supervisorId,
      };

      if (task) {
        await axios.put(`${API}/api/supervisor/tasks/${task.id}`, body);
      } else {
        await axios.post(`${API}/api/supervisor/tasks`, body);
      }

      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error("TaskModal handleSave error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {task ? "Edit Task" : "Create Task"}
          </Text>

          <Text style={styles.modalLabel}>Title</Text>
          <TextInput
            style={styles.modalInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
          />

          <Text style={styles.modalLabel}>Description</Text>
          <TextInput
            style={[styles.modalInput, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Task description"
            multiline
          />

          <Text style={styles.modalLabel}>Due Date (optional)</Text>
          <TextInput
            style={styles.modalInput}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DDTHH:MM"
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : task ? "Save Changes" : "Create Task"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ======================= Grade Modal =========================

function GradeModal({ visible, submission, onClose, onSaved }) {
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGrade(submission?.grade ? String(submission.grade) : "");
    setFeedback(submission?.feedback || "");
  }, [submission, visible]);

  if (!submission) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(
        `${API}/api/submissions/${submission.submission_id}/grade`,
        { grade, feedback }
      );
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error("GradeModal handleSave error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            Grade Submission — {submission.name}
          </Text>

          <Text style={styles.modalLabel}>Grade</Text>
          <TextInput
            style={styles.modalInput}
            value={grade}
            onChangeText={setGrade}
            keyboardType="numeric"
            placeholder="e.g. 95"
          />

          <Text style={styles.modalLabel}>Feedback</Text>
          <TextInput
            style={[styles.modalInput, { height: 80 }]}
            value={feedback}
            onChangeText={setFeedback}
            multiline
            placeholder="Write your feedback here..."
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ======================= Preview Modal =========================

function PreviewModal({ visible, files, onClose }) {
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    if (visible && files && files.length > 0) {
      const first = files.find((f) => !f.folder) || files[0];
      setActiveFile(first);
    } else {
      setActiveFile(null);
    }
  }, [visible, files]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.previewOverlay}>
        <View style={styles.previewCard}>
          <Text style={[styles.modalTitle, { color: "#fff" }]}>
            ZIP Content Preview
          </Text>

          <ScrollView style={styles.previewList}>
            {files && files.length > 0 ? (
              files.map((f, index) => (
                <TouchableOpacity
                  key={`${f.name || "file"}-${index}`}
                  style={[
                    styles.previewItem,
                    activeFile?.name === f.name && styles.previewItemActive,
                  ]}
                  onPress={() => setActiveFile(f)}
                >
                  <Text style={styles.previewItemText}>
                    {f.folder ? "📂" : "📄"} {f.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ color: "#ccc" }}>No files found.</Text>
            )}
          </ScrollView>

          <ScrollView style={styles.previewContent}>
            {activeFile && !activeFile.folder ? (
              <Text style={{ color: "#eee" }}>
                {activeFile.content || "(no content)"}
              </Text>
            ) : (
              <Text style={{ color: "#666" }}>
                Select a file to preview its content.
              </Text>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closePreviewBtn}
            onPress={onClose}
          >
            <Text style={styles.closePreviewText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ======================= STYLES =========================

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFFDF5",
  },
  container: {
    padding: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
    color: "#111827",
  },
  sectionBox: {
  backgroundColor: "white",
  borderRadius: 18,
  paddingHorizontal: 16, // 🎯 توسيع المساحة أفقياً
  paddingVertical: 18,   // 🎯 مهم جداً ليعطي مساحة للزر
  marginBottom: 20,
  borderWidth: 1,
  borderColor: "#FFE7A3",
  overflow: "hidden",    // 🎯 يمنع أي عنصر يطلع خارج الكارد
},

 

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },



 newTaskBtnText: {
  fontWeight: "700",
  fontSize: 14,
  color: "#111827",
},

  centerBox: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 12,
  },
  emptyBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#FDE68A",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  taskCardActive: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FACC15",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  taskSmallText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  taskSmallText2: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  taskActions: {
    marginLeft: 12,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  actionEdit: {
    color: "#CA8A04",
    fontSize: 13,
  },
  actionDelete: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 6,
  },
  taskDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  detailsDate: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 4,
  },
  noDateText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  clearSelectionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  clearSelectionText: {
    fontSize: 12,
    color: "#6B7280",
  },
  subHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    marginBottom: 6,
  },
  boxWithBorder: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
    backgroundColor: "#F9FAFB",
  },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  studentName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  studentEmail: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusBadge: {
    marginTop: 4,
    fontSize: 11,
    color: "#15803D",
  },
  unassignText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 13,
  },
  assignRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 6,
    backgroundColor: "white",
  },
  assignRowActive: {
    backgroundColor: "#FEF9C3",
    borderColor: "#FACC15",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4B5563",
    alignItems: "center",
    justifyContent: "center",
  },
  assignBtn: {
    marginTop: 8,
    backgroundColor: "#FACC15",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  assignBtnText: {
    fontWeight: "700",
    color: "#111827",
  },
  submissionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateSmall: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  gradeInfo: {
    marginTop: 4,
    fontSize: 12,
    color: "#15803D",
  },
  feedbackText: {
    fontSize: 12,
    color: "#4B5563",
  },
  submissionButtons: {
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 6,
  },
  previewBtn: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  previewBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  gradeBtn: {
    backgroundColor: "#FACC15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gradeBtnText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "88%",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
    color: "#111827",
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 3,
    color: "#374151",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: "#F9FAFB",
  },
  saveBtn: {
    marginTop: 12,
    backgroundColor: "#FACC15",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    fontWeight: "700",
    color: "#111827",
  },
  cancelBtn: {
    marginTop: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  // Preview
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  previewCard: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
  },
  previewList: {
    maxHeight: 160,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4B5563",
    padding: 6,
  },
  previewItem: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  previewItemActive: {
    backgroundColor: "#1F2937",
  },
  previewItemText: {
    color: "#E5E7EB",
    fontSize: 13,
  },
  previewContent: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4B5563",
    padding: 8,
    minHeight: 120,
  },
  closePreviewBtn: {
    marginTop: 12,
    backgroundColor: "#FACC15",
    paddingVertical: 10,
    borderRadius: 12,
  },
  closePreviewText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#111827",
  },
 tasksHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,   // ← ← الحل
  width: "100%",
},



tasksHeaderTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#111827",
},

tasksHeaderSubtitle: {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 2,
},

newTaskBtn: {
  backgroundColor: "#facc15",
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 50,
  alignSelf: "flex-start",
  marginTop: 0,
},


newTaskBtnText: {
  fontWeight: "700",
  fontSize: 14,
  color: "#111",
},
newTaskFloating: {
  position: "absolute",
  right: 0,
  top: -10,
  backgroundColor: "#facc15",
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 50,
  zIndex: 10,
},

});
