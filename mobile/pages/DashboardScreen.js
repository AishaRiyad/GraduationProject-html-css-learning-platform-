// DashboardScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";

// 👇 استدعاء السايدبار الأصلي تماماً كما هو
import SidebarMenu from "../components/SidebarMenu";
import { io } from "socket.io-client";
const ROOT = "http://10.0.2.2:5000";

export default function DashboardScreen(props) {
  const navigation = useNavigation();
  const API = "http://10.0.2.2:5000";

  const currentUser =
    props.currentUser || props.route?.params?.currentUser || null;

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);


useEffect(() => {
  if (!currentUser || !currentUser.id) return;

  async function connectSocket() {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const s = io(ROOT, {
      auth: { token },
      transports: ["websocket"],
    });

    s.on("connect", () => {
      console.log("🟢 Student socket connected");
    });

    // 🔥 إشعار رسالة جديدة من المشرف
    s.on("new_unread_message", (payload) => {
      console.log("📩 Student received unread message:", payload);

      // نتأكد من أن الرسالة موجهة للطالب الحالي
      if (payload.to !== currentUser.id) return;

      // زيدي عدّاد الإشعار
      setUnreadCount((prev) => prev + 1);

      // خزن الرسالة بقائمة الإشعارات
      setNotifications((prev) => [
        {
          type: "message",
          from: payload.from,
          message: payload.content,
          time: payload.time || new Date().toISOString(),
        },
        ...prev,
      ]);
    });
// إشعار تاسك جديد
s.on("task_assigned", (payload) => {
  console.log("📌 Student got task notification:", payload);

  setUnreadCount((prev) => prev + 1);

  setNotifications((prev) => [
    {
      type: "task",
      taskId: payload.taskId,
      title: payload.title,
      time: payload.assignedAt,
    },
    ...prev,
  ]);
});
    // لو حبيتي إشعار تسليم مهمة أو تقييم لاحقًا
    // s.on("task_graded", ... )

    return () => s.disconnect();
  }

  connectSocket();
}, [currentUser]);


  // ================= FETCH DASHBOARD =================
  useEffect(() => {
    async function fetchDashboard() {
      if (!currentUser || !currentUser.id) {
        console.log("❌ currentUser missing:", currentUser);
        setLoading(false);
        return;
      }

      try {
        const token = await AsyncStorage.getItem("token");

        const res = await axios.get(
          `${API}/api/student/dashboard/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDashboard(res.data);
      } catch (err) {
        console.log("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [currentUser]);

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No dashboard data available.</Text>
      </View>
    );
  }

  // ================= DATA =================
  const { profile, progress, tasks, challenges, projects_count } = dashboard;

  // ================= Doughnut Chart =================
  function Doughnut({ percentage }) {
    const radius = 50;
    const strokeWidth = 12;
    const size = 120;
    const circumference = 2 * Math.PI * radius;
    const progressLen = (percentage / 100) * circumference;

    return (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FDE68A"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FACC15"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progressLen}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.chartPercentage}>{percentage}%</Text>
      </View>
    );
  }

  // ============== Quick Action Card ================
  const QuickCard = ({ icon, title, screen }) => (
    <TouchableOpacity
      style={styles.quickCard}
      onPress={() => navigation.navigate(screen)}
    >
      <View style={styles.quickCardIcon}>
        <Feather name={icon} size={22} color="#B45309" />
      </View>
      <Text style={styles.quickCardText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Feather name="menu" size={26} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Dashboard</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("ProfileMobile")}
          style={styles.headerAvatarWrapper}
        >
          {profile?.profile_image ? (
            <Image
              source={{ uri: profile.profile_image }}
              style={styles.headerAvatar}
            />
          ) : (
            <Feather name="user" size={24} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      </View>

      {/* ===== SIDEBAR (الأصلي الذي كان يعمل) ===== */}
      <SidebarMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
      />

      {/* ===== MAIN CONTENT ===== */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ========= HERO ========= */}
        <View style={styles.heroBox}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View style={styles.heroAvatar}>
              <Feather name="user" size={32} color="#9CA3AF" />
            </View>

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.heroTitle}>
                Welcome back {profile?.full_name}
              </Text>

              <Text style={styles.heroSubtitle}>
                Completed Lessons: {progress.completed_lessons} /{" "}
                {progress.total_lessons}
              </Text>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress.progress_percentage}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          <View>
            <Doughnut percentage={progress.progress_percentage} />
          </View>
        </View>

        {/* ========= QUICK ACTIONS ========= */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActionsGrid}>
          <QuickCard icon="book-open" title="Lessons" screen="LevelSelector" />
          <QuickCard icon="check-circle" title="Tasks" screen="MyTasks" />
          <QuickCard icon="activity" title="Challenges" screen="ChallengesList" />
          <QuickCard icon="folder" title="Projects Hub" screen="ProjectHub" />
          <TouchableOpacity
  style={styles.quickCard}
  onPress={() => {
    navigation.navigate("Notifications", { notifications });
    setUnreadCount(0); // تصفير العداد عند الفتح
  }}
>
  <View style={styles.quickCardIcon}>
    <Feather name="bell" size={22} color="#B45309" />

    {/* 🔥 Badge الأحمر فوق الجرس */}
    {unreadCount > 0 && (
      <View
        style={{
          position: "absolute",
          top: -4,
          right: -4,
          backgroundColor: "red",
          borderRadius: 999,
          paddingHorizontal: 5,
          minWidth: 16,
          height: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 10 }}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </Text>
      </View>
    )}
  </View>

  <Text style={styles.quickCardText}>Notifications</Text>
</TouchableOpacity>

          <QuickCard icon="message-square" title="Messages" screen="Contact" />
        </View>

        {/* ========= CONTINUE LEARNING ========= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Continue Learning</Text>

          <Text style={styles.cardSubtitle}>
            Current Lesson: {progress.current_lesson}
          </Text>

          <TouchableOpacity
            style={styles.cardButton}
            onPress={() =>
              navigation.navigate("LessonViewer", {
                lessonId: progress.current_lesson,
              })
            }
          >
            <Text style={styles.cardButtonText}>Resume</Text>
            <Feather name="arrow-right-circle" size={18} color="#78350F" />
          </TouchableOpacity>
        </View>

        {/* ========= TASKS ========= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tasks Overview</Text>

          <Text>Assigned: {tasks.assigned}</Text>
          <Text>Submitted: {tasks.submitted}</Text>
          <Text>Graded: {tasks.graded}</Text>

          {tasks.upcoming_task && (
            <View style={styles.upcomingBox}>
              <Text style={styles.upcomingTitle}>Upcoming Task:</Text>
              <Text>{tasks.upcoming_task.title}</Text>
              <Text style={styles.upcomingDue}>
                Due: {tasks.upcoming_task.due_date}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("MyTasks")}
                style={{ marginTop: 5 }}
              >
                <Text style={styles.upcomingLink}>Continue Task →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ========= CHALLENGES ========= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Challenges Arena</Text>

          <Text>Total Attempts: {challenges.attempts}</Text>
          <Text>Latest Score: {challenges.last_score ?? "—"}</Text>
          <Text style={styles.feedback}>{challenges.latest_feedback}</Text>

          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate("ChallengesList")}
          >
            <Text style={styles.cardButtonText}>Go to Arena</Text>
            <Feather name="arrow-right-circle" size={18} color="#78350F" />
          </TouchableOpacity>
        </View>

        {/* ========= PROJECTS ========= */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Project Hub</Text>

          <Text>You have {projects_count} projects available.</Text>

          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => navigation.navigate("ProjectHub")}
          >
            <Text style={styles.cardButtonText}>View Projects</Text>
            <Feather name="arrow-right-circle" size={18} color="#78350F" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF9C3",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },

  // HEADER
  header: {
    paddingTop: 52,
    paddingBottom: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderBottomColor: "#FCD34D",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerAvatarWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  // HERO
  heroBox: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 3,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  heroSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  progressBar: {
    width: 170,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
  },
  chartPercentage: {
    position: "absolute",
    top: 50,
    fontSize: 18,
    fontWeight: "700",
    color: "#CA8A04",
  },

  // QUICK ACTIONS
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#444",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickCard: {
    width: "30%",
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 14,
    elevation: 3,
  },
  quickCardIcon: {
    backgroundColor: "#FEF3C7",
    padding: 10,
    borderRadius: 14,
    marginBottom: 6,
  },
  quickCardText: {
    fontSize: 13,
    fontWeight: "600",
  },

  // CARDS
  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  cardButton: {
    backgroundColor: "#FACC15",
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  cardButtonText: {
    fontWeight: "700",
    marginRight: 6,
  },

  upcomingBox: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    marginTop: 12,
    borderRadius: 14,
  },
  upcomingTitle: {
    fontWeight: "700",
  },
  upcomingDue: {
    fontSize: 13,
    color: "#6B7280",
  },
  upcomingLink: {
    color: "#CA8A04",
    marginTop: 4,
  },
  feedback: {
    marginTop: 10,
    fontStyle: "italic",
    color: "#6B7280",
  },
});
