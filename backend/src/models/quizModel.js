// backend/src/models/quizModel.js
import db from "../config/db.js";

/* ====================== QUIZ META ====================== */
export async function getFirstQuiz() {
  try {
    const [rows] = await db.execute("SELECT id, version FROM quizzes ORDER BY id LIMIT 1");
    if (rows.length) return { id: rows[0].id, version: rows[0].version ?? 1 };
  } catch (_) {}
  return { id: 1, version: 1 };
}

/* ====================== LEVELS ====================== */
export async function getLevels(quizId, topic /* optional */) {
  const sqlWithTopic = `
    SELECT id, level_number, title, description, pass_threshold
    FROM quiz_levels
    WHERE quiz_id = ? AND (? IS NULL OR topic = ?)
    ORDER BY level_number ASC
  `;
  try {
    const [rows] = await db.execute(sqlWithTopic, [quizId, topic || null, topic || null]);
    return rows.map((r) => ({
      id: Number(r.level_number),
      level_id: r.id,
      title: r.title,
      description: r.description,
      pass_threshold: Number(r.pass_threshold ?? 6),
    }));
  } catch {
    const [rows] = await db.execute(
      `SELECT id, level_number, title, description, pass_threshold
       FROM quiz_levels
       WHERE quiz_id = ?
       ORDER BY level_number ASC`,
      [quizId]
    );
    return rows.map((r) => ({
      id: Number(r.level_number),
      level_id: r.id,
      title: r.title,
      description: r.description,
      pass_threshold: Number(r.pass_threshold ?? 6),
    }));
  }
}

/* ====================== QUESTIONS ====================== */
export async function getQuestionsByLevel(levelDbId) {
  const [rows] = await db.execute(
    `SELECT text, q_type, tf_answer, options_json, correct_index
     FROM quiz_questions
     WHERE level_id = ?
     ORDER BY id ASC`,
    [levelDbId]
  );

  return rows.map((r) => {
    const type = String(r.q_type || "").toUpperCase();
    if (type === "TF") return { text: r.text, type: "TF", answer: !!r.tf_answer };

    let opts = [];
    try {
      opts = Array.isArray(r.options_json) ? r.options_json : JSON.parse(r.options_json || "[]");
    } catch (_) {
      opts = [];
    }

    return {
      text: r.text,
      type: "MC",
      options: opts,
      correctIndex: Number(r.correct_index ?? 0),
    };
  });
}

/* ====================== PROGRESS (MySQL) ====================== */
/**
 * ندعم شكلين:
 * 1) قديم (مسطّح): { unlockedLevelIds: number[], scores: object }
 * 2) جديد (namespaced): { html: {unlockedLevelIds, scores}, css: {...}, ... }
 *
 * التخزين: نحفظ "الكائن الكامل" نفسه في العمودين JSON لسهولة الاسترجاع والدعم الخلفي.
 */
export async function getProgress(userId, quizId) {
  const [rows] = await db.execute(
    `SELECT unlocked_level_ids, scores
     FROM quiz_progress
     WHERE user_id = ? AND quiz_id = ?`,
    [userId, quizId]
  );

  if (!rows.length) return { unlockedLevelIds: [1], scores: {} };

  const parseJSON = (x, fb) => {
    try {
      if (x == null) return fb;
      if (typeof x === "string") return JSON.parse(x || JSON.stringify(fb));
      return x;
    } catch {
      return fb;
    }
  };

  const rawUnlocked = parseJSON(rows[0].unlocked_level_ids, [1]);
  const rawScores = parseJSON(rows[0].scores, {});

  // إن كان المخزَّن كائن namespaced كامل (html/css ...) نعيده كما هو:
  const isNamespaced =
    rawUnlocked && typeof rawUnlocked === "object" && !Array.isArray(rawUnlocked) &&
    (rawUnlocked.html || rawUnlocked.css || rawUnlocked.js);

  if (isNamespaced) {
    return rawUnlocked; // الكائن الكامل
  }

  // غير ذلك: رجّع الشكل القديم المتوافق
  return { unlockedLevelIds: rawUnlocked || [1], scores: rawScores || {} };
}

/**
 * upsertProgress يدعم تمريـر:
 *  - شكل namespaced كامل في المتغير unlockedOrWhole (يفضّل)
 *  - أو الشكل القديم: unlockedLevelIds (array) + scores (object)
 *
 * التصرّف: نحفظ "الكائن الكامل" في عمودَيْ JSON مع CAST.
 */
export async function upsertProgress(userId, quizId, unlockedOrWhole, scoresMaybe) {
  let whole;

  // لو وصّلنا كائن namespaced كامل
  const looksNamespaced =
    unlockedOrWhole &&
    typeof unlockedOrWhole === "object" &&
    !Array.isArray(unlockedOrWhole) &&
    (unlockedOrWhole.html || unlockedOrWhole.css || unlockedOrWhole.js);

  if (looksNamespaced) {
    whole = unlockedOrWhole;
  } else {
    // شكل قديم: ابنِ كائن HTML افتراضي
    whole = {
      html: {
        unlockedLevelIds: Array.isArray(unlockedOrWhole) ? unlockedOrWhole : [1],
        scores: (scoresMaybe && typeof scoresMaybe === "object") ? scoresMaybe : {},
      },
    };
  }

  const wholeJSON = JSON.stringify(whole || { html: { unlockedLevelIds: [1], scores: {} } });

  const [exists] = await db.execute(
    "SELECT id FROM quiz_progress WHERE user_id = ? AND quiz_id = ?",
    [userId, quizId]
  );

  if (exists.length) {
    await db.execute(
      `UPDATE quiz_progress
       SET unlocked_level_ids = CAST(? AS JSON),
           scores             = CAST(? AS JSON),
           updated_at         = CURRENT_TIMESTAMP
       WHERE user_id = ? AND quiz_id = ?`,
      [wholeJSON, wholeJSON, userId, quizId]
    );
  } else {
    await db.execute(
      `INSERT INTO quiz_progress (user_id, quiz_id, unlocked_level_ids, scores, updated_at)
       VALUES (?, ?, CAST(? AS JSON), CAST(? AS JSON), CURRENT_TIMESTAMP)`,
      [userId, quizId, wholeJSON, wholeJSON]
    );
  }
  return { ok: true };
}



export async function getUserDisplayName(userId) {
  const [rows] = await db.execute(
    `
    SELECT 
      p.full_name AS fullName,
      u.name      AS userName,
      u.email     AS email
    FROM users u
    LEFT JOIN profile p ON p.user_id = u.id
    WHERE u.id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (!rows.length) return null;
  const row = rows[0];

  return row.fullName || row.userName || row.email || null;
}

export async function getQuizForTopic(topic) {
 
  const [rows] = await db.execute(
    `
    SELECT q.id, q.version
    FROM quizzes q
    JOIN quiz_levels l ON l.quiz_id = q.id
    WHERE l.topic = ?
    ORDER BY q.id ASC
    LIMIT 1
    `,
    [topic]
  );

  if (rows.length) {
    return {
      id: Number(rows[0].id),
      version: rows[0].version ?? 1,
    };
  }


  return getFirstQuiz();
}



