import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { getMyProfile } from "./AdminApi";
import { getSocket } from "./socket";

const ROOT = "http://10.0.2.2:5000";

/* ================= utils ================= */

function parseNotifData(n) {
  try {
    if (!n) return null;
    if (typeof n.data === "object") return n.data;
    if (typeof n.data === "string") return JSON.parse(n.data);
    return null;
  } catch {
    return null;
  }
}

async function authHeaders(extra = {}) {
  const t = await AsyncStorage.getItem("token");
  const auth = t ? (t.startsWith("Bearer ") ? t : `Bearer ${t}`) : null;
  return { ...(auth ? { Authorization: auth } : {}), ...extra };
}

/* ================= component ================= */

export default function AdminHeaderMobile({ navigation }) {
  const [adminUser, setAdminUser] = useState(null);
  const [noti, setNoti] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);

  /* ---------- profile ---------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProfile();
        setAdminUser(data || null);
      } catch (e) {
        console.error("Load admin profile failed:", e);
      }
    })();
  }, []);

  /* ---------- notifications (REST) ---------- */
  const loadNoti = async () => {
    try {
      const r = await fetch(`${ROOT}/api/notifications?limit=5`, {
        headers: await authHeaders(),
      });
      if (r.ok) {
        const data = await r.json();
        setNoti(Array.isArray(data) ? data : []);
      }
    } catch {}
  };

  useEffect(() => {
    loadNoti();
    const t = setInterval(loadNoti, 10000);
    return () => clearInterval(t);
  }, []);

  /* ---------- mark read ---------- */
  async function markAllRead() {
    try {
      const unread = noti.filter((n) => Number(n.is_read) === 0);
      const headers = await authHeaders();
      await Promise.all(
        unread.map((n) =>
          fetch(`${ROOT}/api/notifications/${n.id}/read`, {
            method: "POST",
            headers,
          })
        )
      );
      setNoti((o) => o.map((n) => ({ ...n, is_read: 1 })));
    } catch {}
  }

  async function markSingleRead(id) {
    try {
      await fetch(`${ROOT}/api/notifications/${id}/read`, {
        method: "POST",
        headers: await authHeaders(),
      });
      setNoti((o) => o.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    } catch {}
  }

  /* ---------- socket ---------- */
  useEffect(() => {
    let s;
    (async () => {
      s = await getSocket();
      if (!s?.on) return;

      const onNotif = (notif) => {
        setNoti((old) => {
          if (!notif) return old;
          if (old.some((n) => String(n.id) === String(notif.id))) return old;
          return [notif, ...old].slice(0, 5);
        });
      };

      s.on("notifications:new", onNotif);
    })();

    return () => {
      try {
        s?.off?.("notifications:new");
      } catch {}
    };
  }, []);

  /* ---------- push token (Expo Go safe) ---------- */
  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("token");
      if (!t) return;

      try {
        const perm = await Notifications.getPermissionsAsync();
        let granted = perm.granted;
        if (!granted) {
          const req = await Notifications.requestPermissionsAsync();
          granted = req.granted;
        }
        if (!granted) return;

        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ||
          Constants?.easConfig?.projectId;

        if (!projectId) return; // Expo Go

        const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
        const expoToken = tokenResp?.data;
        if (!expoToken) return;

        await fetch(`${ROOT}/api/admin/notifications/fcm-token`, {
          method: "POST",
          headers: await authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ token: expoToken }),
        });
      } catch (err) {
        console.log("Push token skipped:", err?.message);
      }
    })();
  }, []);

  /* ---------- helpers ---------- */
  const unreadCount = useMemo(
    () => noti.filter((n) => Number(n.is_read) === 0).length,
    [noti]
  );

  const avatarUri = adminUser?.profile_image
    ? adminUser.profile_image.startsWith("http")
      ? adminUser.profile_image
      : `${ROOT}${adminUser.profile_image.startsWith("/") ? "" : "/"}${adminUser.profile_image}`
    : null;

  function navTo(screen) {
    setMenuOpen(false);
    navigation.navigate(screen);
  }

  async function logout() {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  }

  /* ================= UI ================= */

  return (
    <View style={styles.headerWrap}>
      <View style={styles.header}>
        <Text style={styles.brand}>Admin Console</Text>

        <View style={styles.right}>
          <Pressable onPress={() => setNotiOpen((v) => !v)} style={styles.bellBtn}>
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.me}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>A</Text>
              </View>
            )}
            <View style={{ marginLeft: 6 }}>
              <Text style={styles.meName}>{adminUser?.name || "Admin"}</Text>
              <Text style={styles.meRole}>{adminUser?.role || "admin"}</Text>
            </View>
          </View>

          <Pressable onPress={logout}>
            <Text style={styles.logout}>Logout</Text>
          </Pressable>

          <Pressable onPress={() => setMenuOpen((v) => !v)} style={styles.menuBtn}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </Pressable>
        </View>
      </View>

      {/* ===== Notifications Modal ===== */}
      <Modal visible={notiOpen} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setNotiOpen(false)}>
          <Pressable style={styles.notiCard}>
            <View style={styles.notiHeader}>
              <Text style={styles.notiTitle}>Notifications</Text>
              <Pressable onPress={markAllRead}>
                <Text style={styles.notiAction}>Mark all</Text>
              </Pressable>
            </View>

            <ScrollView>
              {noti.length === 0 && (
                <Text style={styles.notiEmpty}>No notifications</Text>
              )}

              {noti.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => {
                    setNotiOpen(false);
                    if (!n.is_read) markSingleRead(n.id);
                  }}
                  style={[
                    styles.notiItem,
                    !n.is_read && styles.notiItemUnread,
                  ]}
                >
                  <Text>{n.message}</Text>
                  <Text style={styles.notiDate}>
                    {new Date(n.created_at).toLocaleString()}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ===== Menu ===== */}
      {menuOpen && (
        <View style={styles.menu}>
          <MenuItem label="Dashboard" onPress={() => navTo("AdminDashboard")} />
          <MenuItem label="Users" onPress={() => navTo("AdminUsers")} />
          <MenuItem label="Lessons" onPress={() => navTo("AdminLessons")} />
          <MenuItem label="CSS Lessons" onPress={() => navTo("AdminCssLessons")} />
          <MenuItem label="Quizzes" onPress={() => navTo("AdminQuizzes")} />
          <MenuItem label="Projects" onPress={() => navTo("AdminProjects")} />
          <MenuItem label="Comments" onPress={() => navTo("AdminComments")} />
          <MenuItem label="Analytics" onPress={() => navTo("AdminAnalytics")} />
          <MenuItem label="Settings" onPress={() => navTo("AdminSettings")} />
          <MenuItem label="Chat" onPress={() => navTo("AdminChat")} />
        </View>
      )}
    </View>
  );
}

/* ================= menu item ================= */

function MenuItem({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <Text style={styles.menuItemText}>{label}</Text>
    </Pressable>
  );
}

/* ================= styles ================= */

const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: "#fef9c3",
    borderBottomWidth: 1,
    borderBottomColor: "#fde047",
  },
  header: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 18, fontWeight: "900", color: "#be185d" },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  bellBtn: { position: "relative", padding: 4 },
  bellIcon: { fontSize: 18 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#db2777",
    borderRadius: 999,
    paddingHorizontal: 5,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  me: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fde047",
  },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  avatarFallbackText: { fontWeight: "900", color: "#be185d" },
  meName: { fontSize: 12, fontWeight: "800", color: "#9d174d" },
  meRole: { fontSize: 10, color: "#64748b" },
  logout: { fontSize: 12, textDecorationLine: "underline" },
  menuBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: "#facc15",
    backgroundColor: "#fef08a",
    borderRadius: 10,
  },
  menuLine: { width: 18, height: 2, backgroundColor: "#be185d", marginVertical: 2 },
  menu: { padding: 12, backgroundColor: "#fefce8" },
  menuItem: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#fde047",
  },
  menuItemText: { fontWeight: "700", color: "#9d174d" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingTop: 60,
    paddingHorizontal: 12,
  },
  notiCard: {
    alignSelf: "flex-end",
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fde047",
  },
  notiHeader: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  notiTitle: { fontWeight: "800", color: "#9d174d" },
  notiAction: { fontSize: 12, color: "#be185d" },
  notiEmpty: { padding: 12, color: "#64748b" },
  notiItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  notiItemUnread: { backgroundColor: "#fef9c3" },
  notiDate: { fontSize: 10, color: "#94a3b8", marginTop: 4 },
});
