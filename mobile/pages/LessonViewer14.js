// mobile/screens/LessonViewer14Mobile.js
// ملاحظة: لو بدك تدعمي الـ HTML (strong, em, br) استخدمي مكتبة react-native-render-html
// npm install react-native-render-html

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
// لو عندك كومبوننت Quiz في مكان مختلف، عدلي هذا المسار
import Quiz from "../components/Quiz";
// لو حبيتي تدعمي HTML حقيقي من السيرفر، فعّلي هذا الاستيراد
// import RenderHTML from "react-native-render-html";

const API = "http://10.0.2.2:5000";

export default function LessonViewer14Mobile() {
  const [lesson, setLesson] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizPassed, setQuizPassed] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // لتخزين مواقع السكاشن للـ scroll
  const scrollRef = useRef(null);
  const sectionPositionsRef = useRef({});

  const navigation = useNavigation();

  // تحميل الدرس من الباكند
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/40`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load Lesson 14", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  // استخراج تعريف أداة الـ AI من السكاشن
  const aiTool = useMemo(() => {
    if (!lesson || !lesson.sections) return null;
    for (const sec of lesson.sections) {
      if (Array.isArray(sec.content)) {
        for (const block of sec.content) {
          if (block?.type === "ai-tool") return block;
        }
      }
    }
    return null;
  }, [lesson]);

  const handleSectionLayout = (index, y) => {
    sectionPositionsRef.current[index] = y;
  };

  const scrollToSection = (index) => {
    const y = sectionPositionsRef.current[index];
    if (scrollRef.current && typeof y === "number") {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
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
      {/* Header أعلى الصفحة */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle} numberOfLines={1}>
          Lesson 14 — Accessibility
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* عنوان الدرس والوصف */}
        <View style={styles.lessonHeaderCard}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>
        </View>

        {/* الأقسام */}
        <View style={styles.sectionsWrapper}>
          {lesson.sections.map((sec, i) => (
            <View
              key={i}
              onLayout={(e) =>
                handleSectionLayout(i, e.nativeEvent.layout.y + e.nativeEvent.layout.height / 4)
              }
              style={styles.sectionCard}
            >
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() =>
                  setExpandedSection(expandedSection === i ? null : i)
                }
              >
                <Text style={styles.sectionHeaderTitle}>{sec.title}</Text>
                <Text style={styles.sectionHeaderIcon}>
                  {expandedSection === i ? "−" : "+"}
                </Text>
              </TouchableOpacity>

              {expandedSection === i && (
                <View style={styles.sectionContent}>
                  {sec.content.map((block, j) => {
                    // بلوك نصي بسيط (string)
                    if (typeof block === "string") {
                      return (
                        <Text key={j} style={styles.sectionText}>
                          {block}
                        </Text>
                      );

                      // لو حابة تدعمي HTML فعلي من السيرفر استبدلي اللي فوق بـ:
                      /*
                      return (
                        <RenderHTML
                          key={j}
                          contentWidth={Dimensions.get("window").width - 64}
                          source={{ html: `<p>${block}</p>` }}
                          baseStyle={styles.sectionText}
                        />
                      );
                      */
                    }

                    // list
                    if (block.type === "list") {
                      return (
                        <View key={j} style={styles.listWrapper}>
                          {block.items.map((item, k) => (
                            <View key={k} style={styles.listItemRow}>
                              <Text style={styles.bullet}>•</Text>
                              <Text style={styles.listItemText}>{item}</Text>

                              {/* لو عندك HTML داخل item:
                              <RenderHTML
                                contentWidth={Dimensions.get("window").width - 100}
                                source={{ html: `<span>${item}</span>` }}
                                baseStyle={styles.listItemText}
                              />
                              */}
                            </View>
                          ))}
                        </View>
                      );
                    }

                    // code-demo
                    if (block.type === "code-demo") {
                      return (
                        <View key={j} style={styles.codeDemoBox}>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={true}
                          >
                            <Text style={styles.codeText}>{block.code}</Text>
                          </ScrollView>
                          {block.note && (
                            <Text style={styles.codeNote}>
                              💡 {block.note}
                            </Text>
                          )}
                        </View>
                      );
                    }

                    // ai-tool
                    if (block.type === "ai-tool") {
                      return (
                        <View key={j} style={styles.aiToolBox}>
                          <Text style={styles.aiToolDescription}>
                            🤖 {block.description}
                          </Text>
                          <TouchableOpacity
                            style={styles.aiToolButton}
                            onPress={() => setShowChat(true)}
                          >
                            <Text style={styles.aiToolButtonText}>
                              💬 Open {block.name}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    }

                    return null;
                  })}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* الكويز */}
        <View style={styles.quizCard}>
          <Text style={styles.quizTitle}>🧠 Quiz Time</Text>
          {lesson.quiz && lesson.quiz.quiz ? (
            <LessonQuiz
              quizBlock={{ quiz: normalizeQuiz(lesson.quiz.quiz) }}
              quizPassed={quizPassed}
              setQuizPassed={setQuizPassed}
            />
          ) : (
            <Text style={styles.noQuizText}>No quiz found for this lesson.</Text>
          )}

          <View style={styles.navButtonsRow}>
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={() => {
                // عدلي اسم الشاشة لاسم شاشة درس 13 في النافيجيشن
                navigation.navigate("LessonViewer13Mobile");
              }}
            >
              <Text style={styles.navButtonText}>⬅️ Previous Lesson</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!quizPassed}
              style={[
                styles.navButton,
                quizPassed ? styles.nextEnabled : styles.nextDisabled,
              ]}
              onPress={() => {
                if (quizPassed) {
                  // عدلي اسم الشاشة لاسم شاشة درس 15 في النافيجيشن
                  navigation.navigate("LessonViewer15Mobile");
                }
              }}
            >
              <Text
                style={[
                  styles.navButtonText,
                  quizPassed ? { color: "#ffffff" } : { color: "#6b7280" },
                ]}
              >
                Next Lesson ➡️
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* زر العودة للقائمة (اختياري) */}
        <View style={styles.backToLessonsWrapper}>
          <TouchableOpacity
            style={styles.backToLessonsButton}
            onPress={() => {
              // عدلي اسم شاشة قائمة الدروس في النافيجيشن
              navigation.navigate("LessonListScreen");
            }}
          >
            <Text style={styles.backToLessonsText}>← Back to Lessons</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* الزر العائم لجدول المحتويات */}
      {lesson.sections && (
        <FloatingTOC
          sections={lesson.sections}
          onSelectSection={scrollToSection}
        />
      )}

      {/* شات AI كـ Modal يغطي يمين الشاشة */}
      {aiTool && (
        <AccessibilityChatModal
          visible={showChat}
          onClose={() => setShowChat(false)}
          endpoint={aiTool.endpoint}
          placeholder={aiTool.placeholder}
        />
      )}
    </View>
  );
}

/* ==========================
   Floating TOC Button & Menu
========================== */
function FloatingTOC({ sections, onSelectSection }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.floatingTOCWrapper}>
      <TouchableOpacity
        style={styles.floatingTOCButton}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Text style={styles.floatingTOCIcon}>📚</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.floatingTOCMenu}>
          <Text style={styles.floatingTOCTitle}>Lesson Sections</Text>
          {sections.map((sec, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                onSelectSection(i);
                setOpen(false);
              }}
              style={styles.floatingTOCItem}
            >
              <Text style={styles.floatingTOCItemText}>
                {sec.title.replace(/^[^a-zA-Z0-9]+/, "")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

/* ==========================
   Quiz helpers
========================== */
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

function LessonQuiz({ quizBlock, quizPassed, setQuizPassed }) {
  const questions = quizBlock?.quiz?.questions || [];
  if (!questions.length) {
    return <Text style={styles.noQuizText}>No questions found.</Text>;
  }

  return (
    <View style={styles.quizInnerBox}>
      <Quiz
        lessonId={40}
        questions={questions}
        totalQuestions={questions.length}
        onPassed={() => setQuizPassed(true)}
      />
      <Text style={styles.quizHint}>
        {quizPassed
          ? "🎉 Excellent! You passed the quiz and unlocked the next lesson."
          : "Complete the quiz to unlock the next lesson."}
      </Text>
    </View>
  );
}

/* ==========================
   AI Chat Modal
========================== */
function AccessibilityChatModal({ visible, onClose, endpoint, placeholder }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!question.trim()) return;
    const userMsg = { from: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}${endpoint}`, { question });
      const aiMsg = { from: "ai", text: res.data.answer || "No reply." };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ Error connecting to AI assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.chatOverlay}>
        <View style={styles.chatContainer}>
          {/* Header */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderTitle}>
              💬 Accessibility Helper Chat
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.chatHeaderClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <View style={styles.chatMessages}>
            <ScrollView contentContainerStyle={styles.chatMessagesInner}>
              {messages.map((m, i) => (
                <View
                  key={i}
                  style={[
                    styles.chatBubble,
                    m.from === "user"
                      ? styles.chatBubbleUser
                      : styles.chatBubbleAI,
                  ]}
                >
                  <Text style={styles.chatBubbleText}>{m.text}</Text>
                </View>
              ))}
              {loading && (
                <Text style={styles.chatTyping}>
                  Assistant is typing...
                </Text>
              )}
            </ScrollView>
          </View>

          {/* Input */}
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder={placeholder}
              placeholderTextColor="#9ca3af"
              value={question}
              onChangeText={setQuestion}
            />
            <TouchableOpacity style={styles.chatSendButton} onPress={sendMessage}>
              <Text style={styles.chatSendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ==========================
   STYLES
========================== */
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFDF6",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: "#FEF3C7",
    borderBottomWidth: 1,
    borderBottomColor: "#FCD34D",
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FBBF24",
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },
  topHeaderTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#92400E",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFDF6",
  },
  loadingText: {
    marginTop: 10,
    color: "#4B5563",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 16,
    fontWeight: "600",
  },

  lessonHeaderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FCD34D",
    padding: 16,
    marginBottom: 16,
    shadowColor: "#FBBF24",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#A66300",
    marginBottom: 8,
  },
  lessonDescription: {
    fontSize: 14,
    color: "#374151",
  },

  sectionsWrapper: {
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FCD34D",
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: "#FACC15",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFBEB",
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A66300",
    flex: 1,
    paddingRight: 8,
  },
  sectionHeaderIcon: {
    fontSize: 18,
    color: "#D97706",
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#FDE68A",
  },
  sectionText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
    lineHeight: 20,
  },

  listWrapper: {
    marginTop: 6,
    marginBottom: 8,
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bullet: {
    marginRight: 6,
    marginTop: 2,
    fontSize: 14,
    color: "#D97706",
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },

  codeDemoBox: {
    marginTop: 10,
    backgroundColor: "#FFF9E8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCD34D",
    padding: 10,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#111827",
  },
  codeNote: {
    marginTop: 6,
    fontSize: 12,
    color: "#A66300",
    fontStyle: "italic",
  },

  aiToolBox: {
    marginTop: 10,
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FBBF24",
    padding: 10,
  },
  aiToolDescription: {
    fontSize: 13,
    color: "#A66300",
    marginBottom: 6,
  },
  aiToolButton: {
    alignSelf: "flex-start",
    backgroundColor: "#A66300",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  aiToolButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  quizCard: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FCD34D",
    padding: 16,
    shadowColor: "#FACC15",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#A66300",
    marginBottom: 10,
  },
  noQuizText: {
    fontSize: 14,
    color: "#6B7280",
  },
  quizInnerBox: {
    backgroundColor: "#FFF8E1",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FBBF24",
    padding: 10,
  },
  quizHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#A66300",
  },

  navButtonsRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  navButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  prevButton: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  nextEnabled: {
    backgroundColor: "#FBBF24",
  },
  nextDisabled: {
    backgroundColor: "#E5E7EB",
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },

  backToLessonsWrapper: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  backToLessonsButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#A66300",
  },
  backToLessonsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#A66300",
  },

  floatingTOCWrapper: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  floatingTOCButton: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#FBBF24",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  floatingTOCIcon: {
    fontSize: 24,
  },
  floatingTOCMenu: {
    position: "absolute",
    bottom: 64,
    left: 0,
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FCD34D",
    padding: 10,
    shadowColor: "#9CA3AF",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingTOCTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#A66300",
    marginBottom: 6,
    textAlign: "center",
  },
  floatingTOCItem: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  floatingTOCItemText: {
    fontSize: 13,
    color: "#374151",
  },

  chatOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  chatContainer: {
    width: width * 0.9,
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 1,
    borderLeftColor: "#FCD34D",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#A66300",
  },
  chatHeaderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chatHeaderClose: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  chatMessages: {
    flex: 1,
    backgroundColor: "#FFFDF6",
  },
  chatMessagesInner: {
    padding: 8,
  },
  chatBubble: {
    maxWidth: "85%",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 6,
  },
  chatBubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#FDE68A",
  },
  chatBubbleAI: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF8E1",
  },
  chatBubbleText: {
    fontSize: 13,
    color: "#4B2E00",
  },
  chatTyping: {
    fontSize: 11,
    color: "#6B7280",
    fontStyle: "italic",
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#FCD34D",
    backgroundColor: "#FFFFFF",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FBBF24",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: "#111827",
    marginRight: 6,
  },
  chatSendButton: {
    backgroundColor: "#A66300",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chatSendText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
