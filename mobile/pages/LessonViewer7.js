import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Video, ResizeMode, Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ عدلي المسار حسب مكان كومبوننت الكويز في الموبايل
import Quiz from "../components/Quiz";

const { width } = Dimensions.get("window");
const API = "http://10.0.2.2:5000";

/* ===========================
   🎯 Floating ChatBot (Tag Tutor)
=========================== */
function FloatingChatBotMobile() {
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendTag = async () => {
    if (!tag.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: tag }]);
    const currentTag = tag;
    setTag("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/ai-local/tag-tutor`, {
        tag: currentTag,
      });
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: res.data.explanation },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ Error connecting to AI tutor." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 💬 الزر العائم */}
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        style={styles.chatFloatButton}
      >
        <Text style={styles.chatFloatIcon}>💬</Text>
      </TouchableOpacity>

      {/* 🧠 نافذة الشات */}
      <Modal
        transparent
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.chatOverlay}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderText}>🤖 Tag Tutor</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.chatClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatMessages}>
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
                  <Text
                    style={
                      m.from === "user"
                        ? styles.chatTextUser
                        : styles.chatTextAI
                    }
                  >
                    {m.text}
                  </Text>
                </View>
              ))}
              {loading && (
                <Text style={styles.chatLoading}>Thinking...</Text>
              )}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                placeholder="Enter an HTML tag..."
                value={tag}
                onChangeText={setTag}
                onSubmitEditing={sendTag}
                style={styles.chatInput}
              />
              <TouchableOpacity
                style={styles.chatSendButton}
                onPress={sendTag}
              >
                <Text style={styles.chatSendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ===========================
   🎨 AI Visualizer Component (Mobile)
=========================== */
function AIVisualizerMobile() {
  const [htmlCode, setHtmlCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!htmlCode.trim()) return;
    setLoading(true);
    setOutput("");
    try {
      const res = await axios.post(
        `${API}/api/ai-local/structure-visualizer`,
        { htmlCode }
      );
      setOutput(res.data.structure);
    } catch (e) {
      setOutput("⚠️ Failed to analyze structure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.aiBox}>
      <Text style={styles.aiTitle}>🧠 AI Activity: Structure Visualizer</Text>
      <Text style={styles.aiDescription}>
        Paste your HTML code below and let the AI describe your page structure.
      </Text>

      <TextInput
        multiline
        numberOfLines={6}
        value={htmlCode}
        onChangeText={setHtmlCode}
        placeholder="<header><nav>...</nav></header><main>...</main><footer>...</footer>"
        style={styles.aiInput}
      />

      <TouchableOpacity
        onPress={analyze}
        disabled={loading}
        style={[
          styles.aiButton,
          loading && { opacity: 0.7 },
        ]}
      >
        <Text style={styles.aiButtonText}>
          {loading ? "Analyzing..." : "Analyze Structure"}
        </Text>
      </TouchableOpacity>

      {output !== "" && (
        <View style={styles.aiOutputBox}>
          <Text style={styles.aiOutputText}>{output}</Text>
        </View>
      )}
    </View>
  );
}

/* ===========================
   📘 Main Viewer for Lesson 7 (Mobile)
=========================== */
export default function LessonViewer7Mobile() {
  const route = useRoute();
  const navigation = useNavigation();
  const { lessonId } = route.params || {}; // ممكن ما تحتاجي البراميتر، لأننا شغالين على id ثابت 33

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [passed, setPassed] = useState(false);

  // 🎧 AI Voice Explain
  const [loadingVoice, setLoadingVoice] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const soundRef = useRef(null);

  // 🔵 فتح قائمة الأقسام العائمة
  const [sectionsOpen, setSectionsOpen] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
       const token = await AsyncStorage.getItem("token");

const res = await axios.get(`${API}/api/lessons/content/33`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load lesson 7", e);
        Alert.alert("Error", "Failed to load lesson 7");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [lessonId]);

  const handleVoiceExplain = async (heading, content, index) => {
    setActiveSection(index);
    setLoadingVoice(true);

    try {
      const res = await axios.post(`${API}/api/ai-local/voice-explain`, {
        heading,
        content,
      });

      const { audioBase64 } = res.data;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const fileUri = FileSystem.cacheDirectory + `voiceExplain_${index}.mp3`;
      await FileSystem.writeAsStringAsync(fileUri, audioBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      soundRef.current = sound;
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setLoadingVoice(false);
          setActiveSection(null);
        }
      });
    } catch (err) {
      console.error("❌ Voice explain failed:", err.message);
      Alert.alert("Error", "AI voice explanation failed. Please try again.");
      setLoadingVoice(false);
      setActiveSection(null);
    }
  };

  if (loading || !lesson) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FBC02D" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  const quizSection = lesson.sections.find((s) => s.quiz);

  const scrollToSection = (index) => {
    // مبدئياً فقط Scroll بسيط: خلي السكاشن بمسافات معقولة
    // لو حابة Scroll دقيق لازم نستخدم refs لكل سيكشن
    Alert.alert("Hint", "Scroll manually to this section for now 🙂");
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* 🎬 مقدمة (فيديو هيدر) */}
          <View style={styles.introWrapper}>
            <View style={styles.introVideoContainer}>
              <Video
                source={require("../assets/semanaticHtml.mp4")} // عدلي المسار حسب مكان الفيديو
                style={styles.introVideo}
                resizeMode={ResizeMode.COVER}
                isLooping
                shouldPlay
                isMuted
              />
              <View style={styles.introOverlay} />
              <View style={styles.introTextContainer}>
                <Text style={styles.introTitle}>🧩 {lesson.title}</Text>
                <Text style={styles.introDescription}>
                  {lesson.description}
                </Text>
              </View>
            </View>

            {/* 🔙 زر الرجوع */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>⬅️ Back to Lessons</Text>
            </TouchableOpacity>
          </View>

          {/* 🔵 Floating Lesson Navigator (زر على اليسار يفتح مودال سكاشن) */}
          <TouchableOpacity
            style={styles.sectionsFloatButton}
            onPress={() => setSectionsOpen(true)}
          >
            <Text style={styles.sectionsFloatIcon}>📚</Text>
          </TouchableOpacity>

          <Modal
            transparent
            visible={sectionsOpen}
            animationType="fade"
            onRequestClose={() => setSectionsOpen(false)}
          >
            <View style={styles.sectionsOverlay}>
              <View style={styles.sectionsContainer}>
                <View style={styles.sectionsHeader}>
                  <Text style={styles.sectionsHeaderText}>
                    Lesson Sections
                  </Text>
                  <TouchableOpacity onPress={() => setSectionsOpen(false)}>
                    <Text style={styles.sectionsClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {lesson.sections.map((sec, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.sectionItemButton}
                      onPress={() => {
                        setSectionsOpen(false);
                        scrollToSection(i);
                      }}
                    >
                      <Text style={styles.sectionItemText}>
                        {(sec.heading || "").replace(/^[^a-zA-Z]+/, "")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* ✅ عرض الأقسام */}
          {lesson.sections.map((sec, i) => (
            <View key={i} style={styles.sectionWrapper}>
              {/* 🌟 القسم الأول والثاني (مع الصوت) */}
              {i === 0 || i === 1 ? (
                <View style={styles.sectionCardHighlight}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>{sec.heading}</Text>

                    <TouchableOpacity
                      onPress={() =>
                        handleVoiceExplain(sec.heading, sec.content, i)
                      }
                      disabled={loadingVoice && activeSection === i}
                      style={[
                        styles.voiceButton,
                        loadingVoice && activeSection === i
                          ? styles.voiceButtonLoading
                          : null,
                      ]}
                    >
                      {loadingVoice && activeSection === i ? (
                        <Text style={styles.voiceButtonText}>Loading...</Text>
                      ) : (
                        <Text style={styles.voiceButtonText}>🔊 Listen</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {i === 0 ? (
                    <Text style={styles.sectionText}>
                      {sec.content}
                    </Text>
                  ) : (
                    <>
                      <Text style={styles.sectionText}>
                        {sec.content.split("\n")[0]}
                      </Text>
                      <View style={styles.bulletsGrid}>
                        {sec.content
                          .split("\n")
                          .slice(1)
                          .filter((line) => line.trim() !== "")
                          .map((line, j) => (
                            <View key={j} style={styles.bulletCard}>
                              <Text style={styles.bulletIcon}>
                                {["🚀", "♿", "🧹", "🤝"][j] || "✨"}
                              </Text>
                              <Text style={styles.bulletText}>
                                {line.replace(/^\d+\.\s*/, "")}
                              </Text>
                            </View>
                          ))}
                      </View>
                    </>
                  )}
                </View>
              ) : i === 2 ? (
                /* 🧩 القسم الثالث التفاعلي */
                <View style={styles.sectionCardSoft}>
                  <Text style={styles.sectionTitle}>{sec.heading}</Text>
                  {(() => {
                    const lines = sec.content
                      .split("\n")
                      .filter((l) => l.trim() !== "");
                    const intro = lines[0];
                    const tagLines = lines.slice(1);
                    const parsedTags = tagLines.map((line) => {
                      const [tag, desc] = line.split(":").map((s) => s.trim());
                      return { tag, desc };
                    });

                    return (
                      <>
                        <Text style={styles.sectionText}>{intro}</Text>
                        <View style={styles.tagsGrid}>
                          {parsedTags.map((el, idx) => (
                            <View key={idx} style={styles.tagCard}>
                              <View style={styles.tagHeaderRow}>
                                <Text style={styles.tagIcon}>
                                  {[
                                    "🧭",
                                    "🗺️",
                                    "📄",
                                    "🧩",
                                    "📰",
                                    "💡",
                                    "📍",
                                    "🖼️",
                                  ][idx] || "✨"}
                                </Text>
                                <Text style={styles.tagCode}>{el.tag}</Text>
                              </View>
                              <Text style={styles.tagDesc}>{el.desc}</Text>
                              <View style={styles.tagExampleBox}>
                                <Text style={styles.tagExampleLabel}>
                                  💡 Example:
                                </Text>
                                <Text style={styles.tagExampleCode}>
                                  {`<${el.tag.replace(/[<>]/g, "")}>...</${el.tag.replace(
                                    /[<>]/g,
                                    ""
                                  )}>`}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </>
                    );
                  })()}
                </View>
              ) : i === 3 ? (
                /* قبل/بعد */
                <View style={styles.sectionCardSoft}>
                  <Text style={styles.sectionTitle}>{sec.heading}</Text>
                  {(() => {
                    const lines = sec.content
                      .split("\n")
                      .filter((l) => l.trim() !== "");
                    const intro = lines[0];
                    const beforeIndex = lines.findIndex((l) =>
                      l.toLowerCase().includes("before")
                    );
                    const afterIndex = lines.findIndex((l) =>
                      l.toLowerCase().includes("after")
                    );
                    const beforeCode = lines
                      .slice(beforeIndex + 1, afterIndex)
                      .join("\n");
                    const afterCode = lines.slice(afterIndex + 1).join("\n");

                    return (
                      <>
                        <Text style={styles.sectionText}>{intro}</Text>
                        <View style={styles.beforeAfterRow}>
                          <View style={styles.beforeCard}>
                            <View style={styles.beforeHeader}>
                              <Text style={styles.beforeIcon}>❌</Text>
                              <Text style={styles.beforeTitle}>Before</Text>
                            </View>
                            <Text style={styles.codeBlock}>
                              {beforeCode}
                            </Text>
                          </View>

                          <View style={styles.afterCard}>
                            <View style={styles.afterHeader}>
                              <Text style={styles.afterIcon}>✅</Text>
                              <Text style={styles.afterTitle}>After</Text>
                            </View>
                            <Text style={styles.codeBlock}>
                              {afterCode}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.compareButtonWrapper}>
                          <TouchableOpacity
                            style={styles.compareButton}
                            onPress={() =>
                              Alert.alert(
                                "Hint",
                                "Semantic tags replace generic <div> elements with meaningful structure!"
                              )
                            }
                          >
                            <Text style={styles.compareButtonText}>
                              🔍 Compare the Difference
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    );
                  })()}
                </View>
              ) : i === 4 ? (
                /* 🎨 المخطط البصري للصفحة */
                <View style={styles.sectionCardSoft}>
                  <Text style={styles.sectionTitle}>{sec.heading}</Text>
                  {(() => {
                    const lines = sec.content
                      .split("\n")
                      .filter((l) => l.trim() !== "");
                    const intro = lines[0];
                    const outro = lines[lines.length - 1];

                    return (
                      <>
                        <Text style={styles.sectionText}>{intro}</Text>

                        <View style={styles.layoutBox}>
                          <View style={styles.layoutHeader}>
                            <Text style={styles.layoutHeaderText}>
                              &lt;header&gt;
                            </Text>
                          </View>

                          <View style={styles.layoutBodyRow}>
                            <View style={styles.layoutNav}>
                              <Text style={styles.layoutBlockText}>
                                &lt;nav&gt;
                              </Text>
                            </View>
                            <View style={styles.layoutMain}>
                              <Text style={styles.layoutBlockText}>
                                &lt;main&gt;
                              </Text>
                              <View style={styles.layoutSeparator} />
                              <Text style={styles.layoutSmallLabel}>
                                content area
                              </Text>
                            </View>
                            <View style={styles.layoutAside}>
                              <Text style={styles.layoutBlockText}>
                                &lt;aside&gt;
                              </Text>
                            </View>
                          </View>

                          <View style={styles.layoutFooter}>
                            <Text style={styles.layoutHeaderText}>
                              &lt;footer&gt;
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.layoutOutro}>{outro}</Text>
                      </>
                    );
                  })()}
                </View>
              ) : (
                // باقي الأقسام العادية
                <View style={styles.sectionCardNormal}>
                  <Text style={styles.sectionTitle}>{sec.heading}</Text>
                  <Text style={styles.sectionText}>{sec.content}</Text>

                  {sec.aiVisualizer && <AIVisualizerMobile />}

                  {sec.quiz && (
                    <Quiz
                      lessonId={33}
                      questions={sec.quiz.questions}
                      totalQuestions={sec.quiz.questions.length}
                      onPassed={() => {
                        setQuizCompleted(true);
                        setPassed(true);
                      }}
                      onFailed={() => {
                        setQuizCompleted(true);
                        setPassed(false);
                      }}
                    />
                  )}
                </View>
              )}
            </View>
          ))}

          {/* ✅ أزرار الانتقال بعد الكويز */}
          {quizCompleted && (
            <View style={styles.navButtonsRow}>
              <TouchableOpacity
                style={styles.prevButton}
                onPress={() =>
                  navigation.navigate("LessonViewer6", {
                    lessonId: 32,
                  })
                }
              >
                <Text style={styles.prevButtonText}>⬅️ Previous Lesson</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!passed}
                style={[
                  styles.nextButton,
                  !passed && styles.nextButtonDisabled,
                ]}
                onPress={() => {
                  if (passed) {
                    navigation.navigate("LessonViewer8", {
                      lessonId: 34,
                    });
                  }
                }}
              >
                <Text style={styles.nextButtonText}>Next Lesson ➡️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 💬 Floating ChatBot */}
      {lesson.aiChatFloating && <FloatingChatBotMobile />}
    </View>
  );
}

/* ===========================
   🎨 Styles
=========================== */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
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
  cardContainer: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    elevation: 4,
  },

  /* Intro */
  introWrapper: {
    marginBottom: 20,
  },
  introVideoContainer: {
    height: 260,
    borderRadius: 24,
    overflow: "hidden",
  },
  introVideo: {
    width: "100%",
    height: "100%",
  },
  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  introTextContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  introTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  introDescription: {
    fontSize: 14,
    color: "#F5F5F5",
  },
  backButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,249,230,0.8)",
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

  /* Sections Float Button */
  sectionsFloatButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FBC02D",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  sectionsFloatIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },
  sectionsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sectionsContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
  },
  sectionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionsHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5D4037",
  },
  sectionsClose: {
    fontSize: 18,
    color: "#888",
  },
  sectionItemButton: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  sectionItemText: {
    fontSize: 14,
    color: "#5D4037",
  },

  /* Section cards */
  sectionWrapper: {
    marginTop: 16,
  },
  sectionCardHighlight: {
    backgroundColor: "#FFF9C4",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  sectionCardSoft: {
    backgroundColor: "#FFFBEA",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  sectionCardNormal: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#5D4037",
    flex: 1,
    paddingRight: 10,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5F4B43",
  },

  /* Voice button */
  voiceButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFF8E1",
  },
  voiceButtonLoading: {
    backgroundColor: "#FBC02D",
  },
  voiceButtonText: {
    fontSize: 13,
    color: "#8D6E63",
    fontWeight: "600",
  },

  /* Bullets */
  bulletsGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bulletCard: {
    width: (width - 16 * 4) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFECB3",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: "#5F4B43",
  },

  /* Tags grid */
  tagsGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tagCard: {
    width: (width - 16 * 4) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  tagHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  tagIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  tagCode: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F9A825",
  },
  tagDesc: {
    fontSize: 13,
    color: "#5F4B43",
  },
  tagExampleBox: {
    marginTop: 6,
    backgroundColor: "#FFFDE7",
    borderRadius: 8,
    padding: 6,
  },
  tagExampleLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F9A825",
    marginBottom: 2,
  },
  tagExampleCode: {
    fontSize: 12,
    color: "#5F4B43",
  },

  /* Before / After */
  beforeAfterRow: {
    marginTop: 12,
  },
  beforeCard: {
    backgroundColor: "#FFF8F8",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFCDD2",
    marginBottom: 10,
  },
  afterCard: {
    backgroundColor: "#F9FFF6",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  beforeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  afterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  beforeIcon: {
    fontSize: 18,
    color: "#E57373",
    marginRight: 4,
  },
  afterIcon: {
    fontSize: 18,
    color: "#66BB6A",
    marginRight: 4,
  },
  beforeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C62828",
  },
  afterTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },
  codeBlock: {
    fontSize: 12,
    color: "#424242",
  },
  compareButtonWrapper: {
    marginTop: 12,
    alignItems: "center",
  },
  compareButton: {
    backgroundColor: "#FBC02D",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  compareButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  /* Layout visual */
  layoutBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFECB3",
    marginBottom: 10,
  },
  layoutHeader: {
    backgroundColor: "#FFF9C4",
    borderWidth: 1,
    borderColor: "#FBC02D",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 4,
  },
  layoutFooter: {
    backgroundColor: "#FFF9C4",
    borderWidth: 1,
    borderColor: "#FBC02D",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 4,
  },
  layoutHeaderText: {
    textAlign: "center",
    color: "#F9A825",
    fontWeight: "600",
  },
  layoutBodyRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  layoutNav: {
    flex: 1,
    backgroundColor: "#FFFDE7",
    borderWidth: 1,
    borderColor: "#FFECB3",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  layoutMain: {
    flex: 2,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#FFECB3",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  layoutAside: {
    flex: 1,
    backgroundColor: "#FFFDE7",
    borderWidth: 1,
    borderColor: "#FFECB3",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  layoutBlockText: {
    fontSize: 13,
    color: "#F9A825",
  },
  layoutSeparator: {
    width: "70%",
    height: 1,
    backgroundColor: "#FFECB3",
    marginVertical: 4,
  },
  layoutSmallLabel: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  layoutOutro: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#5F4B43",
  },

  /* AI Visualizer */
  aiBox: {
    marginTop: 12,
    backgroundColor: "#FFFBEA",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5D4037",
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 12,
    color: "#5F4B43",
    marginBottom: 6,
  },
  aiInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#FBC02D",
    borderRadius: 10,
    padding: 8,
    fontSize: 12,
    textAlignVertical: "top",
    backgroundColor: "#FFFFFF",
    marginBottom: 6,
  },
  aiButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FBC02D",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  aiButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  aiOutputBox: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  aiOutputText: {
    fontSize: 12,
    color: "#5F4B43",
  },

  /* Nav buttons after quiz */
  navButtonsRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  prevButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#EEEEEE",
    borderRadius: 10,
  },
  prevButtonText: {
    color: "#424242",
    fontWeight: "600",
    fontSize: 13,
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FBC02D",
    borderRadius: 10,
  },
  nextButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  /* ChatBot styles */
  chatFloatButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FBC02D",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  chatFloatIcon: {
    fontSize: 26,
    color: "#FFFFFF",
  },
  chatOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  chatContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 12,
    maxHeight: "70%",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chatHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5D4037",
  },
  chatClose: {
    fontSize: 18,
    color: "#888",
  },
  chatMessages: {
    maxHeight: 260,
  },
  chatBubble: {
    padding: 8,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "80%",
  },
  chatBubbleUser: {
    backgroundColor: "#FFF9C4",
    alignSelf: "flex-end",
  },
  chatBubbleAI: {
    backgroundColor: "#EEEEEE",
    alignSelf: "flex-start",
  },
  chatTextUser: {
    fontSize: 13,
    color: "#795548",
  },
  chatTextAI: {
    fontSize: 13,
    color: "#424242",
  },
  chatLoading: {
    textAlign: "center",
    fontSize: 12,
    color: "#BDBDBD",
    marginTop: 4,
  },
  chatInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FFECB3",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    marginRight: 8,
  },
  chatSendButton: {
    backgroundColor: "#FBC02D",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chatSendText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});

