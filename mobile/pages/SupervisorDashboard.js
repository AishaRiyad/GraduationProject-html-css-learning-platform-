// pages/SupervisorDashboard.js
import React, { useEffect, useState, useRef } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { io } from "socket.io-client";
import { Feather as Icon } from "@expo/vector-icons";
import MyStudentsScreen from "./MyStudentsScreen";
import SupervisorSubmissionsScreen from "./SupervisorSubmissionsScreen";
import SupervisorTasksMobile from "./SupervisorTasksMobile";
import SupervisorMessagesMobile from "./SupervisorMessagesMobile";
import SupervisorProfileMobile from "./SupervisorProfileMobile";
import MobileSupervisorHome from "./MobileSupervisorHome";
const ROOT = "http://10.0.2.2:5000"; // نفس الباك إند للموبايل

export default function SupervisorDashboard() {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [activeTab, setActiveTab] = useState("Home");

  const [unreadSupervisor, setUnreadSupervisor] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const socketRef = useRef(null);
  



  // ==============================
  // 1️⃣ تحميل بيانات المستخدم من AsyncStorage
  // ==============================
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("user");

        if (!raw) {
          navigation.replace("Login");
          return;
        }

        const parsed = JSON.parse(raw);

        if (!parsed || !parsed.id || !parsed.role) {
          await AsyncStorage.clear();
          navigation.replace("Login");
          return;
        }

        setUser(parsed);
   

      } catch (err) {
        console.error("❌ Invalid JSON in AsyncStorage(user):", err);
        await AsyncStorage.clear();
        navigation.replace("Login");
      } finally {
        setLoadingUser(false);
      }
    })();
  }, [navigation]);



  // ==============================
  // 2️⃣ Socket.io: رسائل وتسليم مهام
  // ==============================
 useEffect(() => {
  if (!user) return;

  (async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const s = io(ROOT, {
      auth: {
        token, // JWT
      },
      transports: ["websocket"], // أو ["websocket", "polling"] لو بحبّيتي تثبيت أكثر
    });

    socketRef.current = s;

    s.on("connect", () => {
      console.log("✅ Supervisor socket connected");
    });

    s.on("disconnect", () => {
      console.log("❌ Supervisor socket disconnected");
    });

    // 💬 إشعار رسالة جديدة من الطالب
    s.on("new_unread_message", (payload) => {
      console.log("📩 new_unread_message payload:", payload);

      // نتأكد إن الإشعار موجه لهذا المشرف
      if (payload.to !== user.id) return;

      // زيادة عدّاد الأيقونة
      setUnreadSupervisor((prev) => prev + 1);

      // إضافة الإشعار لقائمة الإشعارات
      setNotifications((prev) => [
        {
          type: "message",
          studentId: payload.from,
          message: payload.content,
          time: payload.time || new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // ✅ إشعار تسليم مهمة
    s.on("task_submitted", (payload) => {
      console.log("📥 task_submitted payload:", payload);

      setUnreadSupervisor((prev) => prev + 1);

      setNotifications((prev) => [
        {
          type: "submission",
          studentId: payload.studentId,
          taskId: payload.taskId,
          message: payload.message,
          time: payload.time || new Date().toISOString(),
        },
        ...prev,
      ]);
    });
  })();

  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };
}, [user]);


  // ==============================
  // 3️⃣ تصفير العدّاد عند فتح الرسائل
  // ==============================
  useEffect(() => {
    if (activeTab === "Messages") {
      setUnreadSupervisor(0);
    }
  }, [activeTab]);

  // ==============================
  // 4️⃣ Logout
  // ==============================
  async function handleLogout() {
    await AsyncStorage.clear();
    navigation.replace("Login");
  }

  // شاشة تحميل مؤقتة
  if (loadingUser || !user) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={{ marginTop: 10, color: "#4b5563" }}>Loading...</Text>
      </View>
    );
  }

  // ==============================
  // 5️⃣ Tabs تعريف
  // ==============================
  const tabs = [
    { key: "Home", label: "Home", icon: "home" },
    { key: "My Students", label: "Students", icon: "users" },
    { key: "Submissions", label: "Submissions", icon: "file-text" },
    { key: "Tasks", label: "Tasks", icon: "check-square" },
    { key: "Messages", label: "Messages", icon: "message-circle" },
    { key: "Profile", label: "Profile", icon: "user" },
  ];

  // ==============================
  // 6️⃣ محتوى كل تاب
  // ==============================
  function renderContent() {
    switch (activeTab) {
      case "Home":
        return <MobileSupervisorHome supervisorId={user.id} />;

      case "Profile":
        return <SupervisorProfileMobile user={user} />;

      case "My Students":
        return <MyStudentsScreen />;

      case "Submissions":
        return <SupervisorSubmissionsScreen />;

      case "Tasks":
        return <SupervisorTasksMobile supervisorId={user.id} />;

      case "Messages":
        return <SupervisorMessagesMobile supervisorId={user.id} />;

      default:
        return null;
    }
  }

  // ==============================
  // 7️⃣ التعامل مع الضغط على Notification
  // ==============================
  function handleNotificationPress(n) {
    setShowNotifMenu(false);

    if (n.type === "message") {
      setActiveTab("Messages");
      // لو بدك تمرري آي دي الطالب:
      // ممكن تخزنيه في state أو Context
      // أو AsyncStorage.setItem("open_student_id", String(n.studentId));
    } else if (n.type === "submission") {
      setActiveTab("Submissions");
      // مثال لو حابة تحفظي:
      // AsyncStorage.setItem("open_submission_student", String(n.studentId));
      // AsyncStorage.setItem("open_submission_task", String(n.taskId));
    }
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{activeTab}</Text>
          <Text style={styles.headerSubtitle}>Supervisor Panel</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.bellWrapper}
            onPress={() => {
              setShowNotifMenu((prev) => !prev);
              setUnreadSupervisor(0);
            }}
          >
            <Icon name="bell" size={24} color="#374151" />
            {unreadSupervisor > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadSupervisor > 9 ? "9+" : unreadSupervisor}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profile */}
          <View style={styles.profileWrapper}>
            <Image
              source={
                user.profile_image
                  ? { uri: `http://10.0.2.2:5000${user.profile_image}` }
                  : require("../assets/user-avatar.jpg")
              }
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>
              {user.full_name || "Supervisor"}
            </Text>
          </View>
        </View>
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotifMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowNotifMenu(false)}
        >
          <View style={styles.notifContainer}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifHeaderText}>Notifications</Text>
            </View>

            <ScrollView style={{ maxHeight: 260 }}>
              {notifications.length === 0 ? (
                <Text style={styles.noNotifText}>No notifications</Text>
              ) : (
                notifications.map((n, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.notifItem}
                    onPress={() => handleNotificationPress(n)}
                  >
                    <View style={styles.notifAvatar}>
                      <Text style={{ fontSize: 18 }}>👤</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.notifTitle}>
                        Student #{n.studentId}
                      </Text>
                      <Text style={styles.notifMessage} numberOfLines={1}>
                        {n.message}
                      </Text>
                      <Text style={styles.notifTime}>
                        {new Date(n.time).toLocaleTimeString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CONTENT */}
      <View style={styles.content}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>

      {/* BOTTOM TABS */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={activeTab === tab.key ? "#facc15" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Logout زر */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out" size={20} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =========================
   أقسام محتوى التابات
   (مكانك لاحقاً تربطيها بـ APIs حقيقية)
   ========================= */

function HomeSection({ supervisorId }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Welcome back 👋</Text>
      <Text style={styles.sectionSubtitle}>
        Supervisor ID: {supervisorId}
      </Text>

      <View style={styles.cardsRow}>
        <InfoCard title="My Students" number="—" icon="users" />
        <InfoCard title="Active Tasks" number="—" icon="check-square" />
      </View>

      <View style={styles.cardsRow}>
        <InfoCard title="Submissions" number="—" icon="file-text" />
        <InfoCard title="Messages" number="—" icon="message-circle" />
      </View>
    </View>
  );
}

function ProfileSection({ user }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>My Profile</Text>
      <View style={styles.profileCard}>
        <Image
          source={
            user.profile_image
              ? { uri: `http://10.0.2.2:5000${user.profile_image}` }
              : require("../assets/user-avatar.jpg")
          }
          style={styles.profileImageBig}
        />
        <Text style={styles.profileNameBig}>
          {user.full_name || "Supervisor"}
        </Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
      </View>
    </View>
  );
}

function MyStudentsSection() {
  return (
    <View>
      <Text style={styles.sectionTitle}>My Students</Text>
      <Text style={styles.sectionSubtitle}>
        Here you can list and manage your students.
      </Text>
    </View>
  );
}

function SubmissionsSection() {
  return (
    <View>
      <Text style={styles.sectionTitle}>Submissions</Text>
      <Text style={styles.sectionSubtitle}>
        Review students&apos; submissions and approve or request changes.
      </Text>
    </View>
  );
}

function TasksSection({ supervisorId }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Tasks</Text>
      <Text style={styles.sectionSubtitle}>
        Create and manage tasks for your students. (Supervisor #{supervisorId})
      </Text>
    </View>
  );
}

function MessagesSection({ supervisorId }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Messages</Text>
      <Text style={styles.sectionSubtitle}>
        Chat with your students in real-time. (Supervisor #{supervisorId})
      </Text>
    </View>
  );
}

/* =========================
   كرت إحصائيات بسيط (بديل AnimatedCard)
   ========================= */
function InfoCard({ title, number, icon }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconWrapper}>
        <Icon name={icon} size={22} color="#92400e" />
      </View>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoNumber}>{number}</Text>
    </View>
  );
}

/* =========================
   STYLES
   ========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
  },

  /* HEADER */
  header: {
    marginTop: 25,
    backgroundColor: "white",
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },

  /* PROFILE ON HEADER */
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FFD84D",
    marginRight: 6,
  },
  profileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  /* NOTIFICATION BADGE */
  bellWrapper: {
    padding: 6,
    backgroundColor: "#FFF6D9",
    borderRadius: 10,
    marginRight: 6,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 999,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "white", fontSize: 10 },

  /* CONTENT AREA */
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },

  /* TITLES */
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },

  /* CARDS GRID */
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#FFE7A3",

    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },

  infoIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFF3C4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: { fontSize: 12, color: "#6b7280" },
  infoNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },

  /* PROFILE PAGE */
  profileCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,

    borderWidth: 1,
    borderColor: "#FFD84D",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },

  profileImageBig: {
    width: 100,
    height: 100,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#FFD84D",
    marginBottom: 10,
  },
  profileNameBig: { fontSize: 22, fontWeight: "700", color: "#111" },
  profileEmail: { marginTop: 5, color: "#777" },

  /* NOTIF MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 10,
  },

  notifContainer: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 20,
    paddingBottom: 10,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  notifHeader: {
    padding: 12,
    backgroundColor: "#FFF8D6",
    borderBottomWidth: 1,
    borderColor: "#FFEAB5",
  },
  notifHeaderText: { fontWeight: "700", color: "#333" },
  notifItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  notifAvatar: {
    width: 45,
    height: 45,
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
  notifMessage: { fontSize: 12, color: "#555" },
  notifTime: { fontSize: 10, color: "#999", marginTop: 4 },

  /* BOTTOM TABS */
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#eee",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 10,
    color: "#AAA",
    marginTop: 2,
  },
  tabLabelActive: { color: "#F8C700", fontWeight: "700" },

  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 50,
    backgroundColor: "#F8C700",
    alignItems: "center",
    justifyContent: "center",
  },
});

