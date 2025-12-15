// components/Student/LessonProgressMobile.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import axios from "axios";

const API = "http://10.0.2.2:5000";

export default function LessonProgressMobile({ userId, token }) {
  const [progress, setProgress] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    try {
      const res = await axios.get(`${API}/api/lessons/progress/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProgress(res.data.progress || []);
      setCurrentLesson(res.data.currentLesson || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Text>Loading lessons...</Text>;

  if (!progress.length)
    return <Text style={{ marginTop: 10 }}>No lessons yet.</Text>;

  const completed = progress.filter((l) => l.is_completed).length;
  const total = progress.length;
  const percentage = Math.round((completed / total) * 100);

  const current = progress.find((l) => !l.is_completed);
  const currentDisplay = current ? current.display_number : total;

  return (
    <ScrollView>
      {/* Progress bar */}
      <Text style={styles.progressText}>
        Progress: {completed}/{total} ({percentage}%)
      </Text>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>

      {/* Lessons list */}
      <View style={{ marginTop: 20 }}>
        {progress.map((lesson) => (
          <View key={lesson.lesson_id} style={styles.lessonCard}>
            <View>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              <Text style={styles.lessonStatus}>
                {lesson.is_completed ? "✔ Completed" : "🔓 In Progress"}
              </Text>
            </View>

            <Text
              style={[
                styles.lessonScore,
                { color: lesson.quiz_passed ? "green" : "#777" },
              ]}
            >
              {lesson.quiz_passed
                ? `Score: ${lesson.quiz_score}%`
                : "Not Passed"}
            </Text>
          </View>
        ))}
      </View>

      {/* Current lesson */}
      {currentLesson && (
        <Text style={styles.currentLesson}>
          🎯 You're currently on Lesson {currentDisplay}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#eab308",
  },
  lessonCard: {
    padding: 15,
    backgroundColor: "#fef9c3",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#facc15",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  lessonStatus: {
    color: "#555",
    marginTop: 3,
  },
  lessonScore: {
    fontWeight: "600",
  },
  currentLesson: {
    marginTop: 20,
    textAlign: "center",
    fontWeight: "700",
    color: "#eab308",
    fontSize: 18,
  },
});
