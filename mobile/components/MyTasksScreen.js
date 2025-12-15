// mobile/screens/MyTasksScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";

const API = "http://10.0.2.2:5000";

export default function MyTasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // ==================== HELPERS ====================
  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return (
      date.toLocaleDateString("en-GB") +
      " — " +
      date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const loadTasks = async (uid) => {
    if (!uid) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      // 1) tasks
      const res = await axios.get(`${API}/api/tasks/student/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(res.data || []);

      // 2) submissions
      const subsRes = await axios.get(
        `${API}/api/tasks/submissions/student/${uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const map = {};
      (subsRes.data || []).forEach((s) => {
        map[s.task_id] = s;
      });
      setSubmissions(map);
    } catch (err) {
      console.log("❌ Error loading tasks:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const init = async () => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      console.log("📌 USER JSON:", userJson);

      if (!userJson) {
        setLoading(false);
        Alert.alert("Error", "No user found. Please login again.");
        return;
      }

      const parsed = JSON.parse(userJson);
      if (!parsed?.id) {
        setLoading(false);
        Alert.alert("Error", "Invalid user data.");
        return;
      }

      setUserId(parsed.id);
      await loadTasks(parsed.id);
    } catch (e) {
      console.log("❌ Error parsing user:", e);
      setLoading(false);
      Alert.alert("Error", "Failed to read user info.");
    }
  };

  useEffect(() => {
    init();
  }, []);

  // ==================== UPLOAD & DELETE ====================

  const handlePickAndUpload = async (taskId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      const form = new FormData();
      form.append("file", {
        uri: file.uri,
        name: file.name || "submission",
        type: file.mimeType || "application/octet-stream",
      });
      form.append("task_id", String(taskId));
      form.append("student_id", String(userId));

      const token = await AsyncStorage.getItem("token");

      await axios.post(`${API}/api/tasks/submissions/upload`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Submission uploaded successfully!");
      await loadTasks(userId);
    } catch (err) {
      console.log("❌ Upload error:", err.response?.data || err.message);
      Alert.alert("Error", "Upload failed.");
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    Alert.alert(
      "Delete submission",
      "Are you sure you want to delete this submission?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(
                `${API}/api/tasks/submissions/${submissionId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              Alert.alert("Deleted", "Submission deleted successfully.");
              await loadTasks(userId);
            } catch (err) {
              console.log(
                "❌ Delete error:",
                err.response?.data || err.message
              );
              Alert.alert("Error", "Failed to delete submission.");
            }
          },
        },
      ]
    );
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <View style={styles.centerFull}>
        <ActivityIndicator size="large" color="#eab308" />
        <Text style={{ marginTop: 10 }}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* HEADER BANNER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📄 Your Tasks</Text>
      </View>

      {/* CONTENT */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {tasks.length === 0 ? (
          <View style={styles.centerInner}>
            <Text style={{ color: "#6b7280" }}>No tasks assigned yet.</Text>
          </View>
        ) : (
          tasks.map((task) => {
            const submission = submissions[task.task_id];

            return (
              <View key={task.id} style={styles.card}>
                {/* Title + badge */}
                <View style={styles.cardHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View
                    style={[
                      styles.badge,
                      submission
                        ? styles.badgeSubmitted
                        : styles.badgePending,
                    ]}
                  >
                    <Text
                      style={
                        submission
                          ? styles.badgeSubmittedText
                          : styles.badgePendingText
                      }
                    >
                      {submission ? "SUBMITTED" : "PENDING"}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.description}>{task.description}</Text>

                {/* Dates */}
                <View style={styles.datesBox}>
                  <Text style={styles.dateLine}>
                    <Text style={styles.dateLabel}>Assigned on: </Text>
                    {formatDate(task.created_at)}
                  </Text>
                  <Text style={styles.dateLine}>
                    <Text style={styles.dateLabel}>Deadline: </Text>
                    {formatDate(task.due_date)}
                  </Text>
                </View>

                {/* Submission area */}
                {submission ? (
                  <View style={styles.submissionBox}>
                    <Text style={styles.subLine}>
                      <Text style={styles.subLabel}>Submitted at: </Text>
                      {formatDate(submission.submitted_at)}
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(`${API}${submission.file_path}`)
                      }
                    >
                      <Text style={[styles.subLine, styles.linkText]}>
                        View file
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.subLine}>
                      <Text style={styles.subLabel}>Grade: </Text>
                      {submission.grade ? (
                        submission.grade
                      ) : (
                        <Text style={styles.muted}>No grade yet</Text>
                      )}
                    </Text>

                    <Text style={styles.subLine}>
                      <Text style={styles.subLabel}>Feedback: </Text>
                      {submission.feedback ? (
                        submission.feedback
                      ) : (
                        <Text style={styles.muted}>No feedback yet</Text>
                      )}
                    </Text>

                    {/* Replace + Delete buttons */}
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.replaceBtn}
                        onPress={() => handlePickAndUpload(task.task_id)}
                      >
                        <Text style={styles.replaceBtnText}>Replace File</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteSubmission(submission.id)}
                      >
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadBox}>
                    <Text style={styles.uploadLabel}>Upload submission:</Text>
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={() => handlePickAndUpload(task.task_id)}
                    >
                      <Text style={styles.uploadBtnText}>Choose & Upload</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f4f5",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fff7cc",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#b45309",
  },
  content: {
    flex: 1,
    marginTop: 8,
  },
  centerFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centerInner: {
    marginTop: 40,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#facc15",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#78350f",
    flex: 1,
    paddingRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeSubmitted: {
    backgroundColor: "#bbf7d0",
  },
  badgePending: {
    backgroundColor: "#bfdbfe",
  },
  badgeSubmittedText: {
    color: "#166534",
    fontWeight: "700",
    fontSize: 11,
  },
  badgePendingText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 11,
  },
  description: {
    marginTop: 6,
    color: "#4b5563",
    fontSize: 14,
  },
  datesBox: {
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
  dateLine: {
    fontSize: 12,
    color: "#4b5563",
  },
  dateLabel: {
    fontWeight: "600",
  },
  submissionBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
  subLine: {
    fontSize: 13,
    color: "#374151",
  },
  subLabel: {
    fontWeight: "600",
  },
  muted: {
    color: "#9ca3af",
  },
  linkText: {
    color: "#2563eb",
    textDecorationLine: "underline",
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-start",
  },
  replaceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
    marginRight: 8,
  },
  replaceBtnText: {
    color: "#1d4ed8",
    fontWeight: "600",
    fontSize: 13,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
  },
  deleteBtnText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 13,
  },
  uploadBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  uploadBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#facc15",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  uploadBtnText: {
    color: "#78350f",
    fontWeight: "700",
    fontSize: 13,
  },
});
