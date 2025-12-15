import multer from "multer";
import fs from "fs";
import path from "path";

const dest = path.join(process.cwd(), "uploads", "submissions");
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, dest),
  filename: (req, file, cb) => {
    const userId = req.user?.id || "anon";
    const timestamp = Date.now();
    const ext = path.extname(file.originalname || "");
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_");
    cb(null, `u${userId}_${timestamp}_${safeName}`);
  },
});

// ✅ هنا نصدر الـ instance الجاهزة مباشرة
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// ✅ نصدرها كـ object فيه الدوال الجاهزة
export const submissionUpload = {
  array: upload.array.bind(upload),
  single: upload.single.bind(upload),
};
