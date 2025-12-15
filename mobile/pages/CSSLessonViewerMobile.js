// File: pages/CSSLessonViewerMobile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";

const API = "http://10.0.2.2:5000";

export default function CSSLessonViewerMobile({ route, navigation }) {
  const { lessonId, lessonIndex, allLessons } = route.params;

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ============================
        Load Lesson
  ============================ */
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/css-lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data);
      } catch (err) {
        console.log("❌ Error loading CSS lesson:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );

  if (!lesson)
    return (
      <View style={styles.center}>
        <Text>Lesson not found</Text>
      </View>
    );

  /* ============================
        Next / Prev Navigation
  ============================ */
  const hasNext = lessonIndex < allLessons.length - 1;
  const hasPrev = lessonIndex > 0;

  const goNext = () => {
    if (!hasNext) return;
    const next = allLessons[lessonIndex + 1];
    navigation.replace("CSSLessonViewer", {
      lessonId: next.id,
      lessonIndex: lessonIndex + 1,
      allLessons,
    });
  };

  const goPrev = () => {
    if (!hasPrev) return;
    const prev = allLessons[lessonIndex - 1];
    navigation.replace("CSSLessonViewer", {
      lessonId: prev.id,
      lessonIndex: lessonIndex - 1,
      allLessons,
    });
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          CSS Lesson
        </Text>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{lesson.title}</Text>

        {/* Sections */}
        {lesson.sections?.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            {section.heading && (
              <Text style={styles.heading}>{section.heading}</Text>
            )}

            {/* Clean HTML → plain text */}
            {section.content && (
              <Text style={styles.textContent}>
                {section.content
                  .replace(/<br\s*\/?>/gi, "\n")
                  .replace(/<[^>]+>/g, "")}
              </Text>
            )}

            {/* Image */}
            {section.image && (
              <Image
                source={{
                  uri: section.image.startsWith("http")
                    ? section.image
                    : `${API}${section.image}`,
                }}
                style={styles.image}
                resizeMode="contain"
              />
            )}

            {/* Video */}
            {section.video && (
              <View style={styles.videoBox}>
                <WebView
                  originWhitelist={["*"]}
                  style={styles.video}
                  source={{
                    html: `
                      <html>
                        <body style="margin:0;background:#000">
                          <video controls style="width:100%;height:100%">
                            <source src="${section.video}" />
                          </video>
                        </body>
                      </html>
                    `,
                  }}
                />
              </View>
            )}

            {/* Main Code */}
            {section.code && (
              <View style={styles.codeBox}>
                <Text style={styles.codeTitle}>💻 Code Example:</Text>
                <ScrollView horizontal style={styles.codeScroll}>
                  <Text style={styles.codeText}>{section.code.content}</Text>
                </ScrollView>
              </View>
            )}

            {/* Sub Example */}
            {section.sub_example && (
              <View style={styles.codeBox}>
                <Text style={[styles.codeTitle, { color: "#15803D" }]}>
                  📄 {section.sub_example.heading}
                </Text>
                <ScrollView horizontal style={styles.codeScroll}>
                  <Text style={styles.codeText}>
                    {section.sub_example.content}
                  </Text>
                </ScrollView>
              </View>
            )}

            {/* Code demo */}
            {section.type === "code-demo" && (
              <CSSCodeDemoMobile section={section} />
            )}

            {section.note && (
              <Text style={styles.note}>{section.note}</Text>
            )}
          </View>
        ))}

        {/* Navigation Buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity
            disabled={!hasPrev}
            style={[styles.navButton, !hasPrev && styles.disabled]}
            onPress={goPrev}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={!hasNext}
            style={[styles.navButtonNext, !hasNext && styles.disabled]}
            onPress={goNext}
          >
            <Text style={styles.navButtonNextText}>Next →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating AI Assistant */}
      <CSSAiAssistantMobile
        allLessons={allLessons}
        navigation={navigation}
      />
    </View>
  );
}

/* ============================
   CODE-DEMO (HTML + CSS + Preview)
============================ */
function CSSCodeDemoMobile({ section }) {
  const [currentCss, setCurrentCss] = useState(
    section.css || section.cssVariants?.[0]?.css || ""
  );
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);

  const cssVariants = section.cssVariants || [];
  const html = section.html || "";

  return (
    <View style={styles.liveBox}>
      <Text style={styles.liveTitle}>🎨 Example & Live Result</Text>

      {/* HTML */}
      {html ? (
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>💻 HTML Code:</Text>
          <ScrollView horizontal style={styles.codeScroll}>
            <Text style={styles.codeText}>{html}</Text>
          </ScrollView>
        </View>
      ) : null}

      {/* CSS */}
      {(section.css || cssVariants.length > 0) && (
        <View style={styles.subSection}>
          <Text style={styles.subTitle}>🎨 CSS Code:</Text>

          {/* CSS Variants Buttons */}
          {cssVariants.length > 0 && (
            <View style={styles.variantRow}>
              {cssVariants.map((variant, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setCurrentCss(variant.css);
                    setCurrentVariantIndex(i);
                  }}
                  style={[
                    styles.variantButton,
                    currentVariantIndex === i && styles.variantButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.variantText,
                      currentVariantIndex === i && styles.variantTextActive,
                    ]}
                  >
                    {variant.name || `Style ${i + 1}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ScrollView horizontal style={styles.codeScroll}>
            <Text style={styles.codeText}>
              {currentCss || section.css || ""}
            </Text>
          </ScrollView>
        </View>
      )}

      {/* Live Preview */}
      <Text style={styles.subTitle}>🧩 Live Result:</Text>
      <View style={styles.previewBox}>
        <WebView
          originWhitelist={["*"]}
          style={styles.previewWebView}
          source={{
            html: `
              <html>
                <head>
                  <style>body { font-family: Arial; padding: 10px; }</style>
                  <style>${currentCss}</style>
                </head>
                <body>${html}</body>
              </html>
            `,
          }}
        />
      </View>
    </View>
  );
}

/* ============================
   AI ASSISTANT MOBILE
============================ */
function CSSAiAssistantMobile({ allLessons, navigation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post(`${API}/api/ai-local/css-smart-search`, {
        question,
      });
      const data = res.data;
      setResponse(data);

      if (data.lessonId) {
        const idx = allLessons.findIndex((l) => l.id === data.lessonId);
        if (idx !== -1) {
          navigation.replace("CSSLessonViewer", {
            lessonId: data.lessonId,
            lessonIndex: idx,
            allLessons,
          });
        }
      }
    } catch (err) {
      console.log("❌ Error asking AI:", err);
      setResponse({ explanation: "⚠️ Failed to connect to AI service." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <TouchableOpacity style={styles.aiButton} onPress={() => setIsOpen(!isOpen)}>
        <Text style={{ fontSize: 26 }}>🤖</Text>
      </TouchableOpacity>

      {/* Panel */}
      {isOpen && (
        <View style={styles.aiPanel}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>AI CSS Helper</Text>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Text style={styles.aiClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.aiInput}
            multiline
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask about CSS..."
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity
            onPress={handleAsk}
            disabled={loading}
            style={styles.aiAskButton}
          >
            <Text style={styles.aiAskText}>
              {loading ? "Thinking..." : "Ask AI"}
            </Text>
          </TouchableOpacity>

          {response && (
            <View style={styles.aiResponseBox}>
              <Text style={styles.aiResponseText}>{response.explanation}</Text>
              {response.lesson && (
                <Text style={styles.aiSuggested}>
                  🎯 Suggested Lesson: <Text style={{ fontWeight: "700" }}>{response.lesson}</Text>
                </Text>
              )}
            </View>
          )}
        </View>
      )}
    </>
  );
}

/* ============================
   STYLES
============================ */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#EEF2FF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#E0E7FF",
    borderRadius: 999,
  },
  backText: { color: "#4338CA", fontWeight: "600" },
  topTitle: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  container: { padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#1D4ED8", marginBottom: 14 },
  sectionCard: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  textContent: { fontSize: 14, lineHeight: 20, color: "#374151" },
  image: { width: "100%", height: 200, borderRadius: 10, marginVertical: 8 },
  videoBox: {
    height: 220,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  video: { width: "100%", height: "100%" },

  codeBox: { backgroundColor: "#F3F4F6", padding: 8, borderRadius: 10, marginVertical: 8 },
  codeTitle: { fontSize: 14, fontWeight: "700", color: "#1D4ED8", marginBottom: 4 },
  codeScroll: { maxHeight: 180 },
  codeText: { fontFamily: "monospace", fontSize: 12, color: "#111827" },

  note: { fontSize: 12, color: "#6B7280", marginTop: 6, fontStyle: "italic" },

  liveBox: {
    marginTop: 10,
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 12,
  },
  liveTitle: { fontSize: 16, fontWeight: "700", color: "#4F46E5", marginBottom: 6 },
  subSection: { marginVertical: 6 },
  subTitle: { fontSize: 14, fontWeight: "700", color: "#1D4ED8", marginBottom: 4 },

  variantRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  variantButton: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  variantButtonActive: { backgroundColor: "#4ADE80" },
  variantText: { fontSize: 12, color: "#111827" },
  variantTextActive: { color: "#065F46", fontWeight: "700" },

  previewBox: {
    height: 260,
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  previewWebView: { width: "100%", height: "100%" },

  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  navButton: {
    flex: 1,
    marginRight: 4,
    padding: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  navButtonNext: {
    flex: 1,
    marginLeft: 4,
    padding: 10,
    borderRadius: 999,
    backgroundColor: "#FACC15",
    alignItems: "center",
  },
  navButtonText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  navButtonNextText: { fontSize: 14, fontWeight: "600", color: "#111827" },
  disabled: { opacity: 0.5 },

  aiButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  aiPanel: {
    position: "absolute",
    bottom: 96,
    right: 16,
    width: 280,
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 6,
  },
  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiTitle: { fontSize: 14, fontWeight: "700", color: "#1D4ED8" },
  aiClose: { fontSize: 20, color: "#6B7280" },

  aiInput: {
    marginTop: 8,
    minHeight: 60,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: "#111827",
  },
  aiAskButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 8,
    alignItems: "center",
  },
  aiAskText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  aiResponseBox: { marginTop: 8 },
  aiResponseText: { fontSize: 13, color: "#374151" },
  aiSuggested: { marginTop: 4, fontSize: 12, color: "#6B7280" },
});
