// File: pages/LessonViewer10Mobile.js
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

import Quiz from "../components/Quiz";
import RenderBlocksMobile from "../components/RenderBlocksMobile";
import MediaRendererMobile from "../components/MediaRendererMobile";
import TableRendererMobile from "../components/TableRendererMobile";
import ProgressBarMobile from "../components/ProgressBarMobile";

const API = "http://10.0.2.2:5000";

/* =========================================================
   🧠 AI Navbar Journey (نسخة مبسطة للموبايل داخل الملف)
========================================================= */
function AiNavbarJourneyInline({ apiBase }) {
  const [messages, setMessages] = useState([]);
  const [userChoice, setUserChoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSend = async () => {
    if (!userChoice.trim()) return;
    setLoading(true);
    try {
      setMessages((prev) => [...prev, { from: "user", text: userChoice }]);
      const res = await axios.post(`${apiBase}/api/ai-local/navbar-journey`, {
        step,
        userChoice,
      });
      const aiMsg = (res.data.message || "").trim();
      setMessages((prev) => [...prev, { from: "ai", text: aiMsg }]);
      setUserChoice("");
      setStep((s) => s + 1);
    } catch (err) {
      console.error("AI Journey Error:", err.message);
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ AI connection error. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.aiBox}>
      <Text style={styles.aiTitle}>🤖 Interactive Navbar Journey</Text>
      <Text style={styles.aiHint}>
        Start by typing a project idea like <Text style={styles.aiHintBold}>"Portfolio Website"</Text>.
      </Text>

      <View style={styles.aiMessagesBox}>
        {messages.length === 0 && (
          <Text style={styles.aiEmptyText}>
            Start the journey by sending your first answer...
          </Text>
        )}

        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              styles.aiBubble,
              m.from === "ai" ? styles.aiBubbleAI : styles.aiBubbleUser,
            ]}
          >
            <Text
              style={
                m.from === "ai" ? styles.aiBubbleTextAI : styles.aiBubbleTextUser
              }
            >
              {m.text}
            </Text>
          </View>
        ))}
        {loading && (
          <Text style={styles.aiThinking}>AI is thinking…</Text>
        )}
      </View>

      <View style={styles.aiInputRow}>
        <TextInput
          style={styles.aiInput}
          placeholder="Type your answer..."
          value={userChoice}
          onChangeText={setUserChoice}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading}
          style={[
            styles.aiSendButton,
            loading && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.aiSendText}>
            {loading ? "..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* =========================================================
   📘 LessonViewer10Mobile (Navbars)
========================================================= */
export default function LessonViewer10Mobile() {
  const navigation = useNavigation();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openIdx, setOpenIdx] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  const sectionsRefs = useRef({});

  // 🔸 تحميل الدرس 36 من الـ API
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/36`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load lesson 10", e.message);
        Alert.alert("Error", "Failed to load lesson 10 content.");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  // 🔹 جلب السكاشن بدون الكويز
  const contentSections = useMemo(() => {
    if (!lesson?.sections) return [];
    return lesson.sections.filter((s) => !s.quiz);
  }, [lesson]);

  // 🔹 جلب الكويز من القسم الأخير
  const quiz = useMemo(() => {
    if (!lesson?.sections) return [];
    const quizSection = lesson.sections.find((s) => s.quiz);
    if (!quizSection) return [];
    if (Array.isArray(quizSection.quiz)) return quizSection.quiz;
    if (Array.isArray(quizSection.quiz?.questions)) {
      return quizSection.quiz.questions;
    }
    return [];
  }, [lesson]);

  // 🔹 نسبة التقدم: حسب القسم المفتوح
  const progress = useMemo(() => {
    if (!contentSections.length) return 0;
    if (openIdx == null) return 0;
    const pct = ((openIdx + 1) / contentSections.length) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [openIdx, contentSections.length]);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#F5B700" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  const handleToggleSection = (idx) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  const scrollToSection = (idx) => {
    const key = `sec-${idx}`;
    const node = sectionsRefs.current[key];
    if (node && node.measure) {
      node.measure((fx, fy, width, height, px, py) => {
        // نستخدم ScrollView مع ref لو بدنا Scroll دقيق
        // الآن نعتمد أن اليوزر ينزل يدويًا، أو يمكنك تحسين لاحقًا
      });
    }
  };

  const goBackToLessons = () => {
    // لو عندك اسم شاشة الليست: LessonListScreen
    // navigation.navigate("LessonListScreen");
    navigation.goBack();
  };

  const handleQuizPassed = () => {
    setQuizPassed(true);
  };

  const handleGoPrevLesson = () => {
    // يرجع للدرس 9 موبايل
    navigation.navigate("LessonViewer9", {
      lessonId: 35,
    });
  };

  const handleGoNextLesson = () => {
    if (!quizPassed) return;
    navigation.navigate("LessonViewer11", {
      lessonId: 37,
    });
  };

  return (
    <View style={styles.screen}>
      {/* 🔝 Progress Bar */}
      <View style={styles.progressWrapper}>
        <ProgressBarMobile progress={progress} />
      </View>

      {/* الهيدر + كل المحتوى داخل ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== HERO ===== */}
        <View style={styles.heroCard}>
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{lesson.title}</Text>
            <Text style={styles.heroDescription}>
              {lesson.description}
            </Text>

            <View style={styles.heroButtonsRow}>
              <TouchableOpacity
                style={styles.heroPrimaryButton}
                onPress={() => handleToggleSection(0)}
              >
                <Text style={styles.heroPrimaryText}>Start Lesson</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heroSecondaryButton}
                onPress={goBackToLessons}
              >
                <Text style={styles.heroSecondaryText}>
                  ⬅ Back to Lessons
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ===== قائمة السكاشن (ميني توجيه) ===== */}
        <View style={styles.tocCard}>
          <Text style={styles.tocTitle}>Lesson Contents</Text>
          <View style={styles.tocDivider} />
          {contentSections.map((sec, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.tocItem}
              onPress={() => {
                handleToggleSection(idx);
                scrollToSection(idx);
              }}
            >
              <View style={styles.tocDot} />
              <Text style={styles.tocText}>{sec.title}</Text>
              {openIdx === idx && (
                <Text style={styles.tocActiveMark}>●</Text>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.tocItem}
            onPress={() => {
              // Scroll لأسفل الكويز (مبدئياً يخليه يكمّل للنهاية)
            }}
          >
            <View style={styles.tocDot} />
            <Text style={styles.tocText}>Navigation Bar Quiz</Text>
          </TouchableOpacity>
        </View>

        {/* ===== الأقسام ===== */}
        {contentSections.map((sec, idx) => {
          const isOpen = openIdx === idx;
          const key = `sec-${idx}`;

          // القسم الأول (intro) له تصميم مختلف قليلاً
          if (idx === 0) {
            return (
              <View
                key={key}
                ref={(el) => (sectionsRefs.current[key] = el)}
                style={styles.sectionIntroCard}
              >
                {/* Header / Accordion Toggle */}
                <TouchableOpacity
                  style={styles.sectionIntroHeader}
                  onPress={() => handleToggleSection(idx)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sectionIntroTitle}>
                      {sec.title}
                    </Text>
                    <View style={styles.sectionIntroLine} />
                  </View>
                  <Text
                    style={[
                      styles.chevron,
                      isOpen && styles.chevronOpen,
                    ]}
                  >
                    ▼
                  </Text>
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.sectionIntroBody}>
                    {/* نص المقدمة */}
                    {Array.isArray(sec.content) ? (
                      <Text style={styles.introText}>
                        {sec.content
                          .filter((b) => typeof b === "string")
                          .join("\n\n")}
                      </Text>
                    ) : typeof sec.content === "string" ? (
                      <Text style={styles.introText}>{sec.content}</Text>
                    ) : null}

                    {/* صورة / ميديا إن وجدت */}
                    {sec.media && (
                      <MediaRendererMobile src={sec.media} />
                    )}
                  </View>
                )}
              </View>
            );
          }

          // باقي الأقسام
          return (
            <View
              key={key}
              ref={(el) => (sectionsRefs.current[key] = el)}
              style={styles.sectionCard}
            >
              {/* Header */}
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => handleToggleSection(idx)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>{sec.title}</Text>
                  <View style={styles.sectionUnderline} />
                </View>
                <Text
                  style={[
                    styles.chevron,
                    isOpen && styles.chevronOpen,
                  ]}
                >
                  ▼
                </Text>
              </TouchableOpacity>

              {/* Body */}
              {isOpen && (
                <View style={styles.sectionBody}>
                  {/* محتوى Rich (blocks) */}
                  {Array.isArray(sec.content) ? (
                    <RenderBlocksMobile
                      blocks={sec.content}
                      secTitle={sec.title}
                    />
                  ) : typeof sec.content === "string" ? (
                    <RenderBlocksMobile
                      blocks={[sec.content]}
                      secTitle={sec.title}
                    />
                  ) : null}

                  {/* جدول إن وجد */}
                  {sec.table && (
                    <View style={{ marginTop: 12 }}>
                      <TableRendererMobile table={sec.table} />
                    </View>
                  )}

                  {/* ميديا إن وجدت */}
                  {sec.media && (
                    <View style={{ marginTop: 12 }}>
                      <MediaRendererMobile src={sec.media} />
                    </View>
                  )}

                  {/* AI Journey داخل القسم المناسب */}
                  {sec.title?.toLowerCase().includes("ai") && (
                    <View style={{ marginTop: 16 }}>
                      <AiNavbarJourneyInline apiBase={API} />
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* ===== QUIZ SECTION ===== */}
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>Navigation Bar Quiz</Text>
          <View style={styles.quizUnderline} />

          {quiz.length > 0 ? (
            <Quiz
              lessonId={36}
              questions={quiz}
              totalQuestions={quiz.length}
              onPassed={handleQuizPassed}
              onFailed={() => {
                setQuizPassed(false);
              }}
            />
          ) : (
            <Text style={styles.quizEmpty}>
              ⚠ No quiz found for this lesson.
            </Text>
          )}

          {quiz.length > 0 && (
            <>
              <View style={styles.quizNavRow}>
                <TouchableOpacity
                  style={styles.prevLessonButton}
                  onPress={handleGoPrevLesson}
                >
                  <Text style={styles.prevLessonText}>
                    ⬅ Previous Lesson
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.nextLessonButton,
                    !quizPassed && styles.nextLessonButtonDisabled,
                  ]}
                  disabled={!quizPassed}
                  onPress={handleGoNextLesson}
                >
                  <Text style={styles.nextLessonText}>
                    Next Lesson ➡
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.quizHint}>
                {quizPassed
                  ? "🎉 Great job! You passed the quiz and unlocked the next lesson."
                  : "Complete and pass the quiz to unlock the next lesson."}
              </Text>
            </>
          )}
        </View>

        {/* مساحة بسيطة في الأسفل */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

/* =========================================================
   🎨 Styles
========================================================= */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFDF2",
  },
  progressWrapper: {
    width: "100%",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  /* Loading */
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFDF2",
  },
  loadingText: {
    marginTop: 8,
    color: "#8D6E63",
  },
  errorText: {
    color: "#D32F2F",
    fontWeight: "600",
  },

  /* HERO */
  heroCard: {
    marginBottom: 18,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },
  heroGradient: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFECB3",
    opacity: 0.7,
  },
  heroContent: {
    padding: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4E342E",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: "#6D4C41",
  },
  heroButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  heroPrimaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F5B700",
  },
  heroPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  heroSecondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: "#F5D47A",
  },
  heroSecondaryText: {
    color: "#5D4037",
    fontWeight: "600",
    fontSize: 12,
  },

  /* TOC */
  tocCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F2DF9A",
    marginBottom: 16,
  },
  tocTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5D4037",
  },
  tocDivider: {
    height: 1,
    backgroundColor: "#F3E5AB",
    marginVertical: 8,
  },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  tocDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F5B700",
    marginRight: 8,
  },
  tocText: {
    flex: 1,
    fontSize: 13,
    color: "#6D4C41",
  },
  tocActiveMark: {
    fontSize: 10,
    color: "#F5B700",
    marginLeft: 4,
  },

  /* Section Intro */
  sectionIntroCard: {
    backgroundColor: "#FFFDF8",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F7E3A5",
    marginBottom: 14,
    overflow: "hidden",
  },
  sectionIntroHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionIntroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4E342E",
  },
  sectionIntroLine: {
    marginTop: 6,
    height: 3,
    width: 50,
    borderRadius: 999,
    backgroundColor: "#F5B700",
  },
  sectionIntroBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5F4B43",
    marginTop: 6,
  },

  /* Generic Sections */
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F2DF9A",
    marginBottom: 14,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4E342E",
  },
  sectionUnderline: {
    marginTop: 4,
    height: 2,
    width: 40,
    borderRadius: 999,
    backgroundColor: "#F5B700",
  },
  chevron: {
    marginLeft: 8,
    fontSize: 16,
    color: "#A1887F",
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 2,
  },

  /* AI Journey */
  aiBox: {
    backgroundColor: "#FFF9E5",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0D487",
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5D4037",
    marginBottom: 4,
  },
  aiHint: {
    fontSize: 12,
    color: "#6D4C41",
    marginBottom: 8,
  },
  aiHintBold: {
    fontWeight: "700",
    color: "#F57C00",
  },
  aiMessagesBox: {
    maxHeight: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F5E1A0",
    backgroundColor: "#FFFEF7",
    padding: 8,
    marginBottom: 8,
  },
  aiEmptyText: {
    fontSize: 12,
    color: "#B0A27A",
  },
  aiBubble: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
    maxWidth: "85%",
  },
  aiBubbleAI: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#F3D98F",
  },
  aiBubbleUser: {
    backgroundColor: "#F5B700",
    alignSelf: "flex-end",
  },
  aiBubbleTextAI: {
    fontSize: 12,
    color: "#5F4B43",
  },
  aiBubbleTextUser: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  aiThinking: {
    fontSize: 11,
    color: "#B0A27A",
    fontStyle: "italic",
  },
  aiInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#F2DB96",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 13,
    backgroundColor: "#FFFFFF",
  },
  aiSendButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F5B700",
  },
  aiSendText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  /* Quiz */
  quizCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F2DF9A",
    padding: 16,
    marginTop: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4E342E",
    marginBottom: 4,
  },
  quizUnderline: {
    height: 2,
    width: 48,
    borderRadius: 999,
    backgroundColor: "#F5B700",
    marginBottom: 10,
  },
  quizEmpty: {
    fontSize: 13,
    color: "#8D6E63",
  },
  quizNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  prevLessonButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EEEEEE",
  },
  prevLessonText: {
    fontSize: 13,
    color: "#424242",
    fontWeight: "600",
  },
  nextLessonButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F5B700",
  },
  nextLessonButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  nextLessonText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  quizHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#8D6E63",
    fontStyle: "italic",
  },
});
