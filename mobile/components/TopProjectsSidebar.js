// mobile/components/TopProjectsSidebar.js

import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";

export default function TopProjectsSidebar({
  visible,
  onClose,
  topProjects,
}) {
  if (!visible) return null;

  return (
    <>
      {/* Dark overlay */}
      <TouchableOpacity style={styles.overlay} onPress={onClose} />

      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Text style={styles.heading}>🧠 Top Projects</Text>

        {topProjects.length === 0 ? (
          <Text style={styles.empty}>No top projects available 🤍</Text>
        ) : (
          topProjects.map((p, i) => (
            <View key={i} style={styles.card}>
              <Image
                source={{ uri: `http://10.0.2.2:5000${p.image_url}` }}
                style={styles.img}
              />

              <Text style={styles.rank}>🏆 Rank #{i + 1}</Text>
              <Text style={styles.title}>{p.title}</Text>

              <Text style={styles.desc} numberOfLines={3}>
                {p.description}
              </Text>

              <Text style={styles.reason}>💡 {p.reason}</Text>
            </View>
          ))
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  sidebar: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "78%",
    height: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    elevation: 12,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#b45309",
    marginBottom: 14,
  },

  empty: {
    color: "#777",
    marginTop: 30,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff7d7",
    padding: 10,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#facc15",
  },

  img: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 6,
  },

  rank: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    borderRadius: 6,
    color: "#fff",
    alignSelf: "flex-start",
    marginBottom: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#92400e",
  },

  desc: {
    color: "#555",
    marginVertical: 4,
  },

  reason: {
    color: "#b45309",
    fontStyle: "italic",
    marginTop: 4,
  },
});
