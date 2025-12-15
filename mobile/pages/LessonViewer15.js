// mobile/screens/LessonViewer15Mobile.js

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";

const API = "http://10.0.2.2:5000";
const FINAL_STEP_INDEX = 6; // مثل الويب

export default function LessonViewer15Mobile() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const navigation = useNavigation();

  // 🧠 تحميل الدرس من الباكند
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/41`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load Lesson 15", e);
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

  const totalSteps = lesson.sections.length - 2; // نفس منطق الويب (بدون الخاتمة)
  const progress = Math.min(((currentStep + 1) / totalSteps) * 100, 100);
  const section = lesson.sections[currentStep];

  // ✅ نفس فكرة handleEvaluationResult في الويب
  const handleEvaluationResult = (result) => {
    console.log("🧠 Raw evaluation result:", result);
    setEvaluation(result);

    const numericScore =
      Number(result.stepScore ?? result.score ?? 0) || 0;
    setFinalScore(numericScore);

    const scoreForStep = result.score ?? numericScore;

    // نعتبر النجاح من 70 فأكثر للتقدم للخطوة التالية
    if (scoreForStep >= 70) {
      setCompletedSteps((prev) =>
        prev.includes(currentStep) ? prev : [...prev, currentStep]
      );

      const isFinalStep = currentStep === FINAL_STEP_INDEX;
      if (!isFinalStep) {
        // باقي الخطوات: تقدّم فقط بدون شهادة
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          setEvaluation(null);
        }, 1200);
      } else {
        // الخطوة الأخيرة: ما منظهر الشهادة مباشرة، نخليها عند ضغط الزر
        console.log(
          "✅ Final step evaluation done. Waiting for user to view certificate."
        );
      }
    } else {
      console.log(
        "⚠️ Score below 70 — step not marked as completed automatically."
      );
    }
  };

  const handleNextOrCertificate = async () => {
    if (!evaluation) return;

    const scoreToSave =
      Number(finalScore) || Number(evaluation?.stepScore) || 0;
    const scoreForStep = evaluation.score ?? scoreToSave;

    if (currentStep === FINAL_STEP_INDEX) {
      // الخطوة الأخيرة
      if (scoreForStep < 80) {
        Alert.alert(
          "Keep Going",
          "You need a score of at least 80 to unlock the certificate."
        );
        return;
      }

      try {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");
        console.log("💾 Sending finalScore to DB:", scoreToSave);

        await axios.put(
          `${API}/api/auth/upgrade-level`,
          {
            userId,
            newLevel: "advanced",
            badge_name: "Basic Level Completed",
            badge_image: "basic_level_badge.png",
            score: scoreToSave,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("🏆 Achievement stored with score:", scoreToSave);
        setShowCertificate(true);
      } catch (err) {
        console.error("❌ Error saving achievement:", err);
        Alert.alert(
          "Error",
          "Failed to save your achievement. Please try again."
        );
      }
    } else {
      // لو لسه مش خطوة أخيرة (احتياطًا)
      setCurrentStep((prev) => prev + 1);
      setEvaluation(null);
    }
  };

  return (
    <View style={styles.screen}>
      {/* هيدر بسيط أعلى الدرس */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle} numberOfLines={1}>
          Lesson 15 — Final Project
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== العنوان ====== */}
        <View style={styles.lessonHeaderCard}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDescription}>
            {lesson.description}
          </Text>
        </View>

        {/* ====== شريط التقدم ====== */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {totalSteps} (
            {Math.round(progress)}% Complete)
          </Text>
        </View>

        {/* ====== المرحلة الحالية ====== */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>{section.title}</Text>

          {/* النصوص + ai-tool (StepCodeEditor) */}
          {Array.isArray(section.content) &&
            section.content.map((item, i) =>
              typeof item === "string" ? (
                <Text key={i} style={styles.stepText}>
                  {item}
                </Text>
              ) : item.type === "ai-tool" ? (
                <StepCodeEditorMobile
                  key={i}
                  lessonId={41}
                  step={currentStep + 1}
                  onEvaluate={handleEvaluationResult}
                />
              ) : null
            )}

          {/* النتيجة العامة + زر "Next" / "View Certificate" */}
          {evaluation && (
            <>
              <AIEvaluationResultMobile
                score={
                  evaluation.score ??
                  evaluation.stepScore ??
                  0
                }
                feedback={evaluation.feedback}
              />

              <View style={styles.nextButtonWrapper}>
                <TouchableOpacity
                  onPress={handleNextOrCertificate}
                  style={styles.nextButton}
                >
                  <Text style={styles.nextButtonText}>
                    {currentStep < FINAL_STEP_INDEX
                      ? "Next Step →"
                      : "View Certificate 🎓"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* رسالة تحفيزية بعد النجاح (لو بدك تشبهي الويب) */}
          {completedSteps.includes(currentStep) && !showCertificate && (
            <Text style={styles.successMessage}>
              ✅ Great! Step completed successfully. Next step
              unlocking...
            </Text>
          )}

          {/* زر Start Project في أول خطوة فقط (مثل الويب) */}
          {currentStep === 0 && !evaluation && (
            <View style={styles.startButtonWrapper}>
              <TouchableOpacity
                onPress={() => setCurrentStep(currentStep + 1)}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>
                  Start Project →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ====== الشهادة ====== */}
        {showCertificate && (
          <CertificateModalMobile
            onClose={() => setShowCertificate(false)}
          />
        )}
      </ScrollView>
    </View>
  );
}

/* =======================================
   StepCodeEditorMobile (نسخة الموبايل)
======================================= */
function StepCodeEditorMobile({
  lessonId,
  step,
  endpoint = `${API}/api/ai-local/evaluate-basic-project`,
  placeholder,
  onEvaluate,
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [output, setOutput] = useState("");

  const handleEvaluate = async () => {
    if (!code.trim()) {
      Alert.alert(
        "Missing Code",
        "Please write your HTML code before evaluating 📝"
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      const res = await axios.post(
        endpoint,
        { userId, lessonId, htmlCode: code, step },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(res.data);
      if (onEvaluate) onEvaluate(res.data);
    } catch (err) {
      console.error("❌ Evaluation Error:", err);
      const fallback = {
        feedback:
          "⚠️ Error connecting to AI Evaluator. Please try again.",
      };
      setResult(fallback);
      if (onEvaluate) onEvaluate(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = () => {
    if (!code.trim()) {
      Alert.alert(
        "No HTML",
        "Please enter some HTML code first 📝"
      );
      return;
    }
    setOutput(code);
  };

  return (
    <View style={styles.editorWrapper}>
      {/* محرر الكود */}
      <View style={styles.editorBox}>
        <Text style={styles.editorTitle}>HTML Code</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={
            placeholder || "Write your HTML code here..."
          }
          placeholderTextColor="#9ca3af"
          multiline
          textAlignVertical="top"
          style={styles.codeInput}
        />

        {/* الأزرار */}
        <View style={styles.editorButtonsRow}>
          <TouchableOpacity
            onPress={handleRunCode}
            style={styles.runButton}
          >
            <Text style={styles.runButtonText}>▶️ Run Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleEvaluate}
            disabled={loading}
            style={[
              styles.evaluateButton,
              loading && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.evaluateButtonText}>
              {loading ? "Evaluating..." : "Evaluate with AI"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Preview في WebView */}
      <View style={styles.previewBox}>
        <Text style={styles.previewTitle}>💻 Live Preview</Text>
        <WebView
          originWhitelist={["*"]}
          source={{
            html:
              output && output.trim().length > 0
                ? output
                : "<html><body style='font-family: sans-serif; padding: 10px;'><h3>Write your HTML and tap 'Run Code' to see the preview here.</h3></body></html>",
          }}
          style={styles.previewWebView}
        />
      </View>

      {/* نتيجة تقييم الـ AI الخاصة بالمحرر نفسه */}
      {result && (
        <View style={styles.aiResultBox}>
          {result.stepScore !== undefined && (
            <Text style={styles.aiResultScore}>
              🧮 Step Score:{" "}
              <Text
                style={
                  result.stepScore >= 80
                    ? styles.scoreHigh
                    : result.stepScore >= 60
                    ? styles.scoreMedium
                    : styles.scoreLow
                }
              >
                {result.stepScore} / 100
              </Text>
            </Text>
          )}

          {result.avgScore !== undefined && (
            <Text style={styles.aiResultAvg}>
              📊 Current Average:{" "}
              <Text style={styles.aiResultAvgValue}>
                {result.avgScore}%
              </Text>
            </Text>
          )}

          {result.feedback && (
            <Text style={styles.aiResultFeedback}>
              💬 <Text style={styles.aiResultFeedbackInner}>
                {result.feedback}
              </Text>
            </Text>
          )}

          {result.stepScore >= 80 && (
            <Text style={styles.stepSuccessMsg}>
              Great job! You can move to the next step 🎯
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

/* =======================================
   AIEvaluationResultMobile
======================================= */
function AIEvaluationResultMobile({ score, feedback }) {
  const passed = Number(score) >= 80;

  return (
    <View style={styles.globalResultBox}>
      {passed && (
        <Text style={styles.globalResultText}>
          ✅ Great job! You passed the Basic Level.
        </Text>
      )}
    </View>
  );
}

/* =======================================
   CertificateModalMobile
======================================= */
function CertificateModalMobile({ onClose }) {
  return (
    <Modal animationType="fade" transparent>
      <View style={styles.certificateOverlay}>
        <View style={styles.certificateCard}>
          <Text style={styles.certificateTitle}>
            🎓 Congratulations!
          </Text>
          <Text style={styles.certificateText}>
            You’ve successfully completed the{" "}
            <Text style={{ fontWeight: "700" }}>Basic Level</Text> and
            unlocked the{" "}
            <Text style={{ fontWeight: "700" }}>Advanced Level</Text>!
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.certificateButton}
          >
            <Text style={styles.certificateButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* =======================================
   STYLES
======================================= */

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF3C7", // خلفية صفراء فاتحة
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: "#FFFBEB",
    borderBottomWidth: 1,
    borderBottomColor: "#FCD34D",
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FEF3C7",
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
    paddingBottom: 40,
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

  progressBarWrapper: {
    marginBottom: 16,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FBBF24",
  },
  progressText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },

  stepCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#FACC15",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#A66300",
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    lineHeight: 20,
  },

  editorWrapper: {
    marginTop: 10,
  },
  editorBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FCD34D",
    padding: 10,
    marginBottom: 12,
  },
  editorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#A66300",
    marginBottom: 6,
  },
  codeInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 8,
    fontSize: 13,
    color: "#111827",
    fontFamily: "monospace",
    backgroundColor: "#F9FAFB",
  },
  editorButtonsRow: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-between",
    gap: 8,
  },
  runButton: {
    flex: 1,
    backgroundColor: "#22C55E",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  runButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  evaluateButton: {
    flex: 1,
    backgroundColor: "#F59E0B",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  evaluateButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  previewBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#A66300",
    marginBottom: 6,
    textAlign: "center",
  },
  previewWebView: {
    width: "100%",
    height: 260,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },

  aiResultBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFBEB",
  },
  aiResultScore: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },
  scoreHigh: {
    color: "#16A34A",
  },
  scoreMedium: {
    color: "#CA8A04",
  },
  scoreLow: {
    color: "#DC2626",
  },
  aiResultAvg: {
    marginTop: 4,
    fontSize: 13,
    color: "#374151",
  },
  aiResultAvgValue: {
    fontWeight: "600",
    color: "#A16207",
  },
  aiResultFeedback: {
    marginTop: 6,
    fontSize: 13,
    color: "#374151",
    lineHeight: 19,
  },
  aiResultFeedbackInner: {
    fontStyle: "italic",
  },
  stepSuccessMsg: {
    marginTop: 8,
    fontSize: 13,
    color: "#16A34A",
    fontWeight: "600",
  },

  globalResultBox: {
    marginTop: 16,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  globalResultText: {
    textAlign: "center",
    fontSize: 14,
    color: "#15803D",
    fontWeight: "600",
  },

  nextButtonWrapper: {
    marginTop: 12,
    alignItems: "center",
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FBBF24",
    borderRadius: 999,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  successMessage: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
    color: "#15803D",
    fontWeight: "600",
  },

  startButtonWrapper: {
    marginTop: 16,
    alignItems: "center",
  },
  startButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F59E0B",
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  certificateOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  certificateCard: {
    width: width * 0.8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  certificateTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#A66300",
    marginBottom: 10,
  },
  certificateText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    marginBottom: 18,
  },
  certificateButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FBBF24",
  },
  certificateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
