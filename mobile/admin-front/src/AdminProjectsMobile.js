import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { listProjects, deleteProject } from "./AdminApi";

export default function AdminProjectsMobile({ navigation }) {
  const [projectsByUser, setProjectsByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fmt = (d) => (d ? String(d).replace("T", " ").slice(0, 19) : "");

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const rows = await listProjects(); // same as web
      const grouped = (Array.isArray(rows) ? rows : []).reduce((acc, p) => {
        const uid = p.user_id || "unknown";
        if (!acc[uid]) {
          acc[uid] = {
            userId: p.user_id,
            userName: p.user_name || "(Unknown user)",
            userEmail: p.user_email || "",
            projects: [],
          };
        }
        acc[uid].projects.push(p);
        return acc;
      }, {});
      setProjectsByUser(grouped);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function handleView(id) {
    navigation.navigate("AdminProjectDetails", { id });
  }

  function handleDelete(id) {
    Alert.alert(
      "Confirm",
      "Are you sure you want to delete this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProject(id);
              await loadProjects();
            } catch (e) {
              Alert.alert("Error", e.message || "Failed to delete project.");
            }
          },
        },
      ]
    );
  }

  const userGroups = useMemo(() => Object.values(projectsByUser || {}), [projectsByUser]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Projects by Students</Text>

      {!!error && (
        <View style={[styles.msgBox, styles.msgError]}>
          <Text style={styles.msgErrorText}>{error}</Text>
        </View>
      )}

      {loading && (
        <View style={[styles.msgBox, styles.msgLoading]}>
          <Text style={styles.msgLoadingText}>Loading projects...</Text>
        </View>
      )}

      {!loading && userGroups.length === 0 && (
        <View style={[styles.msgBox, styles.msgEmpty]}>
          <Text style={styles.msgEmptyText}>No projects found.</Text>
        </View>
      )}

      <View style={{ gap: 12 }}>
        {userGroups.map((group) => (
          <View
            key={String(group.userId || group.userName)}
            style={styles.userCard}
          >
            <View style={styles.userHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{group.userName}</Text>
                {!!group.userEmail && (
                  <Text style={styles.userEmail}>{group.userEmail}</Text>
                )}
              </View>
              <Text style={styles.totalText}>
                Total projects: {group.projects?.length || 0}
              </Text>
            </View>

            <View style={{ gap: 10 }}>
              {(group.projects || []).map((p) => (
                <View key={String(p.id)} style={styles.projectRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.projectTitle}>
                      {p.title || "(No title)"}
                    </Text>
                    <Text style={styles.projectMeta}>
                      Created: {fmt(p.created_at)}
                    </Text>
                    <Text style={styles.projectMeta2}>
                      Likes: {p.likes_count ?? 0} · Comments:{" "}
                      {p.comments_count ?? 0}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => handleView(p.id)}
                      style={({ pressed }) => [
                        styles.btn,
                        styles.btnView,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.btnViewText}>View</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleDelete(p.id)}
                      style={({ pressed }) => [
                        styles.btn,
                        styles.btnDelete,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Text style={styles.btnDeleteText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#be185d",
    marginBottom: 10,
  },

  msgBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  msgError: { backgroundColor: "#fee2e2", borderColor: "#fecaca" },
  msgErrorText: { color: "#b91c1c", fontWeight: "700" },
  msgLoading: { backgroundColor: "#fef9c3", borderColor: "#fde68a" },
  msgLoadingText: { color: "#a16207", fontWeight: "700" },
  msgEmpty: { backgroundColor: "#fff", borderColor: "#fde68a" },
  msgEmptyText: { color: "#475569", fontWeight: "700" },

  userCard: {
    borderWidth: 2,
    borderColor: "#fde047",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  userHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#9d174d",
  },
  userEmail: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  totalText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  projectRow: {
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  projectTitle: { fontWeight: "800", color: "#0f172a" },
  projectMeta: { fontSize: 12, color: "#64748b", marginTop: 2 },
  projectMeta2: { fontSize: 12, color: "#94a3b8", marginTop: 2 },

  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  btnView: { backgroundColor: "#fde68a" },
  btnViewText: { color: "#9d174d", fontWeight: "800" },
  btnDelete: { backgroundColor: "#fee2e2" },
  btnDeleteText: { color: "#b91c1c", fontWeight: "800" },
});
