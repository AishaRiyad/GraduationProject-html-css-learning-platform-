// File: pages/LessonViewer12Mobile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import QuizMobile from "../components/Quiz";

const { height } = Dimensions.get("window");

export default function LessonViewer12({ navigation }) {
  const [lesson, setLesson] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const API = "http://10.0.2.2:5000";

  // 🟡 تحميل بيانات الدرس
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/38`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error(
          "❌ Failed to load Lesson 12 (mobile)",
          e?.response?.data || e.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f5b700" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: "red" }]}>
          Lesson not found
        </Text>
      </View>
    );
  }

  // ✅ كل الأقسام + كرت الكويز
  const slides = [...lesson.sections, { quiz: lesson.quiz }];

  const nextSlide = () => {
    setCurrentIndex((i) => (i + 1 < slides.length ? i + 1 : i));
  };

  const prevSlide = () => {
    setCurrentIndex((i) => (i - 1 >= 0 ? i - 1 : i));
  };

  return (
    <View style={styles.screen}>
      {/* شريط علوي: رجوع + أقسام */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation && navigation.goBack && navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backIcon}>◀</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {lesson.sections.map((section, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentIndex(i)}
              style={[
                styles.chip,
                currentIndex === i && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  currentIndex === i && styles.chipTextActive,
                ]}
                numberOfLines={1}
              >
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}

          {/* زر الكويز */}
          <TouchableOpacity
            onPress={() => setCurrentIndex(lesson.sections.length)}
            style={[
              styles.chip,
              currentIndex === lesson.sections.length && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                currentIndex === lesson.sections.length && styles.chipTextActive,
              ]}
            >
              🧩 Quiz
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* عنوان الدرس + الوصف */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {"</>"} {lesson.title}
        </Text>
        <Text style={styles.subtitle}>{lesson.description}</Text>
      </View>

      {/* الأسهم الجانبية */}
      <TouchableOpacity
        onPress={prevSlide}
        disabled={currentIndex === 0}
        style={[
          styles.arrowBtn,
          styles.arrowLeft,
          currentIndex === 0 && styles.arrowDisabled,
        ]}
      >
        <Text style={styles.arrowText}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={nextSlide}
        disabled={currentIndex === slides.length - 1}
        style={[
          styles.arrowBtn,
          styles.arrowRight,
          currentIndex === slides.length - 1 && styles.arrowDisabled,
        ]}
      >
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>

      {/* كرت المحتوى الرئيسي */}
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {renderSlideMobile(slides[currentIndex], setQuizPassed, quizPassed)}
          </ScrollView>
        </View>
      </View>

      {/* نقاط التقدم */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

// 🔹 عرض كل سلايد (قسم أو كويز)
function renderSlideMobile(sec, setQuizPassed, quizPassed) {
  // كرت الكويز
  if (sec.quiz) {
    const processedQuestions = sec.quiz.questions.map((q) => {
      if (typeof q.answer === "number") return q;
      const correctIndex = q.options.findIndex(
        (opt) => opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
      );
      return { ...q, answer: correctIndex !== -1 ? correctIndex : 0 };
    });

    return (
      <View style={styles.quizContainer}>
        <Text style={styles.quizTitle}>🧩 Quick Quiz</Text>

        <QuizMobile
          lessonId={38}
          questions={processedQuestions}
          totalQuestions={processedQuestions.length}
          onPassed={() => setQuizPassed(true)}
        />

        <Text style={styles.quizHint}>
          {quizPassed
            ? "🎉 Great job! You passed the quiz and unlocked the next lesson."
            : "Complete the quiz to unlock the next lesson."}
        </Text>

        {/* أزرار الانتقال بين الدروس (فقط UI – اربطيها بالـ navigation لو حبيتي) */}
        <View style={styles.quizNavRow}>
          <TouchableOpacity
            onPress={() => {
              // بالويب: /lesson-viewer/37
              // هنا ممكن تعملي navigation.navigate(...) حسب النظام عندك
            }}
            style={[styles.navBtn, styles.navBtnSecondary]}
          >
            <Text style={styles.navBtnTextSecondary}>⬅ Previous Lesson</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!quizPassed}
            onPress={() => {
              // بالويب: /lesson-viewer/39
              // نفس الفكرة: اربطيه بالروت المناسب عندك
            }}
            style={[
              styles.navBtn,
              quizPassed ? styles.navBtnPrimary : styles.navBtnDisabled,
            ]}
          >
            <Text
              style={[
                styles.navBtnTextPrimary,
                !quizPassed && styles.navBtnTextDisabled,
              ]}
            >
              Next Lesson ➡
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // الأقسام العادية
  return <InteractiveLessonCardMobile sec={sec} />;
}

// 🎨 كرت القسم التفاعلي
function InteractiveLessonCardMobile({ sec }) {
  const [showCode, setShowCode] = useState(false);

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{sec.title}</Text>

      {Array.isArray(sec.content)
        ? sec.content.map((item, i) => {
            if (typeof item === "string") {
              return (
                <Text key={i} style={styles.sectionText}>
                  {item}
                </Text>
              );
            }

            // code-demo
            if (item.type === "code-demo") {
              return (
                <View key={i} style={styles.codeDemoWrapper}>
                  <TouchableOpacity
                    onPress={() => setShowCode((prev) => !prev)}
                    style={styles.toggleCodeBtn}
                  >
                    <Text style={styles.toggleCodeText}>
                      {showCode ? "Hide Example" : "Show Example"}
                    </Text>
                  </TouchableOpacity>

                  {showCode && (
                    <View style={styles.codeBlock}>
                      <Text style={styles.codeText}>{item.code}</Text>
                      {item.note ? (
                        <Text style={styles.codeNote}>💡 {item.note}</Text>
                      ) : null}
                    </View>
                  )}
                </View>
              );
            }

            // جدول
            if (item.type === "table") {
              return (
                <View key={i} style={styles.tableWrapper}>
                  <View style={styles.tableHeaderRow}>
                    {item.headers.map((h, hi) => (
                      <View key={hi} style={styles.tableHeaderCell}>
                        <Text style={styles.tableHeaderText}>{h}</Text>
                      </View>
                    ))}
                  </View>

                  {item.rows.map((row, ri) => (
                    <View
                      key={ri}
                      style={[
                        styles.tableRow,
                        ri % 2 === 0 && styles.tableRowAlt,
                      ]}
                    >
                      {row.map((cell, ci) => {
                        const cellStr =
                          typeof cell === "string" ? cell.trim() : String(cell);
                        const isMeta = cellStr.startsWith("<meta");

                        return (
                          <View key={ci} style={styles.tableCell}>
                            {isMeta ? (
                              <View style={styles.metaBox}>
                                <Text style={styles.metaText}>{cellStr}</Text>
                              </View>
                            ) : (
                              <Text style={styles.tableCellText}>
                                {cellStr}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              );
            }

            return null;
          })
        : typeof sec.content === "string" && (
            <Text style={styles.sectionText}>{sec.content}</Text>
          )}

      {/* AI Meta Generator */}
      {sec.ai_feature ? (
        <View style={{ marginTop: 16 }}>
          <AIMetaGeneratorMobile />
        </View>
      ) : null}
    </View>
  );
}

// 🤖 AI Meta Tag Generator للموبايل
function AIMetaGeneratorMobile() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const API = "http://10.0.2.2:5000";

  const generateMeta = async () => {
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await axios.post(`${API}/api/ai-local/meta-generator`, {
        title,
        description,
      });
      setResult(res.data.code || "No response received.");
    } catch (err) {
      console.error(
        "AI meta-generator error (mobile)",
        err?.response?.data || err.message
      );
      setResult("⚠️ Error: Could not connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.aiBox}>
      <Text style={styles.aiTitle}>🤖 AI Meta Tag Generator</Text>
      <Text style={styles.aiSubtitle}>
        Type your page title and description, and let AI generate meta tags for
        you.
      </Text>

      <TextInput
        placeholder="Enter page title..."
        value={title}
        onChangeText={setTitle}
        style={styles.aiInput}
      />
      <TextInput
        placeholder="Enter page description..."
        value={description}
        onChangeText={setDescription}
        style={[styles.aiInput, { height: 80, textAlignVertical: "top" }]}
        multiline
      />

      <TouchableOpacity
        onPress={generateMeta}
        disabled={loading}
        style={[styles.aiButton, loading && { opacity: 0.6 }]}
      >
        <Text style={styles.aiButtonText}>
          {loading ? "Generating..." : "Generate Meta Tags 🚀"}
        </Text>
      </TouchableOpacity>

      {result ? (
        <View style={styles.aiResultBox}>
          <Text style={styles.aiResultText}>{result}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF7E1",
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF7E1",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFE8A3",
    marginRight: 8,
  },
  backIcon: {
    fontSize: 14,
    marginRight: 4,
    color: "#8C5A00",
  },
  backText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8C5A00",
  },
  chipsRow: {
    paddingHorizontal: 4,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFEFC2",
    marginHorizontal: 3,
  },
  chipActive: {
    backgroundColor: "#F5B700",
  },
  chipText: {
    fontSize: 12,
    color: "#8C5A00",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#C67C00",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#5C4A3F",
    textAlign: "center",
  },
  arrowBtn: {
    position: "absolute",
    top: height * 0.45,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5B700",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  arrowLeft: {
    left: 10,
  },
  arrowRight: {
    right: 10,
  },
  arrowDisabled: {
    opacity: 0.35,
  },
  arrowText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  cardWrapper: {
    flex: 1,
    marginTop: 8,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "#FFFDF7",
    borderWidth: 1,
    borderColor: "#F6D68A",
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F2D9A0",
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: "#F5B700",
    transform: [{ scale: 1.2 }],
  },
  quizContainer: {
    flex: 1,
    alignItems: "center",
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#C67C00",
    marginBottom: 8,
    textAlign: "center",
  },
  quizHint: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B5B4A",
    textAlign: "center",
  },
  quizNavRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 6,
  },
  navBtnSecondary: {
    backgroundColor: "#FFE8B4",
  },
  navBtnPrimary: {
    backgroundColor: "#F5B700",
  },
  navBtnDisabled: {
    backgroundColor: "#D3D3D3",
  },
  navBtnTextSecondary: {
    fontSize: 13,
    color: "#8C5A00",
    fontWeight: "600",
  },
  navBtnTextPrimary: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "700",
  },
  navBtnTextDisabled: {
    color: "#eee",
  },
  sectionCard: {
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#C67C00",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: "#4E4338",
    lineHeight: 22,
    marginBottom: 6,
  },
  codeDemoWrapper: {
    marginTop: 10,
  },
  toggleCodeBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#F5B700",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  toggleCodeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  codeBlock: {
    marginTop: 8,
    backgroundColor: "#2D2D2D",
    borderRadius: 12,
    padding: 10,
  },
  codeText: {
    color: "#F8F8F2",
    fontFamily: "monospace",
    fontSize: 13,
  },
  codeNote: {
    marginTop: 6,
    fontSize: 12,
    color: "#FFE08A",
  },
  tableWrapper: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F0C878",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#FFE8B4",
  },
  tableHeaderCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8C5A00",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#FFFDF7",
  },
  tableRowAlt: {
    backgroundColor: "#FFF6E3",
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tableCellText: {
    fontSize: 13,
    color: "#4E4338",
  },
  metaBox: {
    backgroundColor: "#F4F1E6",
    borderRadius: 8,
    padding: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#5C4A3F",
    fontFamily: "monospace",
  },
  aiBox: {
    marginTop: 4,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFDF5",
    borderWidth: 1,
    borderColor: "#F0C878",
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C67C00",
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 13,
    color: "#6B5B4A",
    marginBottom: 8,
  },
  aiInput: {
    borderWidth: 1,
    borderColor: "#F0C878",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
    backgroundColor: "#FFF",
  },
  aiButton: {
    alignSelf: "flex-start",
    backgroundColor: "#F5B700",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  aiResultBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFF6E3",
    borderWidth: 1,
    borderColor: "#F0C878",
  },
  aiResultText: {
    fontSize: 12,
    color: "#4E4338",
    fontFamily: "monospace",
  },
});

