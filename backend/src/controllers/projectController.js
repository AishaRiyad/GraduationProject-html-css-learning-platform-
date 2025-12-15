import {
  getProjectBySlug,
  getProjectById,
  getUserSubmission,
  upsertSubmission,
  deleteSubmission
} from "../models/submitProjectModel.js";

import db from "../config/db.js";

export async function getProject(req, res) {
  try {
    const slugOrId = req.params.projectIdOrSlug;
    const project = /^\d+$/.test(slugOrId)
      ? await getProjectById(Number(slugOrId))
      : await getProjectBySlug(slugOrId);

    if (!project) return res.status(404).json({ ok:false, message:"Project not found" });
    res.json({ ok:true, project });
  } catch (e) {
    res.status(500).json({ ok:false, message:e.message });
  }
}

export async function uploadMySubmission(req, res) {
  try {
    const userId = req.user?.id;
    const uploaded = req.files || [];

    if (!uploaded.length)
      return res.status(400).json({ ok: false, message: "No files uploaded" });

    // 🔹 1. نجيب الملفات القديمة من الجدول
    const [rows] = await db.query(
      "SELECT file_url FROM project_submissions WHERE user_id = ? LIMIT 1",
      [userId]
    );

    let existingFiles = [];
    if (rows.length && rows[0].file_url) {
      try {
        existingFiles = JSON.parse(rows[0].file_url);
        if (!Array.isArray(existingFiles)) existingFiles = [];
      } catch (err) {
        console.warn("⚠️ Failed to parse old file_url JSON");
        existingFiles = [];
      }
    }

    // 🔹 2. تجهيز الملفات الجديدة
    const newFiles = uploaded.map((f) => ({
      url: `/uploads/submissions/${f.filename}`,
      name: f.originalname,
      size: f.size,
      type: f.mimetype,
      uploaded_at: new Date().toISOString(),
    }));

    // 🔹 3. الدمج الحقيقي بين القديم والجديد (بدون حذف القديم)
    const mergedFiles = [
      ...existingFiles,
      ...newFiles.filter(
        (nf) => !existingFiles.some((old) => old.name === nf.name)
      ),
    ];

    // 🔹 4. تخزين الدمج في قاعدة البيانات
    if (rows.length > 0) {
      // تحديث السطر الحالي
      await db.query(
        "UPDATE project_submissions SET file_url = ?, updated_at = NOW() WHERE user_id = ?",
        [JSON.stringify(mergedFiles), userId]
      );
    } else {
      // إنشاء صف جديد للمستخدم لأول مرة
      await db.query(
        "INSERT INTO project_submissions (user_id, file_url, updated_at) VALUES (?, ?, NOW())",
        [userId, JSON.stringify(mergedFiles)]
      );
    }

    // 🔹 5. إرجاع البيانات للفرونت
    res.json({
      ok: true,
      submission: {
        user_id: userId,
        file_url: mergedFiles,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error("❌ uploadMySubmission error:", e);
    res.status(500).json({ ok: false, message: e.message });
  }
}


export const deleteSingleSubmissionFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fileName } = req.body;
    if (!fileName)
      return res.status(400).json({ message: "File name is required" });

    const [rows] = await db.query(
      "SELECT file_url FROM project_submissions WHERE user_id = ?",
      [userId]
    );
    if (!rows.length)
      return res.status(404).json({ message: "No submission found" });

    let files = [];
    try {
      files = JSON.parse(rows[0].file_url || "[]");
    } catch {
      files = [];
    }

    const updatedFiles = files.filter((f) => f.name !== fileName);

    await db.query(
      "UPDATE project_submissions SET file_url = ?, updated_at = NOW() WHERE user_id = ?",
      [JSON.stringify(updatedFiles), userId]
    );

    res.json({
      success: true,
      submission: { user_id: userId, file_url: updatedFiles },
    });
  } catch (err) {
    console.error("❌ Delete single file error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};






export async function getMySubmission(req, res) {
  try {
    const userId = Number(req.user?.id);
    const sub = await getUserSubmission(userId);
    res.json({ ok: true, submission: sub || null });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
}

export async function removeMySubmission(req, res) {
  try {
    const userId = Number(req.user?.id);
    await deleteSubmission(userId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
}

