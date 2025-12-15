// ==========================================
// 📱 LessonViewer11Mobile.js
// نفس محتوى الويب لكن مكيّف للموبايل
// ==========================================
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import Quiz from "../components/Quiz"; // نفس الكومبوننت اللي استخدمتيه بالدروس السابقة
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ===============================
// 🧠 AI Embed Helper (Mobile)
// ===============================
function AIEmbedHelperSectionMobile() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const API = "http://10.0.2.2:5000";

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await axios.post(`${API}/api/ai-local/embed-generator`, {
        question,
      });
      const text = res.data.answer || "No response received.";
      setAnswer(text);
    } catch (err) {
      console.error("AI error:", err?.response?.data || err.message);
      setAnswer("⚠️ Error: Could not connect to AI service.");
    } finally {
      setLoading(false);
    }
  };

  // تحضير HTML للمعاينة لو فيه iframe
  const buildPreviewHtml = (snippet) => {
    const code = snippet || "";
    return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html,body{
    margin:0;
    padding:0;
    height:100%;
    background:#000;
    display:flex;
    align-items:center;
    justify-content:center;
  }
  iframe{
    border:0;
    width:100%;
    height:100%;
  }
</style>
</head>
<body>
  ${code}
</body>
</html>
    `.trim();
  };

  const hasIframe = answer.includes("<iframe");

  return (
    <View style={styles.aiBox}>
      <Text style={styles.aiTitle}>AI Embed Helper</Text>
      <Text style={styles.aiSubtitle}>
        اكتب سؤالك عن التضمين (YouTube, Maps, playlists …) والـ AI يعطيك كود iframe جاهز.
      </Text>

      <TextInput
        value={question}
        onChangeText={setQuestion}
        placeholder="مثال: How can I embed a YouTube playlist?"
        multiline
        style={styles.aiInput}
      />

      <TouchableOpacity
        onPress={askAI}
        disabled={loading}
        style={[
          styles.aiButton,
          loading && { opacity: 0.6 },
        ]}
      >
        <Text style={styles.aiButtonText}>
          {loading ? "Asking AI..." : "Ask AI 🤔"}
        </Text>
      </TouchableOpacity>

      {answer ? (
        <View style={styles.aiAnswerBox}>
          <Text style={styles.aiAnswerTitle}>AI Response:</Text>
          <ScrollView
            style={styles.aiAnswerScroll}
            horizontal
            showsHorizontalScrollIndicator={true}
          >
            <Text style={styles.aiAnswerCode}>{answer}</Text>
          </ScrollView>

          {hasIframe && (
            <View style={styles.aiPreviewBox}>
              <WebView
                originWhitelist={["*"]}
                source={{ html: buildPreviewHtml(answer) }}
                style={{ height: 260, width: "100%" }}
                javaScriptEnabled
                domStorageEnabled
              />
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

// ===============================
// 🎞 Examples Slider (Mobile)
// ===============================
function ExamplesSliderMobile({ title, content }) {
  const [index, setIndex] = useState(0);

  const examples = Array.isArray(content)
    ? content.filter(
        (x) =>
          x?.type === "code-demo" &&
          !(x?.note || "").toLowerCase().includes("local")
      )
    : [];

  if (examples.length === 0) return null;

  const current = examples[index];

  const next = () => {
    setIndex((prev) => (prev + 1) % examples.length);
  };

  const prev = () => {
    setIndex((prev) => (prev === 0 ? examples.length - 1 : prev - 1));
  };

  // HTML للمعاينة داخل WebView
  const previewHTML = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html,body{margin:0;padding:0;background:#000;height:100%;}
  .resp{position:relative;width:100%;height:100%;}
  .resp iframe, .resp video, .resp object, .resp embed{
    position:absolute;inset:0;border:0;width:100%;height:100%;display:block;
  }
</style>
</head>
<body>
  <div class="resp">
    ${current?.code || ""}
  </div>
</body>
</html>
  `.trim();

  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderTitle}>{title}</Text>
      <Text style={styles.sliderSubtitle}>
        استعرض أمثلة واقعية لكيفية استخدام iframes.
      </Text>

      <View style={styles.sliderCodeBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <Text style={styles.sliderCode}>{current?.code || ""}</Text>
        </ScrollView>
      </View>

      <View style={styles.sliderPreview}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: previewHTML }}
          style={{ height: 260, width: "100%" }}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>

      <View style={styles.sliderButtonsRow}>
        <TouchableOpacity onPress={prev} style={styles.sliderNavButton}>
          <Text style={styles.sliderNavText}>⬅</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={next} style={styles.sliderNavButton}>
          <Text style={styles.sliderNavText}>➡</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sliderDotsRow}>
        {examples.map((_, i) => (
          <View
            key={i}
            style={[
              styles.sliderDot,
              i === index && styles.sliderDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ===============================
// 📘 LessonViewer11Mobile
// ===============================
export default function LessonViewer11Mobile() {
  const API = "http://10.0.2.2:5000";
  const navigation = useNavigation();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizPassed, setQuizPassed] = useState(false);
  const [sectionIds, setSectionIds] = useState([]);

  const scrollViewRef = useRef(null);
  const positionsRef = useRef({});

  const slugify = (txt = "", fallback = "section") =>
    (txt || fallback)
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);

  // 🔄 Fetch lesson
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const headers = token
          ? { Authorization: `Bearer ${token}` }
          : undefined;

        const res = await axios.get(`${API}/api/lessons/content/37`, {
          headers,
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load Lesson 11 (mobile):", e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  // 🏷️ Generate section IDs
  useEffect(() => {
    if (!lesson?.sections) return;
    const ids = lesson.sections.map((sec, i) => {
      if (sec.quiz) return "quiz-section";
      const base = slugify(sec.title || `section-${i + 1}`);
      return `${base}-${i + 1}`;
    });
    setSectionIds(ids);
  }, [lesson]);

  const handleSectionLayout = (id, event) => {
    const { y } = event.nativeEvent.layout;
    positionsRef.current[id] = y;
  };

  const scrollToSection = (id) => {
    const y = positionsRef.current[id] ?? 0;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y, animated: true });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#F5B700" />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.loadingBox}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  // ===============================
  // 🧾 Render Section Content
  // ===============================
  const renderSectionContent = (section, idx) => {
    // سكشن الأمثلة العملية
    if (section?.title?.includes("Practical Embedding Examples")) {
      return (
        <View
          key={idx}
          onLayout={(e) => handleSectionLayout(sectionIds[idx], e)}
          style={styles.sectionWrapper}
        >
          <ExamplesSliderMobile
            title={section.title}
            content={section.content}
          />
        </View>
      );
    }

    // سكشن الكويز موجود في renderQuiz
    if (section.quiz) return null;

    return (
      <View
        key={idx}
        onLayout={(e) => handleSectionLayout(sectionIds[idx], e)}
        style={styles.sectionWrapper}
      >
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {Array.isArray(section.content) &&
            section.content.map((item, i) => {
              // نص عادي
              if (typeof item === "string") {
                return (
                  <Text key={i} style={styles.sectionParagraph}>
                    {item}
                  </Text>
                );
              }

              // ليست الخصائص بمربعات
              if (item.type === "list") {
                return (
                  <View key={i} style={styles.listGrid}>
                    {item.items.map((line, index) => {
                      const parts = line.split("–");
                      const property = parts[0]?.trim() || "";
                      const description = parts[1]?.trim() || "";

                      return (
                        <View key={index} style={styles.listCard}>
                          <Text style={styles.listProperty}>{property}</Text>
                          <Text style={styles.listDescription}>
                            {description}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              }

              // كود + معاينة iframe/Embed
              if (item.type === "code-demo") {
                const previewHTML = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html,body{margin:0;padding:0;height:100%;background:#000;}
  .resp{position:relative;width:100%;height:100%;}
  .resp iframe, .resp video, .resp object, .resp embed{
    position:absolute;inset:0;border:0;width:100%;height:100%;display:block;
  }
</style>
</head>
<body>
  <div class="resp">
    ${item.code}
  </div>
</body>
</html>
                `.trim();

                return (
                  <View key={i} style={styles.codeDemoBox}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator
                      style={styles.codeScroll}
                    >
                      <Text style={styles.codeText}>{item.code}</Text>
                    </ScrollView>

                    <View style={styles.webviewBox}>
                      <WebView
                        originWhitelist={["*"]}
                        source={{ html: previewHTML }}
                        style={{ height: 260, width: "100%" }}
                        javaScriptEnabled
                        domStorageEnabled
                      />
                    </View>

                    {item.note ? (
                      <Text style={styles.codeNote}>{item.note}</Text>
                    ) : null}
                  </View>
                );
              }

              // سكشن AI
              if (item.type === "ai-section") {
                return (
                  <AIEmbedHelperSectionMobile
                    key={i}
                    // prompt & exampleResponse مش ضروريين في نسخة الموبايل
                  />
                );
              }

              return null;
            })}
        </View>
      </View>
    );
  };

  // ===============================
  // 🧩 Quiz Section
  // ===============================
  const renderQuiz = (quizSection, idx) => {
    if (!quizSection?.quiz?.questions) return null;

    const processedQuestions = quizSection.quiz.questions.map((q) => {
      if (typeof q.answer === "number") return q;
      const idxAns = q.options.findIndex(
        (opt) =>
          opt.trim().toLowerCase() === q.answer.trim().toLowerCase()
      );
      return { ...q, answer: idxAns !== -1 ? idxAns : 0 };
    });

    return (
      <View
        key={`quiz-${idx}`}
        onLayout={(e) => handleSectionLayout("quiz-section", e)}
        style={styles.quizWrapper}
      >
        <Text style={styles.quizTitle}>{quizSection.heading}</Text>

        <Quiz
          lessonId={37}
          questions={processedQuestions}
          totalQuestions={processedQuestions.length}
          onPassed={() => setQuizPassed(true)}
        />

        <View style={styles.quizButtonsRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.quizNavBtn, { backgroundColor: "#E0F2F1" }]}
          >
            <Text style={[styles.quizNavText, { color: "#004D40" }]}>
              ⬅ Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!quizPassed) return;
              // هنا لاحقًا تعملي navigation للدرس اللي بعده إذا حبيتي
              // مثال:
              // navigation.navigate("LessonViewer12Mobile");
            }}
            disabled={!quizPassed}
            style={[
              styles.quizNavBtn,
              quizPassed
                ? { backgroundColor: "#F5B700" }
                : { backgroundColor: "#CCC" },
            ]}
          >
            <Text
              style={[
                styles.quizNavText,
                { color: quizPassed ? "#fff" : "#666" },
              ]}
            >
              Next Lesson ➡
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.quizHint}>
          {quizPassed
            ? "🎉 You passed! The next lesson is now unlocked."
            : "Finish and pass the quiz to unlock the next lesson."}
        </Text>
      </View>
    );
  };

  // ===============================
  // 🏁 Final Render
  // ===============================
  return (
    <View style={styles.screen}>
      {/* الخلفية الخفيفة */}
      <View style={styles.bgLayer} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* زر العودة للدرس / القائمة */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>⬅ Back to Lessons</Text>
          </TouchableOpacity>
        </View>

        {/* Table of Contents */}
        <View style={styles.tocBox}>
          <Text style={styles.tocTitle}>📑 Lesson Sections</Text>
          <View style={styles.tocButtonsRow}>
            {lesson.sections.map((sec, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => scrollToSection(sectionIds[i])}
                style={styles.tocButton}
              >
                <Text style={styles.tocButtonText}>
                  {sec.title ||
                    sec.heading ||
                    (sec.quiz ? "Quiz" : `Section ${i + 1}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* العنوان + الوصف */}
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDescription}>{lesson.description}</Text>

        {/* سكشنات المحتوى */}
        {lesson.sections.map((sec, i) => {
          if (sec.quiz) {
            return renderQuiz(sec, i);
          }
          return renderSectionContent(sec, i);
        })}
      </ScrollView>
    </View>
  );
}

// ===============================
// 🎨 Styles
// ===============================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFDE7",
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFDE7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDE7",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  topBar: {
    marginBottom: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#064F54",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  tocBox: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFECB3",
    marginBottom: 18,
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#064F54",
    textAlign: "center",
    marginBottom: 10,
  },
  tocButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  tocButton: {
    backgroundColor: "#FFE082",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    margin: 4,
  },
  tocButtonText: {
    color: "#5D4037",
    fontSize: 13,
    fontWeight: "500",
  },
  lessonTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#004D40",
    marginBottom: 8,
    marginTop: 8,
  },
  lessonDescription: {
    fontSize: 15,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  sectionWrapper: {
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#064F54",
    marginBottom: 8,
  },
  sectionParagraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#424242",
    marginBottom: 8,
  },
  listGrid: {
    marginTop: 10,
  },
  listCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  listProperty: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F57C00",
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 14,
    color: "#5D4037",
  },
  codeDemoBox: {
    marginTop: 16,
    backgroundColor: "#0d1117",
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: "#263238",
  },
  codeScroll: {
    maxHeight: 140,
    marginBottom: 10,
  },
  codeText: {
    color: "#EAEAEA",
    fontFamily: "monospace",
    fontSize: 13,
  },
  webviewBox: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  codeNote: {
    marginTop: 8,
    fontSize: 13,
    color: "#FFECB3",
    fontStyle: "italic",
  },
  aiBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FFECB3",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#064F54",
    marginBottom: 4,
  },
  aiSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  aiInput: {
    borderWidth: 1,
    borderColor: "#FFCA28",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    minHeight: 70,
    backgroundColor: "#FFFDF5",
    textAlignVertical: "top",
  },
  aiButton: {
    marginTop: 10,
    backgroundColor: "#F5B700",
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: "center",
  },
  aiButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  aiAnswerBox: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFECB3",
    backgroundColor: "#FFFDF5",
    padding: 10,
  },
  aiAnswerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 6,
  },
  aiAnswerScroll: {
    maxHeight: 140,
    marginBottom: 10,
  },
  aiAnswerCode: {
    fontSize: 13,
    fontFamily: "monospace",
    color: "#333",
  },
  aiPreviewBox: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  sliderContainer: {
    backgroundColor: "#FFF8E1",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  sliderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#C47F00",
    textAlign: "center",
    marginBottom: 6,
  },
  sliderSubtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  sliderCodeBox: {
    backgroundColor: "#0d1117",
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  sliderCode: {
    color: "#EAEAEA",
    fontFamily: "monospace",
    fontSize: 13,
  },
  sliderPreview: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  sliderButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sliderNavButton: {
    backgroundColor: "#F5B700",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sliderNavText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  sliderDotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  sliderDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#FFE082",
    marginHorizontal: 3,
  },
  sliderDotActive: {
    backgroundColor: "#F5B700",
    transform: [{ scale: 1.2 }],
  },
  quizWrapper: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#B2DFDB",
    marginTop: 16,
    marginBottom: 24,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#004D40",
    textAlign: "center",
    marginBottom: 10,
  },
  quizButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  quizNavBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  quizNavText: {
    fontWeight: "700",
    fontSize: 14,
  },
  quizHint: {
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
});

