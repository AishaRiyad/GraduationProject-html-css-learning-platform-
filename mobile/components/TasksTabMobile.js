import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import { io } from "socket.io-client";
const ROOT = "http://10.0.2.2:5000";

const API = "http://10.0.2.2:5000";

export default function TasksTabMobile({ userId, token }) {
  const [tasks, setTasks] = useState([]);
const [taskNotifications, setTaskNotifications] = useState(0);
useEffect(() => {
  if (!userId || !token) return;

  const s = io(ROOT, {
    auth: { token },
    transports: ["websocket"],
  });

  s.on("connect", () => console.log("🟢 Task socket connected"));

  s.on("task_assigned", (payload) => {
    console.log("📌 New task assigned:", payload);

    // زيادة عدد الإشعارات داخل صفحة المهمات
    setTaskNotifications((prev) => prev + 1);

    // إعادة تحميل المهمات
    axios
      .get(`${API}/api/tasks/student/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTasks(res.data || []))
      .catch(() => {});
  });

  return () => s.disconnect();
}, [userId, token]);

  useEffect(() => {
    axios
      .get(`${API}/api/tasks/student/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTasks(res.data || []))
      .catch(() => {});
  }, []);

  if (tasks.length === 0)
    return <Text style={styles.no}>No tasks assigned yet.</Text>;

  return (
    <ScrollView style={{ marginTop: 10 }}>
      {tasks.map((task) => (
        <View key={task.id} style={styles.card}>
          <Text style={styles.title}>Task #{task.task_id}</Text>
          <Text>Status: {task.status}</Text>
          <Text>Grade: {task.assignment_grade ?? "—"}</Text>
          <Text>Feedback: {task.assignment_feedback ?? "—"}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: "#fff7cc",
    marginVertical: 7,
    borderRadius: 12,
  },
  title: { fontWeight: "bold", fontSize: 16 },
  no: { textAlign: "center", marginTop: 20 },
});
