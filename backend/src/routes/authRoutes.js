// src/routes/authRoutes.js
import express from "express";
import db from "../config/db.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { upgradeUserLevel } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { createAdmin } from "../controllers/adminController.js";
const jwtSecret = process.env.JWT_SECRET || "secretkey"; 
import {
  signup,
  login,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from "../controllers/authController.js";
import { loginLimiter } from "../middlewares/rateLimiter.js"; // ✅ اكتفي بهالاستيراد
import fetch from "node-fetch";
const router = express.Router();

// Signup
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  signup
);

// تسجيل الدخول
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const now = new Date();
    await db.execute("UPDATE users SET last_login = ? WHERE id = ?", [now, user.id]);

    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, {
      expiresIn: "1h",
    });
    fetch("http://localhost:5000/api/ai-local/top-projects").catch(() => {});

    // 🔥 إذا كان مشرف → رجّع معلومات من supervisor_profiles فقط
    if (user.role === "supervisor") {
      const [sup] = await db.execute(
        "SELECT * FROM supervisor_profiles WHERE user_id = ?",
        [user.id]
      );

      return res.json({
        token,
        user: {
          id: user.id,
          role: user.role,
          email: user.email,
          name: sup[0]?.full_name || user.name,
          full_name: sup[0]?.full_name || user.name,
          profile_image: sup[0]?.profile_image || "/user-avatar.jpg",
          bio: sup[0]?.bio,
          phone: sup[0]?.phone,
          location: sup[0]?.location,
        },
      });
    }

    // 🔥 غير المشرف → استخدم جدول profile العادي
    const [profiles] = await db.execute(
      "SELECT * FROM profile WHERE user_id = ?",
      [user.id]
    );

    let profile;
    if (profiles.length === 0) {
      const [result] = await db.execute(
        "INSERT INTO profile (user_id, full_name, email, password, last_login) VALUES (?, ?, ?, ?, ?)",
        [user.id, user.name, user.email, user.password, now]
      );
      const [newProfile] = await db.execute(
        "SELECT * FROM profile WHERE id = ?",
        [result.insertId]
      );
      profile = newProfile[0];
    } else {
      profile = profiles[0];
      await db.execute("UPDATE profile SET last_login = ? WHERE user_id = ?", [
        now,
        user.id,
      ]);
      profile.last_login = now;
    }

    // 🔥 الرد النهائي لمستخدم عادي
    return res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: profile.full_name || user.name,
        full_name: profile.full_name || user.name,
        email: user.email,
        profile_image: profile.profile_image || "/user-avatar.jpg",
        last_login: profile.last_login,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});




// ✅ ترقية المستخدم من Basic إلى Advanced
router.put("/upgrade-level", protect, upgradeUserLevel);

// Forgot/Reset
router.post("/forgot-password", loginLimiter, forgotPassword); // ✅ استعملنا نفس الـ limiter
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password", resetPassword);
router.post("/admin/create", createAdmin);
export default router;
