import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from "react-native";
import { getProfile, getLessonsProgress } from "../services/api";
import api from "../services/api";

const API = "http://10.0.2.2:5000";

export default function LevelSelector({ navigation }) {
  const [showLessons, setShowLessons] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSubLevel, setSelectedSubLevel] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [userId, setUserId] = useState(null);


  // 🔥 في الويب كان في external lessonList، بالموبايل مش موجود → لذا نعمل false ثابتة
  const isLessonListExternal = false;

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const profile = await getProfile();   // API موجود عندك
      setUserId(profile.id);
    } catch (err) {
      console.log("❌ Cannot load user:", err);
    }
  };

  fetchUser();
}, []);

  // =========================
  // 🔥 جلب مستوى المستخدم من السيرفر
  // =========================
  useEffect(() => {
    const fetchUserLevel = async () => {
      try {
        const res = await getProfile();
        const level = res.level?.toLowerCase?.() || "basic";
        console.log("📊 User Level:", level);
        setUserLevel(level);
      } catch (err) {
        console.error("❌ Failed to fetch user level:", err);
      }
    };

    fetchUserLevel();
  }, []);

  const isAdvancedUnlocked =
    userLevel === "advanced" || userLevel === "completed" || userLevel === "basic_done";

  // =========================
  // 🔥 عند اختيار مستوى
  // =========================
  const handleSelectLevel = async (level) => {
    if (level === "advanced" && !isAdvancedUnlocked) return;

    try {
      if (level === "basic") {
        await api.post("/api/lessons/initialize", { level });
      }

      setSelectedLevel(level);
      setSelectedSubLevel(null);
      setShowLessons(true);
    } catch (err) {
      console.log("❌ Error initializing lessons:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🟣 بطاقتي Basic و Advanced */}
      <View style={styles.row}>

        {/* Basic Card */}
        <TouchableOpacity
          style={[styles.card, styles.basicCard]}
          onPress={() => handleSelectLevel("basic")}
        >
          <Text style={styles.emoji}>📘</Text>
          <Text style={styles.cardTitle}>Basic</Text>
        </TouchableOpacity>

        <View style={styles.dashed}></View>

        {/* Advanced Card */}
        <TouchableOpacity
          style={[
            styles.card,
            styles.advancedCard,
            !isAdvancedUnlocked && { opacity: 0.5 },
          ]}
          disabled={!isAdvancedUnlocked}
          onPress={() => handleSelectLevel("advanced")}
        >
          <Text style={styles.emoji}>💡</Text>
          <Text style={styles.cardTitle}>Advanced</Text>
        </TouchableOpacity>
      </View>

      {/* Basic Lessons (بدون حذف أي منطق) */}
      {showLessons && selectedLevel === "basic" && !isLessonListExternal && (
        <View style={{ width: "100%", marginTop: 30 }}>
          <TouchableOpacity
  style={styles.lessonItem}
  onPress={() => {
    if (!userId) return; // user id not loaded yet

    navigation.navigate("LessonList", {
      selectedLevel: "basic",
      userId: userId,
    });
  }}
>
  <Text style={styles.lessonText}>View Basic Lessons →</Text>
</TouchableOpacity>


        </View>
      )}

      {/* Advanced Options */}
      {showLessons && selectedLevel === "advanced" && (
        <View style={styles.advancedContainer}>
          <Text style={styles.advHeader}>
            You selected Advanced level. Get ready to dive deeper!
          </Text>

          <View style={styles.advOptions}>

            {/* CSS */}
            <TouchableOpacity
              style={[styles.advCard, styles.cssCard]}
              onPress={() => navigation.navigate("CSSLessonsList")}
            >
              <Text style={styles.advEmoji}>🎨</Text>
              <Text style={styles.advLabel}>CSS Tutorial</Text>
            </TouchableOpacity>

            {/* Quiz */}
            <TouchableOpacity
              style={[styles.advCard, styles.quizCard]}
              onPress={() => navigation.navigate("AdvancedQuiz")}
            >
              <Text style={styles.advEmoji}>🧠</Text>
              <Text style={styles.advLabel}>HTML + CSS Quiz</Text>
            </TouchableOpacity>

            {/* Project */}
            <TouchableOpacity
              style={[styles.advCard, styles.projectCard]}
              onPress={() => navigation.navigate("BuildProject")}
            >
              <Text style={styles.advEmoji}>🏗️</Text>
              <Text style={styles.advLabel}>Build a Project</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },

  card: {
    width: 140,
    height: 100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    elevation: 5,
  },

  basicCard: {
    backgroundColor: "#f472b6",
  },

  advancedCard: {
    backgroundColor: "#4f46e5",
  },

  emoji: {
    fontSize: 35,
  },

  cardTitle: {
    marginTop: 10,
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  dashed: {
    width: 40,
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: "#333",
  },

  lessonItem: {
    padding: 15,
    backgroundColor: "#fef08a",
    borderRadius: 10,
    alignItems: "center",
  },

  lessonText: {
    fontSize: 18,
    fontWeight: "600",
  },

  advancedContainer: {
    marginTop: 40,
    width: "100%",
    alignItems: "center",
  },

  advHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 20,
  },

  advOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
  },

  advCard: {
    width: 150,
    height: 120,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  cssCard: {
    backgroundColor: "#60a5fa",
  },

  quizCard: {
    backgroundColor: "#a855f7",
  },

  projectCard: {
    backgroundColor: "#34d399",
  },

  advEmoji: {
    fontSize: 40,
  },

  advLabel: {
    marginTop: 10,
    fontSize: 16,
    color: "white",
    fontWeight: "700",
  },
});
