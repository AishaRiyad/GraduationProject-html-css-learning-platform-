import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import api from "../services/api";

// Sections (سننشئها لاحقاً)
import IntroSectionMobile from "../components/lesson4/IntroSectionMobile";
import BuildCardsSectionMobile from "../components/lesson4/BuildCardsSectionMobile";

import PropertyGalleryMobile from "../components/lesson4/PropertyGalleryMobile";
import AIGeneratorSectionMobile from "../components/lesson4/AIGeneratorSectionMobile";
import QuizLesson4Mobile from "../components/lesson4/QuizLesson4Mobile";

export default function LessonViewer4Mobile({ navigation }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // table editor state
  const [editorCode, setEditorCode] = useState("");

  // ai generator
  const [aiDesc, setAiDesc] = useState("");
  const [aiCode, setAiCode] = useState("");

  // gallery popup
  const [openPropertyIndex, setOpenPropertyIndex] = useState(null);

  const scrollRef = useRef();

  // Load lesson data
  useEffect(() => {
    const loadLesson = async () => {
      try {
        const res = await api.get("/api/lessons/content/4");
        setLesson(res.data);
        console.log("QUIZ FROM API:", lesson.quiz);

      } catch (err) {
        console.log("❌ Lesson 4 load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F4C430" />
        <Text>Loading lesson...</Text>
      </View>
    );

  if (!lesson)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Lesson not found</Text>
      </View>
    );

  const sections = lesson.content?.sections || lesson.sections || [];

  const assets = lesson.assets || {};

  const intro = sections[0];
  const build = sections[1];
  const gallery = sections[2];
  const aiGen = sections[3];
  const quiz = lesson.content?.quiz;


  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8D9" }}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#064F54", fontWeight: "bold" }}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{lesson.title}</Text>

        <View style={{ width: 60 }} />
      </View>

      {/* ===== CONTENT ===== */}
      <ScrollView ref={scrollRef} style={{ padding: 12 }}>
        {/* ===== INTRO ===== */}
        <IntroSectionMobile sec={intro} />

        {/* ===== BUILD WITH CARDS ===== */}
        <BuildCardsSectionMobile
          sec={build}
          editorCode={editorCode}
          setEditorCode={setEditorCode}
        />

        

        {/* ===== PROPERTY GALLERY ===== */}
        <PropertyGalleryMobile
          sec={gallery}
          assets={assets}
          openIndex={openPropertyIndex}
          setOpenIndex={setOpenPropertyIndex}
        />

        {/* ===== AI TABLE GENERATOR ===== */}
        <AIGeneratorSectionMobile
          sec={aiGen}
          aiDesc={aiDesc}
          setAiDesc={setAiDesc}
          aiCode={aiCode}
          setAiCode={setAiCode}
        />

        {/* ===== QUIZ ===== */}
        <QuizLesson4Mobile
          quizData={quiz}
          lessonId={4}
          onPassed={() => console.log("Lesson 5 unlocked")}
        />

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#FFF9C4",
    borderBottomWidth: 1,
    borderColor: "#FCD34D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
  },

  backBtn: {
    backgroundColor: "#FDE68A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#D97706",
  },

  previewBox: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#E6B800",
    borderRadius: 10,
    overflow: "hidden",
  },
});
