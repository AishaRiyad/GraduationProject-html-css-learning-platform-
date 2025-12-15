import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView } from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";

const API = "http://10.0.2.2:5000";

export default function ProjectDetailsScreen() {
  const route = useRoute();
  const { id } = route.params;

  const [project, setProject] = useState(null);

  const loadProject = async () => {
    try {
      const res = await axios.get(`${API}/api/project-hub/${id}`);
      setProject(res.data);
    } catch (err) {
      console.log("❌ Error loading project:", err);
    }
  };

  useEffect(() => {
    loadProject();
  }, []);

  if (!project) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#eab308" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: `${API}${project.image_url}` }}
        style={styles.image}
      />

      <Text style={styles.title}>{project.title}</Text>
      <Text style={styles.desc}>{project.description}</Text>

      <Text style={styles.info}>❤️ {project.likes_count} Likes</Text>
      <Text style={styles.info}>💬 {project.comments_count} Comments</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FFF7D7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: 220, borderRadius: 12 },
  title: { fontSize: 26, fontWeight: "bold", marginTop: 10, color: "#b45309" },
  desc: { marginTop: 10, color: "#555", fontSize: 16 },
  info: { marginTop: 10, color: "#444" },
});
