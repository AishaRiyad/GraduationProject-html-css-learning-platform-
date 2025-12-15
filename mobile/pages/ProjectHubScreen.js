// mobile/screens/ProjectHubScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";

import ProjectCardMobile from "../components/ProjectCardMobile";
import AddProjectModal from "../components/AddProjectModal";
import TopProjectsSidebar from "../components/TopProjectsSidebar";

const API = "http://10.0.2.2:5000";

export default function ProjectHubScreen() {
  const [projects, setProjects] = useState([]);
  const [topProjects, setTopProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/api/project-hub`);
      setProjects(res.data);
    } catch (err) {
      console.log("❌ Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProjects = async () => {
    try {
      const res = await axios.get(`${API}/api/ai-local/top-projects`);
      if (Array.isArray(res.data.topProjects)) {
        setTopProjects(res.data.topProjects);
      }
    } catch (err) {
      console.log("❌ Error fetching top projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    setTimeout(fetchTopProjects, 1200);
  }, []);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>🌟 Projects Hub</Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.topBtn}
            onPress={() => setShowTop(true)}
          >
            <Text style={styles.topBtnText}>🧠 Top</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addBtnText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PROJECT LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#f4a300" style={{ marginTop: 50 }} />
      ) : projects.length === 0 ? (
        <Text style={styles.empty}>No projects yet.</Text>
      ) : (
        <ScrollView style={{ marginTop: 10 }}>
          {projects.map((p) => (
            <ProjectCardMobile
              key={p.id}
              project={p}
              onLikeUpdate={() => {
                fetchProjects();
                fetchTopProjects();
              }}
            />
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      {/* MODALS */}
      <AddProjectModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchProjects();
          fetchTopProjects();
        }}
      />

      <TopProjectsSidebar
        visible={showTop}
        onClose={() => setShowTop(false)}
        topProjects={topProjects}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9D9",
    paddingHorizontal: 15,
    paddingTop: 25, // 👈 ينزل المحتوى من بداية الشاشة
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#b45309",
  },

  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },

  addBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: { color: "#fff", fontSize: 18 },

  topBtn: {
    backgroundColor: "#fde047",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  topBtnText: { fontSize: 15 },

  empty: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
  },
});
