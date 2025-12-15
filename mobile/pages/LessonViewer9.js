// File: src/pages/LessonViewer9Mobile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import LiveCodeBoxMobile from "../components/LiveCodeBoxMobile";
import SmartListAIMobile from "../components/SmartListAIMobile";
import Quiz from "../components/Quiz";

const API = "http://10.0.2.2:5000";

export default function LessonViewer9Mobile() {
  const navigation = useNavigation();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showContents, setShowContents] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/35`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load lesson 9", e);
        Alert.alert("Error", "Failed to load lesson 9");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F5B700" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: "#e53935" }]}>
          Lesson not found
        </Text>
      </View>
    );
  }

  const totalSections = lesson.sections.length;
  const section = lesson.sections[currentIndex];
  const progress = ((currentIndex + 1) / totalSections) * 100;

  const next = () => {
    if (currentIndex < totalSections - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const back = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // ================================
  // 🧩 Section Renderer (Mobile)
  // ================================
  const renderSectionMobile = (sec) => {
    const { title, content, example, aiTask, table, quiz } = sec;

    // ✅ وعاء موحّد لكل السكاشن (يشبه Container في الويب)
    const Container = ({ children }) => (
      <View style={styles.sectionCard}>
        {children}
      </View>
    );

    // 📊 Table section
    if (table) {
      return (
        <Container>
          <Text style={styles.sectionTitle}>{title}</Text>
          {content ? (
            <Text style={styles.sectionText}>{content}</Text>
          ) : null}

          <View style={styles.tableContainer}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              {table.headers.map((h, i) => (
                <View key={i} style={styles.tableCell}>
                  <Text style={styles.tableHeaderText}>{h}</Text>
                </View>
              ))}
            </View>

            {/* Rows */}
            {table.rows.map((row, i) => (
              <View
                key={i}
                style={[
                  styles.tableRow,
                  i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                ]}
              >
                {row.map((cell, j) => (
                  <View key={j} style={styles.tableCell}>
                    <Text style={styles.tableCellText}>{cell}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </Container>
      );
    }

    // 💡 Example section
    if (example) {
      return (
        <Container>
          <Text style={styles.sectionTitle}>{title}</Text>
          {content ? (
            <Text style={styles.sectionText}>{content}</Text>
          ) : null}
          <LiveCodeBoxMobile initialCode={example.code} />
        </Container>
      );
    }

    // ⚡ AI Smart List Builder
    if (aiTask) {
      return (
        <Container>
          <Text style={styles.sectionTitle}>{title}</Text>
          {content ? (
            <Text style={styles.sectionText}>{content}</Text>
          ) : null}
          <SmartListAIMobile aiTask={aiTask} />
        </Container>
      );
    }

    // 🧠 Quiz section
    if (quiz) {
      // في الويب: quiz عبارة عن Array من الأسئلة
      const processedQuestions = quiz.map((q) => {
        const answerIndex = q.options.findIndex(
          (opt) => opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
        );
        return { ...q, answer: answerIndex !== -1 ? answerIndex : 0 };
      });

      return (
        <Container>
          <Text style={[styles.sectionTitle, { textAlign: "center" }]}>
            {title}
          </Text>

          <Quiz
            lessonId={35}
            questions={processedQuestions}
            totalQuestions={processedQuestions.length}
            onPassed={() => setQuizPassed(true)}
          />

          {/* أزرار بعد الكويز (نفس منطق الويب) */}
          <View style={styles.quizNavRow}>
            <TouchableOpacity
              style={styles.prevLessonButton}
              onPress={() => navigation.navigate("LessonViewer8", { lessonId: 34 })}
            >
              <Text style={styles.prevLessonText}>⬅️ Previous Lesson</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!quizPassed}
              style={[
                styles.nextLessonButton,
                !quizPassed && styles.nextLessonDisabled,
              ]}
              onPress={() => {
                if (quizPassed) {
                  navigation.navigate("LessonViewer10", { lessonId: 36 });
                }
              }}
            >
              <Text style={styles.nextLessonText}>Next Lesson ➡️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.quizHintText}>
            {quizPassed
              ? "🎉 You passed! The next lesson is now unlocked."
              : "Finish and pass the quiz to unlock the next lesson."}
          </Text>
        </Container>
      );
    }

    // 📝 Default section
    return (
      <Container>
        <Text style={styles.sectionTitle}>{title}</Text>
        {content ? (
          <Text style={styles.sectionText}>{content}</Text>
        ) : null}
      </Container>
    );
  };

  return (
    <View style={styles.screen}>
      {/* 🔙 Back to lessons (مثل الويب بس بالموبايل) */}
      <TouchableOpacity
        style={styles.backToLessonsBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backToLessonsText}>⬅️ Back to Lessons</Text>
      </TouchableOpacity>

      {/* 📚 Lesson contents button (يفتح مودال) */}
      <View style={styles.contentsButtonWrapper}>
        <TouchableOpacity
          style={styles.contentsButton}
          onPress={() => setShowContents(true)}
        >
          <Text style={styles.contentsButtonText}>📚 Lesson Contents</Text>
        </TouchableOpacity>
      </View>

      {/* 📜 Contents Modal */}
      <Modal
        visible={showContents}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContents(false)}
      >
        <View style={styles.contentsOverlay}>
          <View style={styles.contentsModal}>
            <View style={styles.contentsHeader}>
              <Text style={styles.contentsTitle}>Sections</Text>
              <TouchableOpacity onPress={() => setShowContents(false)}>
                <Text style={styles.contentsClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {lesson.sections.map((sec, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.contentsItem,
                    i === currentIndex && styles.contentsItemActive,
                  ]}
                  onPress={() => {
                    setCurrentIndex(i);
                    setShowContents(false);
                  }}
                >
                  <Text
                    style={[
                      styles.contentsItemText,
                      i === currentIndex && styles.contentsItemTextActive,
                    ]}
                  >
                    {sec.title.replace(/^[^a-zA-Z]+/, "")}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 🔁 Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      {/* 🧾 Header (عنوان الدرس + الوصف) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <Text style={styles.headerDescription}>{lesson.description}</Text>
      </View>

      {/* 📚 محتوى السكشن الحالي */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {renderSectionMobile(section)}

        {/* أزرار Next / Back بين السكاشن (نفس منطق الويب) */}
        <View style={styles.navButtonsRow}>
          <TouchableOpacity
            onPress={back}
            disabled={currentIndex === 0}
            style={[
              styles.navBackButton,
              currentIndex === 0 && styles.navButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.navBackText,
                currentIndex === 0 && styles.navDisabledText,
              ]}
            >
              ⬅️ Back
            </Text>
          </TouchableOpacity>

          {currentIndex < totalSections - 1 && (
            <TouchableOpacity
              onPress={next}
              style={styles.navNextButton}
            >
              <Text style={styles.navNextText}>Next ➡️</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
  },
  loadingText: {
    marginTop: 8,
    color: "#5D4037",
  },

  // Progress bar
  progressBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 4,
    width: "100%",
    backgroundColor: "#E0E0E0",
    zIndex: 30,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#F5B700",
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: "#FFF3C4",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#5D4037",
    textAlign: "center",
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: "#6D4C41",
    textAlign: "center",
  },

  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Sections
  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFECB3",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#5D4037",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: "#5F4B43",
    lineHeight: 20,
    marginBottom: 10,
  },

  // Table styles
  tableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FFECB3",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderRow: {
    backgroundColor: "#FFF8E1",
  },
  tableRowEven: {
    backgroundColor: "#FFFFFF",
  },
  tableRowOdd: {
    backgroundColor: "#FFFDF0",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: "#FFECB3",
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4E342E",
    textAlign: "center",
  },
  tableCellText: {
    fontSize: 13,
    color: "#5F4B43",
    textAlign: "center",
  },

  // Quiz navigation
  quizNavRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  prevLessonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5CC",
    borderRadius: 999,
  },
  prevLessonText: {
    fontSize: 13,
    color: "#4E342E",
    fontWeight: "600",
  },
  nextLessonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5B700",
    borderRadius: 999,
  },
  nextLessonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  nextLessonText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  quizHintText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    color: "#757575",
    fontStyle: "italic",
  },

  // Bottom nav buttons (Back / Next between sections)
  navButtonsRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navBackButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5CC",
    borderRadius: 999,
  },
  navNextButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5B700",
    borderRadius: 999,
  },
  navButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  navBackText: {
    fontSize: 13,
    color: "#4E342E",
    fontWeight: "600",
  },
  navNextText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  navDisabledText: {
    color: "#9E9E9E",
  },

  // Back to Lessons button
  backToLessonsBtn: {
    position: "absolute",
    top: 44,
    right: 16,
    zIndex: 40,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#FFF9E5",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFECB3",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backToLessonsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5D4037",
  },

  // Contents button
  contentsButtonWrapper: {
    position: "absolute",
    top: 44,
    left: 16,
    zIndex: 40,
  },
  contentsButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#F5B700",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  contentsButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Contents modal
  contentsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentsModal: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  contentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  contentsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5D4037",
  },
  contentsClose: {
    fontSize: 18,
    color: "#888",
  },
  contentsItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  contentsItemActive: {
    backgroundColor: "#FFF5CC",
  },
  contentsItemText: {
    fontSize: 13,
    color: "#5F4B43",
  },
  contentsItemTextActive: {
    fontWeight: "700",
    color: "#5D4037",
  },
});
