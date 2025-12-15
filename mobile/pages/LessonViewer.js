import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import api from "../services/api";

// Components
import ProgressBar from "../components/ProgressBar";
import TOC from "../components/TOC";
import LessonVideo from "../components/LessonVideo";
import HtmlStructureBuilder from "../components/HtmlStructureBuilder";
import Quiz from "../components/Quiz";

export default function LessonViewer({ route, navigation }) {
  const { lessonId } = route.params;

  const [lesson, setLesson] = useState(null);
  const [nav, setNav] = useState({ prevId: null, nextId: null });
  const [loading, setLoading] = useState(true);
  const [canGoNext, setCanGoNext] = useState(false);

  const sectionsDef = [
    { id: "section-video", label: "Video" },
    { id: "section-intro", label: "Intro" },
    { id: "section-elements", label: "Elements" },
    { id: "section-quiz", label: "Quiz" },
  ];

  const [activeId, setActiveId] = useState("section-video");

  const scrollViewRef = useRef(null);
  const sectionRefs = {
    "section-video": useRef(null),
    "section-intro": useRef(null),
    "section-elements": useRef(null),
    "section-quiz": useRef(null),
  };

  // ===== Scroll Tracking =====
  const handleScroll = () => {
    Object.entries(sectionRefs).forEach(([id, ref]) => {
      ref.current?.measureLayout(
        scrollViewRef.current,
        (x, y, width, height) => {
          if (y < 300 && y + height > 150) {
            setActiveId(id);
          }
        }
      );
    });
  };

  // ===== Load Lesson =====
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);

        const [cRes, nRes] = await Promise.all([
          api.get(`/api/lessons/content/${lessonId}`),
          api.get(`/api/lessons/nav/${lessonId}`),
        ]);

        setLesson(cRes.data);
        if (cRes.data.quizPassed) setCanGoNext(true);

        setNav(nRes.data);
      } catch (err) {
        console.log("❌ Lesson load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text>Loading lesson...</Text>
      </View>
    );

  if (!lesson)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>Lesson not found.</Text>
      </View>
    );

  const intro = lesson.content?.intro;
  const history = lesson.content?.history || [];
  const quiz = lesson.content?.quiz || [];

  return (
    <View style={{ flex: 1, backgroundColor: "#fefce8" }}>
      {/* Progress Bar */}
      <View style={styles.progressBox}>
        <ProgressBar
          percent={
            activeId === "section-video"
              ? 20
              : activeId === "section-intro"
              ? 50
              : activeId === "section-elements"
              ? 80
              : 100
          }
          sections={sectionsDef}
          activeId={activeId}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* HEADER */}
      <View style={styles.headerContainer}>
  <View style={styles.headerRow}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
    <Text style={{ fontSize: 14 }}>← Back</Text>
  </TouchableOpacity>

  
</View>


  <Text style={styles.lessonTitle}>{lesson.title}</Text>
</View>



        {/* TOC */}
        <TOC
          sections={sectionsDef}
          activeId={activeId}
          scrollRefs={sectionRefs}
          scrollViewRef={scrollViewRef}
        />

        {/* VIDEO */}
        <View
          ref={sectionRefs["section-video"]}
          onLayout={() => {}}
          style={styles.section}
        >
          <LessonVideo />
        </View>

        {/* INTRO */}
        <View
          ref={sectionRefs["section-intro"]}
          onLayout={() => {}}
          style={styles.introSection}
        >
          {intro && (
            <View style={styles.introBox}>
             


              <Text style={styles.introTitle}>🌸 Introduction to HTML</Text>
              <Text style={styles.introText}>{intro.text}</Text>

              {intro.bullets?.length > 0 && (
                <View style={styles.bulletBox}>
                  {intro.bullets.map((b, i) => (
                    <Text key={i} style={styles.bullet}>
                      • {b}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TIMELINE */}
          {history.length > 0 && (
            <View style={styles.timelineBox}>
              <Text style={styles.timelineTitle}>🕓 Evolution of HTML</Text>

              <View style={styles.timelineRow}>
                {history.map((h, i) => (
                  <View key={i} style={styles.yearCard}>
                    <Text style={styles.year}>{h.year}</Text>
                    <Text style={styles.event}>{h.event}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ELEMENTS */}
        <View
          ref={sectionRefs["section-elements"]}
          onLayout={() => {}}
          style={styles.section}
        >
          <HtmlStructureBuilder />
        </View>

        {/* QUIZ */}
        <View
          ref={sectionRefs["section-quiz"]}
          onLayout={() => {}}
          style={styles.section}
        >
          {quiz.length > 0 && (
            <Quiz
              lessonId={lesson.id}
              totalQuestions={quiz.length}
              questions={quiz}
              onPassed={() => setCanGoNext(true)}
            />
          )}
        </View>

        {/* FOOTER NAV */}
        <View style={styles.footerNav}>
          <TouchableOpacity
            style={[styles.navBtn, !nav.prevId && styles.disabled]}
            disabled={!nav.prevId}
            onPress={() =>
              navigation.push("LessonViewer", { lessonId: nav.prevId })
            }
          >
            <Text>← Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!canGoNext}
            style={[styles.navBtn, canGoNext ? styles.nextActive : styles.disabled]}
            onPress={() =>
              navigation.push("LessonViewer2", { lessonId: nav.nextId })
            }
          >
            <Text>Next →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  progressBox: {
    padding: 10,
    backgroundColor: "#fef9c3",
    borderBottomWidth: 1,
    borderColor: "#fcd34d",
  },

  /* 🔥 تعديل الهيدر بحيث يصبح العنوان بالنص وزر Back على اليسار */
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 15,
  position: "relative",
  paddingHorizontal: 10,
},

backBtn: {
  position: "absolute",
  left: 0,
  backgroundColor: "#fef3c7",
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 10,
},

  /* 🔥 العنوان الآن بالنص 100% */
  lessonTitle: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#ca8a04",
  textAlign: "center",
  flexShrink: 1, // يمنع العنوان من الخروج برا الشاشة
},

  section: { marginBottom: 30 },

 introSection: {
  marginBottom: 25,
  marginTop: 5,
},

introBox: {
  backgroundColor: "white",
  padding: 18,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#fef3c7",
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 3,
  width: "100%",
},

introImage: {
  width: "100%",
  height: 160,
  borderRadius: 12,
  marginBottom: 12,
  resizeMode: "contain",
},

  introTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#b45309",
    marginBottom: 10,
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    marginBottom: 10,
  },
  bulletBox: { marginTop: 10 },
  bullet: { fontSize: 14, color: "#444", marginBottom: 6 },

  timelineBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  timelineTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  timelineRow: {
    flexDirection: "column",
    gap: 12,
  },
  yearCard: {
    backgroundColor: "#fef9c3",
    padding: 15,
    borderRadius: 12,
  },
  year: { fontWeight: "bold", marginBottom: 5, color: "#92400e" },
  event: { fontSize: 14, color: "#555" },

  footerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    marginTop: 20,
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fef9c3",
    borderRadius: 10,
  },
  disabled: { opacity: 0.3 },
  nextActive: { backgroundColor: "#facc15" },
  headerContainer: {
  marginBottom: 20,
},

headerTop: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 6,
},

lessonTitle: {
  fontSize: 22,
  fontWeight: "bold",
  color: "#ca8a04",
  textAlign: "left",
},



});
