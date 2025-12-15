import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

// ✅ نفس كمبوننت الكويز لكن نسخة موبايل
import Quiz from "../components/Quiz";

// ✅ الكمبوننتس التفاعلية للموبايل (رح أبعتهم في رسائل منفصلة)
import MediaQueryDemoMobile from "../components/MediaQueryDemoMobile";
import PracticalExampleDemoMobile from "../components/PracticalExampleDemoMobile";
import CompareDevicesDemoMobile from "../components/CompareDevicesDemoMobile";
import LiveCodeBoxMobile from "../components/LiveCodeBoxMobile";
import FlexPlaygroundMobile from "../components/FlexPlaygroundMobile";
import FloatingHTMLAssistantMobile from "../components/FloatingHTMLAssistantMobile";

const API = "http://10.0.2.2:5000";

export default function LessonViewer8() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/34`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load lesson 8", e);
        Alert.alert("Error", "Failed to load lesson 8");
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
        <Text style={styles.errorText}>Lesson not found</Text>
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

  // ============================
  // 🧱 نفس منطق renderSection في الويب
  // ============================
  const renderSection = (sectionObj) => {
    const { heading, content } = sectionObj;

    // 🖼 Responsive Images
    if (heading.includes("Responsive Images")) {
      return (
        <View style={styles.cardResponsive}>
          <Text style={styles.cardTitle}>{heading}</Text>
          <Text style={styles.cardText}>
            Images should scale automatically to fit their containers. Use CSS
            properties like <Text style={styles.codeText}>width: 100%</Text> or{" "}
            <Text style={styles.codeText}>max-width: 100%</Text>.
          </Text>

          <LiveCodeBoxMobile
            initialCode={`<img src="/mountain.jpg" style="max-width: 100%; height: auto;">`}
          />
        </View>
      );
    }

    // 💧 Fluid Layouts
    if (heading.includes("Fluid Layouts")) {
      return (
        <View style={styles.cardFluid}>
          <Text style={styles.cardTitle}>{heading}</Text>
          <Text style={styles.cardText}>
            Fluid layouts use flexible widths that adapt to screen size. Try
            dragging the boxes below vertically or horizontally.
          </Text>

          <FlexPlaygroundMobile />
        </View>
      );
    }

    // 🌐 Viewport
    if (heading.includes("viewport")) {
      return (
        <View style={styles.cardBig}>
          <Text style={styles.cardTitle}>{heading}</Text>

          {content &&
            content.split("\n").map((line, i) => (
              <Text key={i} style={styles.cardText}>
                {line.trim()}
              </Text>
            ))}

          <View style={styles.metaBox}>
            <Text style={styles.metaText}>
              &lt;meta name="viewport" content="width=device-width,
              initial-scale=1.0"&gt;
            </Text>
          </View>

          <Text style={styles.tipText}>
            💡 Tip: Always include this line inside the{" "}
            <Text style={styles.codeText}>&lt;head&gt;</Text> section of your
            HTML document to make your design responsive.
          </Text>
        </View>
      );
    }

    // 📏 Media Queries
    if (heading.includes("Media Queries")) {
      return (
        <View style={styles.cardBig}>
          <Text style={styles.cardTitle}>{heading}</Text>

          {content &&
            content.split("\n").map((line, i) => (
              <Text key={i} style={styles.cardText}>
                {line.trim()}
              </Text>
            ))}

          <MediaQueryDemoMobile />

          <Text style={styles.tipText}>
            💡 As you slide below 600px, the box background turns light blue —
            showing how <Text style={styles.codeText}>@media</Text> rules adapt
            your design for small screens.
          </Text>
        </View>
      );
    }

    // 🧱 Practical Example
    if (heading.includes("Practical Example")) {
      return (
        <PracticalExampleDemoMobile description={content} />
      );
    }

    // 💻 Compare Design
    if (heading.includes("Compare Design")) {
      return (
        <CompareDevicesDemoMobile currentIndex={currentIndex} />
      );
    }

    // 📝 Quiz section
    if (heading.includes("Quiz")) {
      const quiz = sectionObj.quiz;

      const processedQuestions =
        quiz && quiz.questions
          ? quiz.questions.map((q) => {
              const answerIndex = q.options.findIndex(
                (opt) =>
                  opt.trim().toLowerCase() ===
                  q.answer.trim().toLowerCase()
              );
              return { ...q, answer: answerIndex !== -1 ? answerIndex : 0 };
            })
          : [];

      return (
        <View style={styles.cardBig}>
          <Text style={styles.cardTitle}>{heading}</Text>

          {processedQuestions.length > 0 ? (
            <Quiz
              lessonId={34}
              questions={processedQuestions}
              totalQuestions={processedQuestions.length}
              onPassed={() => setQuizPassed(true)}
            />
          ) : (
            <Text style={styles.noQuizText}>
              ⚠️ No quiz questions found.
            </Text>
          )}

          {/* أزرار بعد الكويز */}
          <View style={styles.quizButtonsRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("LessonViewer7", {
                  lessonId: 33,
                })
              }
              style={styles.prevLessonButton}
            >
              <Text style={styles.prevLessonText}>
                ⬅️ Previous Lesson
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!quizPassed}
              onPress={() => {
                if (quizPassed) {
                  navigation.navigate("LessonViewer9", {
                    lessonId: 35,
                  });
                }
              }}
              style={[
                styles.nextLessonButton,
                !quizPassed && styles.nextLessonDisabled,
              ]}
            >
              <Text style={styles.nextLessonText}>
                Next Lesson ➡️
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.quizHintText}>
            {quizPassed
              ? "🎉 You passed! The next lesson is now unlocked."
              : "Finish and pass the quiz to unlock the next lesson."}
          </Text>
        </View>
      );
    }

    // باقي الأقسام العادية
    return (
      <View style={styles.cardNormal}>
        <Text style={styles.cardTitle}>{heading}</Text>
        {content &&
          content.split("\n").map((line, i) => (
            <Text key={i} style={styles.cardText}>
              {line.trim()}
            </Text>
          ))}
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* 📊 Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[styles.progressBarFill, { width: `${progress}%` }]}
        />
      </View>

      {/* ⬅️ زر الرجوع للّيسنز */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>⬅️ Back to Lessons</Text>
      </TouchableOpacity>

      {/* العنوان والوصف */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <Text style={styles.headerDescription}>
          {lesson.description}
        </Text>
      </View>

      {/* المحتوى */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* قائمة السكاشن (Navigator) */}
        <View style={styles.sectionsNavigator}>
          {lesson.sections.map((sec, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentIndex(index)}
              style={[
                styles.sectionNavButton,
                currentIndex === index && styles.sectionNavButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.sectionNavText,
                  currentIndex === index && styles.sectionNavTextActive,
                ]}
              >
                {(sec.heading || "").replace(/^[^a-zA-Z]+/, "")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* عرض السيكشن الحالي */}
        <View style={styles.sectionContainer}>
          {renderSection(section)}

          {/* أزرار التالي / السابق داخل السيكشن (مثل الويب) */}
          <View style={styles.navRow}>
            <TouchableOpacity
              onPress={back}
              disabled={currentIndex === 0}
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentIndex === 0 && styles.navButtonTextDisabled,
                ]}
              >
                ⬅️ Back
              </Text>
            </TouchableOpacity>

            {currentIndex < totalSections - 1 && (
              <TouchableOpacity
                onPress={next}
                style={[styles.navButton, styles.navButtonNext]}
              >
                <Text style={styles.navButtonTextNext}>Next ➡️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 💬 المساعد العائم للموبايل */}
      <FloatingHTMLAssistantMobile />
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
    color: "#8D6E63",
  },
  errorText: {
    color: "#D32F2F",
    fontWeight: "600",
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "#E0E0E0",
    width: "100%",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: "#F5B700",
  },
  backButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "rgba(255,249,230,0.9)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    elevation: 2,
  },
  backButtonText: {
    color: "#5D4037",
    fontWeight: "600",
    fontSize: 13,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "#FFF3C4",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#5D4037",
    marginBottom: 8,
    textAlign: "center",
  },
  headerDescription: {
    fontSize: 14,
    color: "#6D4C41",
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  sectionsNavigator: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  sectionNavButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFF9E5",
    margin: 4,
  },
  sectionNavButtonActive: {
    backgroundColor: "#F5B700",
  },
  sectionNavText: {
    fontSize: 12,
    color: "#5D4037",
  },
  sectionNavTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionContainer: {
    backgroundColor: "#FFFDF5",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },

  // Cards
  cardResponsive: {
    backgroundColor: "#FFFDF5",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  cardFluid: {
    backgroundColor: "#FFF8DC",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  cardBig: {
    backgroundColor: "#FFFDF5",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  cardNormal: {
    backgroundColor: "#FFFDF5",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4E342E",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: "#4E342E",
    marginBottom: 6,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#1A237E",
  },
  metaBox: {
    marginTop: 10,
    backgroundColor: "#FFFBEA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFECB3",
    padding: 8,
  },
  metaText: {
    fontSize: 13,
    color: "#4E342E",
    fontFamily: "monospace",
  },
  tipText: {
    marginTop: 10,
    fontSize: 13,
    color: "#5F4B43",
    fontStyle: "italic",
  },

  // Quiz
  noQuizText: {
    marginTop: 8,
    fontSize: 13,
    color: "#757575",
  },
  quizButtonsRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  prevLessonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5CC",
    borderRadius: 20,
  },
  prevLessonText: {
    color: "#4E342E",
    fontWeight: "600",
    fontSize: 13,
  },
  nextLessonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5B700",
    borderRadius: 20,
  },
  nextLessonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  nextLessonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  quizHintText: {
    marginTop: 8,
    fontSize: 12,
    color: "#757575",
    fontStyle: "italic",
    textAlign: "center",
  },

  // Navigation buttons inside section
  navRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF5CC",
  },
  navButtonNext: {
    backgroundColor: "#F5B700",
  },
  navButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  navButtonText: {
    fontSize: 13,
    color: "#4E342E",
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "#9E9E9E",
  },
  navButtonTextNext: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
