// pages/MyStudentsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather as Icon } from "@expo/vector-icons";
import StudentOverviewMobile from "./StudentOverviewMobile";
import StudentSubmissionsMobile from "./StudentSubmissionsMobile";

const API = "http://10.0.2.2:5000";

export default function MyStudentsScreen() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");

        const res = await axios.get(`${API}/api/supervisor/students`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        const studentsArray = Array.isArray(res.data.students)
          ? res.data.students
          : [];

        setStudents(studentsArray);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={{ marginTop: 8, color: "#4b5563" }}>
          Loading students...
        </Text>
      </View>
    );
  }

  // ==========================
  // 🔍 Search + Filter
  // ==========================
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  let filtered = students.filter((s) => {
    const name = s.full_name ? s.full_name.toLowerCase() : "";
    return name.includes(search.toLowerCase());
  });

  filtered = filtered.filter((s) => {
    if (!filter) return true;

    const lastActive = s.last_active ? new Date(s.last_active) : null;

    if (filter === "active_today") {
      return lastActive && lastActive.toDateString() === today.toDateString();
    }

    if (filter === "active_week") {
      return lastActive && lastActive >= sevenDaysAgo;
    }

    if (filter === "inactive") {
      return !lastActive || lastActive < sevenDaysAgo;
    }

    if (filter === "has_projects") {
      return s.submissions_count > 0;
    }

    if (filter === "completed_most") {
      return true;
    }

    return true;
  });

  if (filter === "name_asc")
    filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
  if (filter === "name_desc")
    filtered.sort((a, b) => b.full_name.localeCompare(a.full_name));
  if (filter === "progress_desc")
    filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0));
  if (filter === "progress_asc")
    filtered.sort((a, b) => (a.progress || 0) - (b.progress || 0));
  if (filter === "id_asc") filtered.sort((a, b) => a.user_id - b.user_id);
  if (filter === "id_desc") filtered.sort((a, b) => b.user_id - a.user_id);
  if (filter === "completed_most")
    filtered.sort(
      (a, b) => (b.completed_lessons || 0) - (a.completed_lessons || 0)
    );

  const tabs = [
    { id: "", label: "All" },
    { id: "name_asc", label: "A → Z" },
    { id: "name_desc", label: "Z → A" },
    { id: "progress_desc", label: "Top Progress" },
    { id: "progress_asc", label: "Lowest Progress" },
    { id: "completed_most", label: "Most Completed Lessons" },
    { id: "id_asc", label: "ID ↑" },
    { id: "id_desc", label: "ID ↓" },
    { id: "active_today", label: "Active Today" },
    { id: "active_week", label: "Active This Week" },
    { id: "inactive", label: "Inactive" },
    { id: "has_projects", label: "Has Projects" },
  ];

  // ==========================
  // 📌 Selected student view
  // ==========================
  if (selectedStudentId) {
    if (
      typeof selectedStudentId === "string" &&
      selectedStudentId.startsWith("subs-")
    ) {
      const realId = selectedStudentId.replace("subs-", "");
      return (
        <StudentSubmissionsMobile
          studentId={realId}
          onBack={() => setSelectedStudentId(null)}
        />
      );
    }

    return (
      <StudentOverviewMobile
        studentId={selectedStudentId}
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  // ==========================
  // 📊 Summary stats
  // ==========================
  const totalStudents = students.length;

  const avgProgress = students.length
    ? Math.round(
        students.reduce((sum, s) => sum + (s.progress || 0), 0) /
          students.length
      )
    : 0;

  const totalCompleted = students.reduce(
    (sum, s) => sum + (s.completed_lessons || 0),
    0
  );

  const totalLessons = students.length ? students[0].total_lessons : 0;

  const totalSubmissions = students.reduce(
    (sum, s) => sum + (s.submissions_count || 0),
    0
  );

  const topPerformers = students.filter((s) => (s.progress || 0) >= 80).length;

  const activeToday = students.filter((s) => {
    if (!s.last_active) return false;
    const d = new Date(s.last_active);
    return d.toDateString() === today.toDateString();
  }).length;

  const activeWeek = students.filter((s) => {
    if (!s.last_active) return false;
    const d = new Date(s.last_active);
    return d >= sevenDaysAgo;
  }).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <SummaryBox title="Total Students" value={totalStudents} />
        
      </View>

      <View style={styles.summaryRow}>
        <SummaryBox title="Total Submissions" value={totalSubmissions} />
        
      </View>

      <View style={styles.summaryRow}>
        <SummaryBox title="Top Performers" value={topPerformers} />
        <SummaryBox title="Active Today" value={activeToday} />
      </View>

      <View style={styles.summaryRowLast}>
        <SummaryBox title="Active This Week" value={activeWeek} />
        <SummaryBox title="Total Lessons" value={totalLessons} />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Icon name="search" size={18} color="#9ca3af" />
        <TextInput
          placeholder="Search by student name..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tabs (filters) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10, marginBottom: 12 }}
      >
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setFilter(t.id)}
            style={[
              styles.filterChip,
              filter === t.id && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === t.id && styles.filterTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Students list */}
      {filtered.length === 0 ? (
        <Text style={styles.noStudentsText}>No students found.</Text>
      ) : (
        filtered.map((st) => (
          <View key={st.user_id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image
                source={
                  st.photo_url
                    ? { uri: `${API}${st.photo_url}` }
                    : require("../assets/user-avatar.jpg")
                }
                style={styles.avatar}
              />

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.studentName}>{st.full_name}</Text>
                <Text style={styles.studentId}>Student ID: {st.user_id}</Text>

                <View style={styles.badgesRow}>
                  {(st.progress || 0) >= 80 && (
                    <Badge text="🎖️ Top Performer" color="#fef3c7" />
                  )}
                  {(st.submissions_count || 0) >= 5 && (
                    <Badge text="📂 High Submissions" color="#dbeafe" />
                  )}
                  {st.last_active &&
                    new Date(st.last_active) >= sevenDaysAgo && (
                      <Badge text="📚 Consistent Learner" color="#dcfce7" />
                    )}
                </View>
              </View>
            </View>

            {/* Progress */}
            <View style={{ marginTop: 12 }}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Overall Progress</Text>
                <Text style={styles.progressLabel}>
                  {st.progress != null ? `${st.progress}%` : "0%"}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${st.progress || 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.lessonsText}>
                Lessons: {st.completed_lessons}/{st.total_lessons}
              </Text>
              <Text style={styles.lessonsText}>
                Submissions: {st.submissions_count}
              </Text>
            </View>

            {/* Last Active */}
            {st.last_active && (
              <Text style={styles.lastActiveText}>
                Last active:{" "}
                {new Date(st.last_active).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setSelectedStudentId(st.user_id)}
              >
                <Text style={styles.primaryBtnText}>View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setSelectedStudentId(`subs-${st.user_id}`)}
              >
                <Text style={styles.secondaryBtnText}>View Submissions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}





/* ========================
   Summary Box component
   ======================== */

function SummaryBox({ title, value }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

/* ========================
   Badge component
   ======================== */

function Badge({ text, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeInnerText}>{text}</Text>
    </View>
  );
}

/* ========================
   STYLES
   ======================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },

  /* Summary */
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#FFE7A3",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  /* Search */
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },

  /* Filter chips */
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 6,
    backgroundColor: "#fff",
  },
  filterChipActive: {
    backgroundColor: "#facc15",
    borderColor: "#facc15",
  },
  filterText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#111827",
    fontWeight: "700",
  },

  noStudentsText: {
    marginTop: 20,
    textAlign: "center",
    color: "#9ca3af",
  },

  /* Student Card */
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#facc15",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  studentId: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginTop: 4,
  },
  badgeInnerText: {
    fontSize: 11,
    color: "#111827",
  },

  /* Progress */
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  progressLabel: {
    fontSize: 11,
    color: "#6b7280",
  },
  progressBarBg: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#facc15",
    borderRadius: 999,
  },
  lessonsText: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  lastActiveText: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 6,
  },

  /* Buttons */
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#facc15",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 6,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 6,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },

  /* Detail view */
  detailContainer: {
    flex: 1,
    backgroundColor: "#FFFDF5",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  backText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "500",
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  detailSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  detailPlaceholder: {
    fontSize: 13,
    color: "#6b7280",
  },
});
