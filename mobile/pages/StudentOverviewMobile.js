// pages/StudentOverviewMobile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Feather as Icon } from "@expo/vector-icons";

const API = "http://10.0.2.2:5000";

export default function StudentOverviewMobile({ studentId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${API}/api/supervisor/students/${studentId}`);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching student overview:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!data) {
    return <Text style={styles.error}>Student not found.</Text>;
  }

  const { student, progress, timeline } = data;

  return (
    <ScrollView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Icon name="arrow-left" size={20} color="#555" />
        <Text style={styles.backBtnText}>Back to My Students</Text>
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.centerBox}>
        <Image
          source={
            student.photo_url
              ? { uri: `${API}${student.photo_url}` }
              : require("../assets/user-avatar.jpg")
          }
          style={styles.profileImage}
        />

        <Text style={styles.studentName}>{student.full_name}</Text>
        <Text style={styles.studentEmail}>{student.email}</Text>
      </View>

      {/* Basic Info */}
      <View style={styles.grid}>
        <InfoCard label="City" value={student.city || "—"} />
        <InfoCard label="Address" value={student.address || "—"} />
        <InfoCard label="Phone Number" value={student.phone_number || "—"} />
        <InfoCard
          label="Last Login"
          value={
            student.last_login
              ? new Date(student.last_login).toLocaleString()
              : "—"
          }
        />
      </View>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.aboutBox}>
        <Text style={styles.aboutText}>
          {student.about_me || "No description provided."}
        </Text>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Statistics</Text>
      <View style={styles.statsRow}>
        <StatCard label="Lessons" value={`${progress.lessons}%`} />
        <StatCard label="Quiz Avg" value={`${progress.quizzes}%`} />
        <StatCard label="Projects" value={progress.projects} />
      </View>

      {/* Timeline */}
      <Text style={styles.sectionTitle}>Activity Timeline</Text>

      {timeline.length === 0 && (
        <Text style={styles.noActivity}>No activity yet.</Text>
      )}

      {timeline.map((item, i) => (
        <View key={i} style={styles.timelineCard}>
          <Text style={styles.timelineType}>{item.type}</Text>
          <Text style={styles.timelineDate}>
            {item.timestamp
              ? new Date(item.timestamp).toLocaleString()
              : "—"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

/* Components */
function InfoCard({ label, value }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF5", padding: 16 },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#444" },
  error: { textAlign: "center", marginTop: 20, color: "red" },

  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backBtnText: { marginLeft: 6, fontSize: 14, color: "#555" },

  centerBox: { alignItems: "center", marginBottom: 20 },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#facc15",
  },
  studentName: { fontSize: 20, fontWeight: "700", marginTop: 8 },
  studentEmail: { color: "#666" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoCard: {
    width: "48%",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  infoLabel: { fontSize: 12, color: "#666" },
  infoValue: { fontSize: 16, fontWeight: "700", marginTop: 4 },

  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },

  aboutBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  aboutText: { color: "#555" },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    width: "32%",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#facc15",
    alignItems: "center",
  },
  statLabel: { color: "#555" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#d97706" },

  timelineCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginTop: 10,
  },
  timelineType: { fontWeight: "700", textTransform: "capitalize" },
  timelineDate: { color: "#555", marginTop: 4 },
  noActivity: { color: "#777", marginTop: 8 },
});
