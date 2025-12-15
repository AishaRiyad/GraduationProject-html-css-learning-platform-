import React, { useEffect, useState, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { WebView } from "react-native-webview";
import api from "../services/api";

// Components
import InlineQuizMobile from "../components/InlineQuizMobile";
import AICodeGeneratorMobile from "../components/AICodeGeneratorMobile";
import AIAltGeneratorMobile from "../components/AIAltGeneratorMobile";
import InteractiveLinkStylerMobile from "../components/InteractiveLinkStylerMobile";
import InteractiveImageResizerMobile from "../components/InteractiveImageResizerMobile";

export default function LessonViewer3({ navigation }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const [userCode, setUserCode] = useState(`
<!DOCTYPE html>
<html>
<head>
<title>My Favorite Websites and Photos</title>
</head>
<body>
<h1>My Favorite Websites and Photos</h1>
</body>
</html>
`);

  const totalQuestions = 4;
  const progress = Math.min(100, (answeredCount / totalQuestions) * 100);

 useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/lessons/content/3");
        setLesson(res.data);
      } catch (e) {
        console.log("❌ Lesson load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  const handleCorrect = async (points) => {
  const newScore = score + points;
  const newAnswered = answeredCount + 1;
  setScore(newScore);
  setAnsweredCount(newAnswered);

  if (newAnswered >= totalQuestions) {
    setQuizCompleted(true);

    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");

    try {
      await api.post("/api/lessons/complete", {
        userId: Number(userId),
        lessonId: 3,
        quiz_score: 100,
        quiz_passed: 1,
      });

      console.log("Lesson 3 saved, next unlocked");
    } catch (e) {
      console.log("Error saving progress", e);
    }
  }
};


  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E6B800" />
      </View>
    );

  if (!lesson)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Lesson not found</Text>
      </View>
    );

  const sections = lesson.content?.sections || [];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>{lesson.title}</Text>

        <View style={styles.progressBox}>
          <Text style={styles.progressText}>{answeredCount}/4</Text>
        </View>
      </View>

      {/* OVERVIEW */}
      <View style={styles.block}>
        <Text style={styles.heading}>Lesson Overview</Text>
        <Text style={styles.description}>{lesson.description}</Text>

        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      {/* SECTIONS */}
      {sections.map((sec, index) => (
        <View key={index} style={styles.block}>
          <Text style={styles.sectionTitle}>{sec.heading}</Text>

          {/* Default text content */}
          {sec.content && (
            <Text style={styles.text}>{sec.content}</Text>
          )}

          {/* Best Practices list */}
          {sec.items && sec.heading === "Best Practices for Links and Images" && (
            <View style={{ marginTop: 10 }}>
              {sec.items.map((item, i) => (
                <Text key={i} style={styles.listItem}>• {item}</Text>
              ))}
            </View>
          )}

          {/* Inline Quiz */}
          {sec.quiz && (
            <InlineQuizMobile data={sec.quiz} onCorrect={handleCorrect} />
          )}

          {/* AI Features */}
          {sec.aiFeature === "alt-generator-inline" && (
            <AIAltGeneratorMobile />
          )}

          {sec.aiFeature === "html-code-generator-inline" && (
            <AICodeGeneratorMobile />
          )}

          {/* Interactive Tools */}
          {sec.interactive?.type === "style-link" && (
            <InteractiveLinkStylerMobile />
          )}

          {sec.interactive?.type === "resize-image" && (
            <InteractiveImageResizerMobile />
          )}

          {/* Mini Project editor */}
          {sec.task && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.text}>{sec.task}</Text>

              <TextInput
                value={userCode}
                onChangeText={setUserCode}
                multiline
                style={styles.codeEditor}
              />

              <View style={styles.previewBox}>
                <WebView
                  source={{ html: userCode }}
                  style={{ height: 200 }}
                />
              </View>
            </View>
          )}
        </View>
      ))}

      {/* Navigation Buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!quizCompleted}
          style={[
            styles.nextBtn,
            !quizCompleted && { backgroundColor: "#bbb" },
          ]}
          onPress={() => navigation.navigate("LessonViewer4")}
        >
          <Text style={styles.btnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#FFF8D9" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#064F54",
  },

  progressBox: {
    padding: 10,
    backgroundColor: "#F4C430",
    borderRadius: 10,
  },

  progressText: { fontWeight: "bold", color: "#064F54" },

  block: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1E8B1",
  },

  heading: { fontSize: 20, fontWeight: "bold", color: "#064F54" },

  description: {
    marginTop: 10,
    color: "#555",
    lineHeight: 20,
  },

  progressBarBg: {
    width: "100%",
    height: 10,
    backgroundColor: "#FFD",
    borderRadius: 10,
    marginTop: 12,
  },

  progressBarFill: {
    height: 10,
    backgroundColor: "#E6B800",
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#064F54",
    marginBottom: 8,
  },

  text: {
    color: "#444",
    lineHeight: 20,
    marginBottom: 10,
  },

  listItem: {
    color: "#555",
    marginBottom: 5,
  },

  codeEditor: {
    backgroundColor: "#FFFBEA",
    height: 160,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6B800",
    fontFamily: "monospace",
  },

  previewBox: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#E6B800",
    borderRadius: 10,
    overflow: "hidden",
  },

  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    marginTop: 20,
  },

  backBtn: {
    backgroundColor: "#F4C430",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  nextBtn: {
    backgroundColor: "#F4C430",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  btnText: {
    fontWeight: "bold",
    color: "#064F54",
  },
});
