import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import db from "../config/db.js";

// ===== Helpers =====
const jwtSecret = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "localhost",
  port: Number(process.env.EMAIL_PORT || 1025),
  secure: process.env.EMAIL_SECURE === "true",
  ...(process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? { auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } }
    : {}),
});


function signToken(user) {
  const payload = {
    id: user.id,
    name: user.name || user.full_name || "",
    email: user.email,
    role: user.role,
    level: user.level || "basic",
  };
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
}


// ===== Auth: Signup/Login =====
export const signup = async (req, res) => {
  try {
    const { name, email, password, role = "student", level = "basic" } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const [exists] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, role, level) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, role, level]
    );

    await db.execute(
      "INSERT INTO profile (user_id, full_name, email, password) VALUES (?, ?, ?, ?)",
      [result.insertId, name, email, hashed]
    );

    const token = signToken({ id: result.insertId, name, email, role, level });

    res.status(201).json({
      token,
      user: { id: result.insertId, name, email, role, level },
    });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ============ LOGIN ============ */
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    email = String(email).trim();

    const [[{ db: currentDb }]] = await db.query("SELECT DATABASE() AS db");
    console.log("🔎 DB =", currentDb, "| login email =", email);

    
    const [users] = await db.execute(
      "SELECT id, name, email, password, role, level, active FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      console.log("❌ No user with this email");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    console.log("✅ Found user:", { id: user.id, email: user.email, passLen: (user.password || "").length });

    const ok = await bcrypt.compare(password, user.password || "");
    console.log("🔐 bcrypt.compare =", ok);

    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const now = new Date();
    await db.execute("UPDATE users SET last_login=? WHERE id=?", [now, user.id]);

   
    try {
      await db.execute(
        "INSERT INTO login_events (user_id, occurred_at) VALUES (?, NOW())",
        [user.id]
      );
    } catch (e) {
      console.warn("login_events insert skipped:", e.code || e.message);
    }

    const [profiles] = await db.execute("SELECT * FROM profile WHERE user_id=?", [user.id]);
    let profile = profiles[0];
    if (!profile) {
      const [r] = await db.execute(
        "INSERT INTO profile (user_id, full_name, email, password, last_login) VALUES (?, ?, ?, ?, ?)",
        [user.id, user.name || user.full_name, user.email, user.password, now]
      );
      const [np] = await db.execute("SELECT * FROM profile WHERE id=?", [r.insertId]);
      profile = np[0];
    } else {
      await db.execute("UPDATE profile SET last_login=? WHERE user_id=?", [now, user.id]);
      profile.last_login = now;
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name || profile?.full_name || "",
        email: user.email,
        role: user.role,
        level: user.level || "basic",
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // تهيئة أول درس (كما هو)
    const [lessons] = await db.execute(
      "SELECT id FROM lessons WHERE level=? ORDER BY lesson_order ASC LIMIT 1",
      ["basic"]
    );
    if (lessons.length) {
      const [existing] = await db.execute(
        "SELECT 1 FROM lesson_progress WHERE user_id=? AND lesson_id=?",
        [user.id, lessons[0].id]
      );
      if (!existing.length) {
        await db.execute(
          "INSERT INTO lesson_progress (user_id, lesson_id, is_unlocked, is_completed, quiz_score, quiz_passed) VALUES (?, ?, TRUE, FALSE, 0, FALSE)",
          [user.id, lessons[0].id]
        );
      }
    }

   
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        full_name: profile?.full_name || user.name,
        email: user.email,
        profile_image: profile?.profile_image || "/user-avatar.jpg",
        last_login: profile?.last_login,
        role: user.role,
        level: user.level || "basic",
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


/* ============ ME ============ */
export const me = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      level: req.user.level || "basic",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};




/* ============ FORGOT PASSWORD ============ */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const [rows] = await db.query("SELECT id,email FROM users WHERE email = ?", [email]);
    if (!rows.length) return res.json({ message: "If the email exists, a reset link has been sent." });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const minutes = Number(process.env.RESET_TOKEN_EXPIRES_MIN || 15);
    const expires = new Date(Date.now() + minutes * 60 * 1000);

    await db.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [tokenHash, expires, email]
    );

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@yourapp.com",
      to: email,
      subject: "Password reset request",
      html: `<p>Click the link below to reset your password:</p>
             <p><a href="${resetUrl}">${resetUrl}</a></p>
             <p>This link will expire in ${minutes} minutes.</p>`,
    });

    res.json({ message: "If the email exists, a reset link has been sent." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============ VERIFY RESET TOKEN ============ */
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [rows] = await db.query(
      "SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [tokenHash]
    );
    if (!rows.length) return res.status(400).json({ message: "Invalid or expired token" });
    res.json({ message: "Token valid" });
  } catch (err) {
    console.error("verifyResetToken error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============ RESET PASSWORD ============ */
export const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password)
      return res.status(400).json({ message: "Token, email and password are required" });

    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [rows] = await db.query(
      "SELECT id, email FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [tokenHash]
    );
    const user = rows[0];
    if (!user || user.email !== email)
      return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
      [hashed, user.id]
    );

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



/* ============ UPGRADE USER LEVEL ============ */
export const upgradeUserLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newLevel, badge_name, badge_image, score } = req.body;

    await db.query("UPDATE users SET level = ? WHERE id = ? AND level = 'basic'", [
      newLevel,
      userId,
    ]);

    await db.query(
      "INSERT INTO achievements (user_id, badge_name, badge_image, awarded_at, score) VALUES (?, ?, ?, NOW(), ?)",
      [userId, badge_name, badge_image, score]
    );

    res.json({ message: "User upgraded and achievement recorded!" });
  } catch (error) {
    console.error("Upgrade error:", error);
    res.status(500).json({ error: "Failed to upgrade user" });
  }
};

console.log("✅ authController.js loaded");




