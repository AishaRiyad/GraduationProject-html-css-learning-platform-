import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "../services/api"; // نفس اللي استخدمتيه في LevelSelector

const API = "http://10.0.2.2:5000";

/* ============================
   Helpers for Quiz API
   (نفس منطق الويب، بس عبر axios)
============================ */
async function fetchQuiz(topic, token) {
  try {
    const res = await axios.get(`${API}/api/quiz/${topic}/levels`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ fetchQuiz error:", err);
    throw err;
  }
}



async function loadProgress(quizId, userId, topic, token) {
  try {
    const res = await axios.get(
      `${API}/api/quiz/progress/${quizId}/${userId}?topic=${topic}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("❌ loadProgress error:", err);
    return { unlockedLevelIds: [1], scores: {} };
  }
}


async function saveProgress(payload, token) {
  try {
    const res = await axios.post(
      `${API}/api/quiz/progress`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (err) {
    console.error("❌ saveProgress error:", err);
  }
}


/* ============================
   Circle Button (مثل الويب)
============================ */
function CircleButton({ children, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.circleButton,
        disabled && styles.circleButtonDisabled,
      ]}
    >
      <Text style={styles.circleButtonText}>{children}</Text>
    </TouchableOpacity>
  );
}

/* ============================
   Progress Bar
============================ */
function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <View style={styles.progressBar}>
      <View style={styles.progressTrack} />
      <View style={[styles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}

/* ============================
   Badge
============================ */
function Badge({ children }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}

/* ============================
   Main Screen: AdvancedQuiz
============================ */
export default function AdvancedQuiz({ navigation }) {
  const [topic, setTopic] = useState("html"); // html | css
  const [quizId, setQuizId] = useState(null);
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState({
    unlockedLevelIds: [1],
    scores: {},
  });
  const [activeLevel, setActiveLevel] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  // 🔹 تحميل userId + token
  useEffect(() => {
    const loadUser = async () => {
      try {
        const t = await AsyncStorage.getItem("token");
        setToken(t || null);

        const profile = await getProfile();
        // بافترض إن الـ profile فيه id
        setUserId(profile.id);
      } catch (err) {
        console.log("❌ Failed to load user profile:", err);
      }
    };
    loadUser();
  }, []);

  // 🔹 تحميل الكويز بناءً على الـ topic + userId
  useEffect(() => {
    if (!userId || !token) return;

    let cancelled = false;

    const loadQuiz = async () => {
      try {
        setLoading(true);

        const data = await fetchQuiz(topic, token);
        if (cancelled) return;

        setQuizId(data.quizId);
        setLevels(Array.isArray(data.levels) ? data.levels : []);

        const p = await loadProgress(data.quizId, userId, topic, token);
        if (cancelled) return;

        setProgress(
          p || {
            unlockedLevelIds: [1],
            scores: {},
          }
        );
        setActiveLevel(null);
        setResult(null);
      } catch (err) {
        console.error("❌ Failed to load quiz:", err);
        setLevels([]);
        setProgress({ unlockedLevelIds: [1], scores: {} });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadQuiz();

    return () => {
      cancelled = true;
    };
  }, [userId, token, topic]);

  function openLevel(level) {
    if (!progress.unlockedLevelIds.includes(level.id)) return;
    setActiveLevel(level);
    setResult(null);
  }

  async function onFinished(correct, total, passed) {
    if (!activeLevel || !token || !userId) return;

    const next = {
      ...progress,
      scores: {
        ...progress.scores,
        [activeLevel.id]: { correct, total, passed },
      },
      unlockedLevelIds: [...progress.unlockedLevelIds],
    };

    if (passed) {
      const nextId = activeLevel.id + 1;
      if (
        levels.some((x) => x.id === nextId) &&
        !next.unlockedLevelIds.includes(nextId)
      ) {
        next.unlockedLevelIds = [...next.unlockedLevelIds, nextId];
      }
    }

    setProgress(next);
    setActiveLevel(null);
    setResult({
      correct,
      total,
      passed,
      levelId: activeLevel.id,
      title: activeLevel.title,
    });

    try {
      await saveProgress(
        {
          quizId,
          userId,
          topic,
          unlockedLevelIds: next.unlockedLevelIds,
          scores: next.scores,
        },
        token
      );
    } catch (err) {
      console.error("❌ Failed to save progress:", err);
    }
  }

  const completed = useMemo(
    () =>
      Object.values(progress.scores || {}).filter((s) => s?.passed).length,
    [progress]
  );

  const TITLE =
    topic === "css"
      ? "🌿 CSS Adventure Map 🌼"
      : "🌸 HTML Adventure Map 🌼";

  if (loading || !token || !userId) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 8, color: "#4B5563" }}>
          Loading quiz...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Top bar مع زر رجوع */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>
          HTML + CSS Quiz
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Topic Tabs */}
        <View style={styles.topicTabs}>
          <TouchableOpacity
            style={[
              styles.topicButton,
              topic === "html" && styles.topicButtonActive,
            ]}
            onPress={() => setTopic("html")}
          >
            <Text
              style={[
                styles.topicButtonText,
                topic === "html" && styles.topicButtonTextActive,
              ]}
            >
              HTML
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.topicButton,
              topic === "css" && styles.topicButtonActive,
            ]}
            onPress={() => setTopic("css")}
          >
            <Text
              style={[
                styles.topicButtonText,
                topic === "css" && styles.topicButtonTextActive,
              ]}
            >
              CSS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Header / Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{TITLE}</Text>
          <Text style={styles.heroSub}>
            Complete each level in sequence. Each level contains all its
            questions on one page.
          </Text>

          <View style={styles.heroStatsRow}>
            <Badge>
              Completed: {completed} / {levels.length || 0}
            </Badge>
            <Badge>
              Unlocked: {progress.unlockedLevelIds?.length || 1}
            </Badge>
          </View>
        </View>

        {/* Map (Levels list) */}
        {!activeLevel && (
          <View style={styles.levelsContainer}>
            {levels.map((lvl) => {
              const unlocked = progress.unlockedLevelIds.includes(lvl.id);
              const passed = progress.scores?.[lvl.id]?.passed;

              return (
                <TouchableOpacity
                  key={lvl.id}
                  style={[
                    styles.levelCard,
                    !unlocked && styles.levelCardLocked,
                    passed && styles.levelCardPassed,
                  ]}
                  onPress={() => unlocked && openLevel(lvl)}
                  disabled={!unlocked}
                >
                  <View style={styles.levelHeaderRow}>
                    <Text style={styles.levelNumber}>#{lvl.id}</Text>
                    <Text
                      style={[
                        styles.levelChip,
                        passed && styles.levelChipPassed,
                        !unlocked && styles.levelChipLocked,
                      ]}
                    >
                      {passed ? "Passed" : unlocked ? "Start" : "Locked"}
                    </Text>
                  </View>
                  <Text style={styles.levelTitle}>{lvl.title}</Text>
                </TouchableOpacity>
              );
            })}

            <Text style={styles.noteText}>
              Pass each level with at least{" "}
              <Text style={{ fontWeight: "700" }}>
                {levels[0]?.passThreshold ?? 6}
              </Text>{" "}
              correct answers to unlock the next.
            </Text>
          </View>
        )}

        {/* Play mode */}
        {activeLevel && (
          <PlayMobile
            level={activeLevel}
            onExit={() => setActiveLevel(null)}
            onFinished={onFinished}
          />
        )}
      </ScrollView>

      {/* Result Modal */}
      <Modal
        visible={!!result}
        transparent
        animationType="fade"
        onRequestClose={() => setResult(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Result</Text>
            {result && (
              <>
                <Text style={styles.resultLine}>
                  {result.correct} / {result.total} (
                  {Math.round(
                    (result.correct / result.total) * 100
                  )}
                  %)
                </Text>
                <Text
                  style={[
                    styles.resultState,
                    result.passed ? styles.resultStateOk : styles.resultStateBad,
                  ]}
                >
                  {result.passed
                    ? "Success! Next level unlocked 🎉"
                    : "Try again 💪"}
                </Text>
                <View style={{ marginVertical: 8 }}>
                  <Badge>Levels completed: {completed}</Badge>
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => setResult(null)}
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ============================
   Play Component (Mobile)
============================ */
function PlayMobile({ level, onExit, onFinished }) {
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [lock, setLock] = useState(false);

  const questions = Array.isArray(level.questions) ? level.questions : [];
  const q = questions[i];

  if (!q) {
    return (
      <View style={styles.playCard}>
        <View style={styles.playTopRow}>
          <TouchableOpacity onPress={onExit} style={styles.backGhostButton}>
            <Text style={styles.backGhostText}>← Back to Map</Text>
          </TouchableOpacity>
          <Text style={styles.playTitle}>
            Level {level.id}:{" "}
            <Text style={styles.playTitleMain}>{level.title}</Text>
          </Text>
        </View>
        <Text style={{ marginTop: 12, color: "#4B5563" }}>
          ⚠️ No questions found for this level.
        </Text>
      </View>
    );
  }

  const totalQs = questions.length;
  const fallback = Math.min(totalQs, Math.ceil(totalQs * 0.6));
  const threshold = Math.min(
    totalQs,
    typeof level.passThreshold === "number" ? level.passThreshold : fallback
  );

  function advance(isOk) {
    if (isOk) setCorrect((c) => c + 1);
    setLock(true);

    setTimeout(() => {
      if (i + 1 < totalQs) {
        setI((prev) => prev + 1);
        setLock(false);
      } else {
        const finalCorrect = isOk ? correct + 1 : correct;
        onFinished(finalCorrect, totalQs, finalCorrect >= threshold);
      }
    }, 400);
  }

  function answerTF(val) {
    if (lock) return;
    const isOk = !!val === !!q.answer;
    advance(isOk);
  }

  function answerMC(index) {
    if (lock) return;
    const isOk = index === q.correctIndex;
    advance(isOk);
  }

  return (
    <View style={styles.playCard}>
      <View style={styles.playTopRow}>
        <TouchableOpacity onPress={onExit} style={styles.backGhostButton}>
          <Text style={styles.backGhostText}>← Back to Map</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.playTitle}>
            Level {level.id}:{" "}
            <Text style={styles.playTitleMain}>{level.title}</Text>
          </Text>
          <Text style={styles.playMuted}>
            {i + 1} / {totalQs}
          </Text>
        </View>
      </View>

      <ProgressBar value={i} max={totalQs} />

      <Text style={styles.questionText}>{q.text}</Text>

      <View style={styles.choicesRow}>
        {q.type === "TF" ? (
          <>
            <CircleButton onPress={() => answerTF(true)} disabled={lock}>
              True
            </CircleButton>
            <CircleButton onPress={() => answerTF(false)} disabled={lock}>
              False
            </CircleButton>
          </>
        ) : (
          (q.options || []).map((opt, idx) => (
            <CircleButton
              key={idx}
              onPress={() => answerMC(idx)}
              disabled={lock}
            >
              {opt}
            </CircleButton>
          ))
        )}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          Question: {i + 1}/{totalQs}
        </Text>
        <Text style={styles.metaText}>Correct: {correct}</Text>
      </View>
    </View>
  );
}

/* ============================
   STYLES
============================ */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#EEF2FF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E0E7FF",
    borderRadius: 999,
  },
  backText: {
    color: "#4338CA",
    fontWeight: "600",
  },
  topTitle: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },

  topicTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  topicButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5F5",
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  topicButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  topicButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  topicButtonTextActive: {
    color: "#FFFFFF",
  },

  heroCard: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4B5563",
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: "#4B5563",
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FCD34D",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },

  levelsContainer: {
    marginTop: 12,
  },
  levelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  levelCardLocked: {
    opacity: 0.5,
  },
  levelCardPassed: {
    borderColor: "#4ADE80",
    backgroundColor: "#ECFDF3",
  },
  levelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4B5563",
  },
  levelChip: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    color: "#111827",
    fontWeight: "600",
  },
  levelChipPassed: {
    backgroundColor: "#4ADE80",
    color: "#065F46",
  },
  levelChipLocked: {
    backgroundColor: "#E5E7EB",
    color: "#6B7280",
  },
  levelTitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  noteText: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
  },

  playCard: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  playTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backGhostButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
  },
  backGhostText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "600",
  },
  playTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  playTitleMain: {
    fontWeight: "800",
    color: "#4F46E5",
  },
  playMuted: {
    fontSize: 11,
    color: "#6B7280",
  },

  questionText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  choicesRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  circleButton: {
    minWidth: 80,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  circleButtonDisabled: {
    opacity: 0.6,
  },
  circleButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },

  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 8,
  },
  progressTrack: {
    ...StyleSheet.absoluteFillObject,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  resultLine: {
    fontSize: 14,
    marginBottom: 6,
  },
  resultState: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  resultStateOk: {
    color: "#16A34A",
  },
  resultStateBad: {
    color: "#DC2626",
  },
  doneButton: {
    marginTop: 8,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
