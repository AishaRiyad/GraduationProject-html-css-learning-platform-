import multer from "multer";
import path from "path";

// إعداد مكان التخزين واسم الملف
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });
export default upload;
