import db from "../config/db.js";
import fs from "fs";
import path from "path";

export const initializeFirstLessonIfNeeded = (userId, level) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.id
      FROM lesson_progress p
      JOIN lessons l ON l.id = p.lesson_id
      WHERE p.user_id = ? AND l.level = ?;
    `;

    db.query(query, [userId, level], (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
        console.log("✅ Progress already initialized");
        return resolve(); // موجود، ما تعمل إشي
      }

      // أنشئ فقط للدرس الأول
      const insertQuery = `
        INSERT INTO lesson_progress (user_id, lesson_id, is_unlocked, is_completed)
        VALUES (?, (SELECT id FROM lessons WHERE level = ? AND lesson_order = 1 LIMIT 1), TRUE, FALSE);
      `;

      db.query(insertQuery, [userId, level], (err2) => {
        if (err2) return reject(err2);
        console.log("✅ First lesson progress initialized");
        resolve();
      });
    });
  });
};

/**
 * ✅ 1. جلب كل الدروس حسب المستوى وحالة المستخدم
 */
export const getLessonsByLevel = async (req, res) => {
  const { userId, level } = req.params;

  try {
    const [lessons] = await db.execute(
      `
      SELECT 
        l.id,
        l.title,
        l.lesson_order,
        l.level,
        COALESCE(lp.is_unlocked, 0) AS is_unlocked,
        COALESCE(lp.is_completed, 0) AS is_completed,
        COALESCE(lp.quiz_score, 0) AS quiz_score,
        COALESCE(lp.quiz_passed, 0) AS quiz_passed
      FROM lessons l
      LEFT JOIN lesson_progress lp
        ON l.id = lp.lesson_id AND lp.user_id = ?
      WHERE l.level = ?
      ORDER BY l.lesson_order ASC
      `,
      [userId, level]
    );

    res.json(lessons);
  } catch (err) {
    console.error("❌ Error fetching lessons by level:", err);
    res.status(500).json({ message: "Error fetching lessons", error: err });
  }
};


/**
 * ✅ 3. تحديث تقدم المستخدم بعد الكويز
 */
export const completeLesson = async (req, res) => {
  const { userId, lessonId, quiz_score, quiz_passed } = req.body;
  console.log("📘 Updating progress:", { userId, lessonId, quiz_score, quiz_passed });

  try {
    // ✅ تحديث الدرس الحالي
    const [result] = await db.execute(
  "UPDATE lesson_progress SET quiz_score=?, quiz_passed=?, is_completed=? WHERE user_id=? AND lesson_id=?",
  [quiz_score, quiz_passed, quiz_passed, userId, lessonId]
);

if (result.affectedRows === 0) {
  console.warn("⚠️ No row updated — inserting new record instead");
  await db.execute(
    "INSERT INTO lesson_progress (user_id, lesson_id, is_unlocked, is_completed, quiz_score, quiz_passed) VALUES (?, ?, TRUE, ?, ?, ?)",
    [userId, lessonId, quiz_passed, quiz_score, quiz_passed]
  );
}


    // ✅ لو نجح، أضف الدرس اللي بعده للمستخدم
    if (quiz_passed) {
      const [nextLesson] = await db.execute(
        `SELECT id FROM lessons 
         WHERE lesson_order = (SELECT lesson_order + 1 FROM lessons WHERE id = ?) 
         AND level = (SELECT level FROM lessons WHERE id = ?) 
         LIMIT 1`,
        [lessonId, lessonId]
      );

      if (nextLesson.length > 0) {
        const nextId = nextLesson[0].id;

        // أضف الدرس التالي فقط إذا مش موجود أصلًا
        const [checkExisting] = await db.execute(
          "SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?",
          [userId, nextId]
        );

        if (checkExisting.length === 0) {
          await db.execute(
            "INSERT INTO lesson_progress (user_id, lesson_id, is_unlocked, is_completed, quiz_score, quiz_passed) VALUES (?, ?, TRUE, FALSE, NULL, FALSE)",
            [userId, nextId]
          );
          console.log(`✅ Next lesson (ID: ${nextId}) unlocked!`);
        } else {
          console.log("⚠️ Next lesson already unlocked, skipping insert.");
        }
      } else {
        console.log("🏁 No more lessons to unlock (end of level).");
      }
    }

    res.json({ message: "Progress updated successfully ✅" });
  } catch (err) {
    console.error("❌ Error updating progress:", err);
    res.status(500).json({ message: "Error updating progress", error: err });
  }
};

/**
 * ✅ 4. معرفة الدرس الحالي المفتوح للمستخدم
 */
export const getCurrentLesson = (req, res) => {
  const { userId } = req.params;
  console.log(`📗 Fetching current lesson for user: ${userId}`);

  const query = `
    SELECT l.id, l.title, l.lesson_order
    FROM lesson_progress p
    JOIN lessons l ON l.id = p.lesson_id
    WHERE p.user_id = ? AND p.is_unlocked = TRUE AND p.is_completed = FALSE
    ORDER BY l.lesson_order LIMIT 1;
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("❌ Error fetching current lesson:", err);
      return res.status(500).json({ message: "Error fetching current lesson" });
    }

    console.log("✅ Current lesson fetched:", result[0]);
    res.json(result[0] || null);
  });
};
export const initializeLessonProgress = async (req, res) => {
  const userId = req.user.id; // ناخده من التوكن مباشرة
  const { level } = req.body;
  console.log(`🧩 Initializing first lesson for user: ${userId}, level: ${level}`);

  try {
    // 🟡 1. جلب أول درس بالمستوى
    const [lessons] = await db.execute(
      "SELECT id FROM lessons WHERE level = ? ORDER BY lesson_order ASC LIMIT 1",
      [level]
    );

    if (lessons.length === 0) {
      return res.status(404).json({ message: "No lessons found for this level" });
    }

    const firstLessonId = lessons[0].id;

    // 🟡 2. تأكد إن المستخدم ما عنده progress سابق
    const [existing] = await db.execute(
      "SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?",
      [userId, firstLessonId]
    );

    if (existing.length > 0) {
      console.log("⚠️ Progress already initialized, skipping.");
      return res.json({ message: "Progress already exists" });
    }

    // 🟢 3. إنشاء صف التقدم لأول درس بالقيم الصحيحة
    await db.execute(
      `INSERT INTO lesson_progress 
        (user_id, lesson_id, is_unlocked, is_completed, quiz_score, quiz_passed)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, firstLessonId, 1, 0, 0, 0] // ✅ كل القيم محددة يدويًا بدون NULL
    );

    console.log("✅ First lesson unlocked successfully!");
    res.json({ message: "First lesson initialized successfully" });
  } catch (err) {
    console.error("❌ Error initializing first lesson:", err);
    res.status(500).json({ message: "Error initializing first lesson", error: err });
  }
};

export const getLessonContent = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // جلب ملف الدرس من قاعدة البيانات أولًا
    const [rows] = await db.execute(
      "SELECT * FROM lessons WHERE id = ?",
      [lessonId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const lesson = rows[0];
    const filePath = path.resolve(`src/data/lessons/${lesson.content_file}`);

    // التحقق من وجود ملف JSON
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Lesson content file not found" });
    }

    // قراءة محتوى الملف
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    res.json({
      id: lesson.id,
      title: lesson.title,
      level: lesson.level,
      order: lesson.lesson_order,
      content,
    });
  } catch (err) {
    console.error("❌ Error loading lesson content:", err);
    res.status(500).json({ message: "Failed to load lesson content" });
  }
};




export const getLessonProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        lp.lesson_id,
        l.title,
        lp.is_unlocked,
        lp.is_completed,
        lp.quiz_score,
        lp.quiz_passed,
        l.lesson_order
      FROM html_learning.lesson_progress lp
      JOIN html_learning.lessons l 
        ON l.id = lp.lesson_id
      WHERE lp.user_id = ?
        AND l.level = 'basic'
      ORDER BY l.lesson_order ASC
      `,
      [userId]
    );

    if (!rows.length) {
      return res.json({ progress: [] });
    }

    // 🔢 إعادة ترقيم الدروس بحيث 5 بعد 4، 6 بعد 5...
    const normalized = rows.map((r, i) => ({
      ...r,
      display_number: i + 1, // الرقم الجديد بالترتيب المنطقي
    }));

    // حدد الدرس الحالي (أول درس غير مكتمل)
    const currentLesson =
      normalized.find((r) => !r.is_completed)?.lesson_id ||
      normalized[normalized.length - 1].lesson_id;

    res.json({ progress: normalized, currentLesson });
  } catch (err) {
    console.error("❌ Error fetching lesson progress:", err);
    res.status(500).json({ message: "Server error fetching lesson progress" });
  }
};
