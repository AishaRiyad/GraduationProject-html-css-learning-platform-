// backend/src/controllers/quizController.js
import {
  getFirstQuiz,
  getQuizForTopic,
  getLevels,
  getQuestionsByLevel,
  getProgress,
  upsertProgress,
  getUserDisplayName,
} from "../models/quizModel.js";

const DEFAULT_PROGRESS = { unlockedLevelIds: [1], scores: {} };

/* ---------- helpers for namespaced topic progress ---------- */
function isNamespaced(obj) {
  return obj && typeof obj === "object" && ("html" in obj || "css" in obj || "js" in obj);
}
function pickTopicProgress(raw, topic) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PROGRESS };
  if (isNamespaced(raw)) return raw[topic] || { ...DEFAULT_PROGRESS };
  return topic === "html" ? raw : { ...DEFAULT_PROGRESS };
}
function mergeTopicProgress(raw, topic, topicData) {
  const base = raw && typeof raw === "object" ? raw : {};
  if (isNamespaced(base)) {
    return { ...base, [topic]: topicData };
  }
 
  const legacy = { html: base };
  return { ...legacy, [topic]: topicData };
}

/**
 * GET /api/quiz/:topic/levels
 */
export async function getQuizByTopic(req, res) {
  try {
    const topic = String(req.params.topic || "html").toLowerCase();
    const quiz = await getQuizForTopic(topic);

    if (!quiz) {
      return res.status(404).json({ ok: false, message: "Quiz not found" });
    }

    const rawLevels = await getLevels(quiz.id, topic);
    const levels = [];
    for (const lvl of rawLevels || []) {
      try {
        const questions = await getQuestionsByLevel(lvl.level_id || lvl.id || 1);
        levels.push({
          id: Number(lvl.id ?? lvl.level_number ?? 1),
          title: lvl.title || `Level ${lvl.id}`,
          description: lvl.description || "",
          passThreshold: Number(lvl.pass_threshold ?? 6),
          questions: questions || [],
        });
      } catch (innerErr) {
        console.error("⚠️ Error loading questions for level:", lvl?.id, innerErr);
      }
    }

    return res.json({ ok: true, quizId: quiz.id, version: quiz.version ?? 1, levels });
  } catch (err) {
    console.error("🔥 getQuizByTopic error:", err);
    return res.status(500).json({ ok: false, message: err.message || "Internal server error" });
  }
}

/**
 * GET /api/quiz/progress/:quizId/:userId
 * GET /api/quiz/progress/:quizId
 * query: ?topic=html|css
 */
export async function getUserProgress(req, res) {
  try {
    const quizId = Number(req.params.quizId);
    const userId = Number(req.user?.id || req.params.userId);
    const topic = String(req.query.topic || "html").toLowerCase();

    if (!quizId || !userId) {
      return res.status(400).json({ ok: false, message: "quizId and userId required" });
    }

    const whole = await getProgress(userId, quizId);
    const topicProgress = pickTopicProgress(whole, topic);
    return res.json(topicProgress || DEFAULT_PROGRESS);
  } catch (err) {
    console.error("getUserProgress error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}

/**
 * POST /api/quiz/progress
 * Body: { quizId, userId, topic, unlockedLevelIds, scores }
 */
export async function saveUserProgress(req, res) {
  try {
    const body = req.body || {};
    const flat = body.next ? { ...body, ...body.next } : body;

    const quizId = Number(flat.quizId);
    const userId = Number(req.user?.id || flat.userId);
    const topic = String(flat.topic || "html").toLowerCase();

    if (!quizId || !userId) {
      return res.status(400).json({ ok: false, message: "quizId and userId required" });
    }

    const unlockedLevelIds = coerceArray(flat.unlockedLevelIds, [1]);
    const scores = coerceObject(flat.scores, {});

    // اقرأ الكل، وعدّل قسم الـ topic فقط
    const whole = await getProgress(userId, quizId);
    const merged = mergeTopicProgress(whole, topic, { unlockedLevelIds, scores });

    // خزّن "الكائن الكامل" (namespaced) في قاعدة البيانات
    await upsertProgress(userId, quizId, merged, merged);

    return res.json({ ok: true });
  } catch (err) {
    console.error("saveUserProgress error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}


/**
 * GET /api/quiz/certificate/:topic
 */
export async function getCertificate(req, res) {
  try {
    const topic = String(req.params.topic || "html").toLowerCase();

    const quiz = await getQuizForTopic(topic);

    if (!quiz) {
      return res.status(404).json({ ok: false, message: "Quiz not found" });
    }

    const rawLevels = await getLevels(quiz.id, topic);
    if (!rawLevels || !rawLevels.length) {
      return res.json({ ok: true, finished: false });
    }

    const userId = Number(req.user?.id || req.query.userId);
    if (!userId) {
      return res.status(400).json({ ok: false, message: "User not found" });
    }

    const whole = await getProgress(userId, quiz.id);
    const topicProgress = pickTopicProgress(whole, topic); 

    const scores = topicProgress?.scores || {};

    const levelIds = rawLevels.map((lvl) =>
      Number(lvl.id ?? lvl.level_id ?? lvl.level_number)
    );

    const finished =
      levelIds.length > 0 &&
      levelIds.every((id) => scores[id] && scores[id].passed === true);

    if (!finished) {
      return res.json({ ok: true, finished: false });
    }

   
    const name = await getUserDisplayName(userId);

    return res.json({
      ok: true,
      finished: true,
      certificate: {
        userId,
        name: name || "Student",
        topic,
        quizId: quiz.id,
        completedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("getCertificate error:", err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
  }
}


/* -------- helpers to accept flexible payloads from frontend -------- */
function coerceArray(x, fallback = []) {
  if (Array.isArray(x)) return x;
  if (typeof x === "string") {
    try {
      const parsed = JSON.parse(x);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return x.split(",").map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
    }
  }
  return fallback;
}
function coerceObject(x, fallback = {}) {
  if (x && typeof x === "object" && !Array.isArray(x)) return x;
  if (typeof x === "string") {
    try {
      const parsed = JSON.parse(x);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

