// mobile/screens/CSSLessonsListMobile.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "http://10.0.2.2:5000";

export default function CSSLessonsListMobile({ navigation }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/css-lessons`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLessons(res.data);
      } catch (err) {
        console.log("❌ Error fetching CSS lessons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const renderLesson = ({ item }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() =>
        navigation.navigate("CSSLessonViewer", {
          lessonId: item.id,
          lessonIndex: lessons.findIndex((l) => l.id === item.id),
          allLessons: lessons,
        })
      }
    >
      <Text style={styles.lessonTitle}>{item.title}</Text>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10 }}>Loading lessons...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>CSS Tutorial</Text>

      <FlatList
        data={lessons}
        renderItem={renderLesson}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#EEF2FF",
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    color: "#4338CA",
  },
  lessonCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    width: "90%",
  },
  arrow: {
    fontSize: 22,
    color: "#6366F1",
  },
});
