// mobile/screens/LessonViewer13Mobile.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

// غيّري المسار حسب مكان الكمبوننت عندك
import Quiz from "../components/Quiz"; 
import BoxVisualizerMobile from "../components/BoxVisualizerMobile";

const API = "http://10.0.2.2:5000";

export default function LessonViewer13Mobile() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizPassed, setQuizPassed] = useState(false);
  const navigation = useNavigation();

  const [contentSections, setContentSections] = useState([]);
  const [quizBlock, setQuizBlock] = useState(null);

  // تحميل الدرس من الباكند
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/39`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const content = res.data.content;
        setLesson(content);

        // نفس منطق الويب للفصل بين السكاشن والكويز
        let qBlock = null;
        const sectionsWithoutQuiz = (content.sections || []).filter((sec) => {
          if (sec.quiz) {
            qBlock = { quiz: normalizeQuiz(sec.quiz) };
            return false;
          }
          return true;
        });

        if (!qBlock && content.quiz) {
          qBlock = { quiz: normalizeQuiz(content.quiz) };
        }

        setContentSections(sectionsWithoutQuiz);
        setQuizBlock(qBlock);
      } catch (e) {
        console.error("Failed to load Lesson 13", e);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={styles.loadingText}>Lesson Loading.</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* الهيدر العلوي */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>{"‹"}Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          HTML Layout & Containers — Live View
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========== HEADER =========== */}
        <LabeledContainer label="<header>">
          <View style={styles.headerBox}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
          </View>
        </LabeledContainer>

        {/* =========== MAIN + ASIDE =========== */}
        <View style={styles.mainAsideWrapper}>
          {/* MAIN */}
          <View style={styles.mainColumn}>
            <LabeledContainer label="<main>">
              <View style={styles.mainBox}>
                {contentSections.map((sec, i) => (
                  <View key={i}>
                    <SectionCard sec={sec} index={i} />
                  </View>
                ))}
              </View>
            </LabeledContainer>
          </View>

          {/* ASIDE ككرت تحته في الموبايل (بس منطقياً هو aside) */}
          <View style={styles.asideColumn}>
            <LabeledContainer label="<aside>">
              <AsidePanel lesson={lesson} />
            </LabeledContainer>
          </View>
        </View>

        {/* =========== FOOTER + QUIZ =========== */}
        <LabeledContainer label="<footer>">
          <View style={styles.footerBox}>
            <Text style={styles.footerTitle}>Quiz</Text>
            {!quizBlock ? (
              <Text style={styles.noQuizText}>No Quiz for this lesson</Text>
            ) : (
              <LessonQuiz
                quizBlock={quizBlock}
                quizPassed={quizPassed}
                setQuizPassed={setQuizPassed}
              />
            )}

            <View style={styles.footerButtonsRow}>
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={() => {
                  // عدلي اسم الشاشة حسب نظامك
                  navigation.navigate("LessonViewer12"); 
                }}
              >
                <Text style={styles.navButtonText}>Previous Lesson</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!quizPassed}
                style={[
                  styles.navButton,
                  quizPassed ? styles.nextEnabled : styles.nextDisabled,
                ]}
                onPress={() => {
                  if (quizPassed) {
                    // عدلي اسم الشاشة حسب نظامك
                    navigation.navigate("LessonViewer14"); 
                  }
                }}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    quizPassed ? { color: "#ffffff" } : { color: "#6b7280" },
                  ]}
                >
                  Next Lesson
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LabeledContainer>
      </ScrollView>
    </View>
  );
}

/* ================================
   normalizeQuiz – نفس منطق الويب
================================ */
function normalizeQuiz(raw) {
  const questions = Array.isArray(raw) ? raw : raw?.questions || [];
  return {
    questions: questions.map((q) => {
      if (typeof q.answer === "number") return q;
      const correctIndex = (q.options || []).findIndex(
        (opt) =>
          String(opt).trim().toLowerCase() ===
          String(q.answer).trim().toLowerCase()
      );
      return { ...q, answer: correctIndex !== -1 ? correctIndex : 0 };
    }),
  };
}

/* ================================
   LabeledContainer – إطار مع تاغ
================================ */
function LabeledContainer({ label, children }) {
  return (
    <View style={styles.labeledContainer}>
      <View style={styles.labelBadge}>
        <Text style={styles.labelBadgeText}>{label}</Text>
      </View>
      <View style={styles.labeledInner}>{children}</View>
    </View>
  );
}

/* ================================
   SectionCard – عرض سكشن واحد
================================ */
function SectionCard({ sec }) {
  const [showCodeIndex, setShowCodeIndex] = useState(null);

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{sec.title}</Text>

      {/* نص بسيط */}
      {typeof sec.content === "string" && (
        <Text style={styles.sectionText}>{sec.content}</Text>
      )}

      {/* مصفوفة عناصر */}
      {Array.isArray(sec.content) &&
        sec.content.map((item, i) => {
          // جدول
          if (item.type === "table") {
            return (
              <View key={i} style={styles.tableWrapper}>
                {/* عناوين الأعمدة */}
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  {item.columns.map((col, j) => (
                    <View key={j} style={styles.tableCell}>
                      <Text style={styles.tableHeaderText}>{col}</Text>
                    </View>
                  ))}
                </View>
                {/* الصفوف */}
                {item.rows.map((row, r) => (
                  <View
                    key={r}
                    style={[
                      styles.tableRow,
                      r % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                    ]}
                  >
                    {row.map((cell, c) => (
                      <View key={c} style={styles.tableCell}>
                        <Text style={styles.tableCellText}>{cell}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );
          }

          // code-demo
          if (item.type === "code-demo") {
            const isOpen = showCodeIndex === i;
            return (
              <View key={i} style={styles.codeDemoWrapper}>
                <TouchableOpacity
                  style={styles.codeDemoButton}
                  onPress={() => setShowCodeIndex(isOpen ? null : i)}
                >
                  <Text style={styles.codeDemoButtonText}>
                    {isOpen ? "Hide Example" : item.title || "show Example"}
                  </Text>
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.codeBox}>
                    <Text style={styles.codeText}>{item.code}</Text>
                  </View>
                )}
              </View>
            );
          }

          // ai-tool
          if (item.type === "ai-tool") {
            return (
              <View key={i} style={styles.aiToolInfo}>
                <Text style={styles.aiToolText}>
                Ai Tools 
                </Text>
              </View>
            );
          }

          // interactive → BoxVisualizer
          if (item.type === "interactive" && item.component === "BoxVisualizer") {
            return (
              <View key={i} style={styles.visualizerWrapper}>
                <BoxVisualizerMobile />
              </View>
            );
          }

          // نص عادي في مصفوفة
          if (typeof item === "string") {
            return (
              <Text key={i} style={styles.sectionText}>
                {item}
              </Text>
            );
          }

          return null;
        })}
    </View>
  );
}

/* ================================
   AsidePanel – TOC + AI Builder
================================ */
function AsidePanel({ lesson }) {
  // تكوين أداة AI من نفس الـ JSON إذا موجودة
  const aiConfig = useMemo(() => {
    for (const sec of lesson.sections || []) {
      if (Array.isArray(sec.content)) {
        for (const item of sec.content) {
          if (item?.type === "ai-tool") {
            return item;
          }
        }
      }
    }
    return {
      endpoint: "/api/ai-local/smart-layout-builder",
      placeholder:
        "Example: Create a page with a header, main section, sidebar on the right, and a footer.",
    };
  }, [lesson]);

  return (
    <View style={styles.asidePanel}>
      {/* TOC */}
      <View style={styles.tocBox}>
        <Text style={styles.tocTitle}>Sections</Text>
        {(lesson.sections || []).map((s, i) => (
          <View key={i} style={styles.tocItem}>
            <View style={styles.tocDot} />
            <Text style={styles.tocText}>{s.title}</Text>
          </View>
        ))}
      </View>

      {/* AI Smart Layout Builder */}
      <View style={styles.aiBox}>
        <Text style={styles.aiTitle}>Smart Layout Builder</Text>
        <AISmartBuilder
          endpoint={aiConfig.endpoint}
          placeholder={aiConfig.placeholder}
        />
      </View>
    </View>
  );
}

/* ================================
   Quiz Block
================================ */
function LessonQuiz({ quizBlock, quizPassed, setQuizPassed }) {
  const questions = quizBlock?.quiz?.questions || [];
  if (!questions.length) {
    return <Text style={styles.noQuizText}>لا يوجد أسئلة.</Text>;
  }

  return (
    <View style={styles.quizWrapper}>
      <Quiz
        lessonId={39}
        questions={questions}
        totalQuestions={questions.length}
        onPassed={() => setQuizPassed(true)}
      />
      <Text style={styles.quizHint}>
        {quizPassed
          ? "next lesson open succefully"
          : "complete the quiz to open the next lesson "}
      </Text>
    </View>
  );
}

/* ================================
   AI Smart Layout Builder
================================ */
function AISmartBuilder({ endpoint, placeholder }) {
  const [description, setDescription] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const buildLayout = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await axios.post(`${API}${endpoint}`, { description });
      setOutput(res.data.layout || "No response from AI.");
    } catch (err) {
      setOutput("Error connecting to AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        style={styles.aiInput}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline
        value={description}
        onChangeText={setDescription}
      />
      <TouchableOpacity style={styles.aiButton} onPress={buildLayout}>
        <Text style={styles.aiButtonText}>
          {loading ? "Building..." : "Build Layout"}
        </Text>
      </TouchableOpacity>

      {output ? (
        <View style={styles.aiOutputBox}>
          <Text style={styles.aiOutputTitle}>Generated Layout Code:</Text>
          <Text style={styles.aiOutputText}>{output}</Text>
        </View>
      ) : null}
    </View>
  );
}

/* ================================
   STYLES
================================ */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fffbeb", // خلفية أصفر فاتح
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: "#fef9c3",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#facc15",
    marginRight: 10,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78350f",
  },
  topBarTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#92400e",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fffbeb",
  },
  loadingText: {
    marginTop: 10,
    color: "#4b5563",
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 16,
    fontWeight: "600",
  },

  labeledContainer: {
    marginBottom: 16,
  },
  labelBadge: {
    position: "absolute",
    top: -10,
    left: 16,
    backgroundColor: "#fef3c7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#facc15",
    zIndex: 10,
  },
  labelBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400e",
  },
  labeledInner: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 12,
  },

  headerBox: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#fbbf24",
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 6,
  },
  lessonDescription: {
    fontSize: 14,
    color: "#111827",
  },

  mainAsideWrapper: {
    marginTop: 8,
  },
  mainColumn: {
    width: "100%",
  },
  asideColumn: {
    width: "100%",
    marginTop: 16,
  },

  mainBox: {
    paddingVertical: 4,
  },

  sectionCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginTop: 4,
  },

  tableWrapper: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#facc15",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderRow: {
    backgroundColor: "#fef3c7",
  },
  tableRowEven: {
    backgroundColor: "#fffbeb",
  },
  tableRowOdd: {
    backgroundColor: "#ffffff",
  },
  tableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#facc15",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400e",
  },
  tableCellText: {
    fontSize: 13,
    color: "#374151",
  },

  codeDemoWrapper: {
    marginTop: 10,
  },
  codeDemoButton: {
    backgroundColor: "#fbbf24",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  codeDemoButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  codeBox: {
    marginTop: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 10,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#111827",
  },

  aiToolInfo: {
    marginTop: 8,
  },
  aiToolText: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
  },

  visualizerWrapper: {
    marginTop: 12,
  },

  asidePanel: {
    gap: 12,
  },
  tocBox: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 12,
  },
  tocTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tocDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#facc15",
    marginRight: 8,
  },
  tocText: {
    fontSize: 13,
    color: "#374151",
  },

  aiBox: {
    borderRadius: 16,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 12,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  aiInput: {
    minHeight: 80,
    borderWidth: 1.5,
    borderColor: "#facc15",
    borderRadius: 10,
    padding: 8,
    fontSize: 13,
    color: "#111827",
    textAlignVertical: "top",
    backgroundColor: "#ffffff",
  },
  aiButton: {
    marginTop: 8,
    backgroundColor: "#fbbf24",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  aiOutputBox: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 8,
  },
  aiOutputTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 4,
  },
  aiOutputText: {
    fontSize: 13,
    color: "#374151",
  },

  footerBox: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fde68a",
    padding: 14,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  noQuizText: {
    fontSize: 14,
    color: "#6b7280",
  },
  quizWrapper: {
    marginTop: 4,
  },
  quizHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },

  footerButtonsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  prevButton: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  nextEnabled: {
    backgroundColor: "#fbbf24",
  },
  nextDisabled: {
    backgroundColor: "#e5e7eb",
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
});
