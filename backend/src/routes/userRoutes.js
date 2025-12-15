import express from "express";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import upload from "../middlewares/upload.js";
const router = express.Router();

// ADD SUPERVISOR (Admin only) – temporary open until admin dashboard is done
router.post("/add-supervisor", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const [exists] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert supervisor into users table
    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'supervisor')",
      [name, email, hashed]
    );

    const userId = result.insertId;

    // INSERT profile row
    await db.execute(
      "INSERT INTO supervisor_profiles (user_id, full_name) VALUES (?, ?)",
      [userId, name]
    );

    res.json({ success: true, message: "Supervisor created!" });

  } catch (err) {
    console.log("Add supervisor error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.put(
  "/update-profile/:user_id",
  upload.single("profile_image"),
  async (req, res) => {
    try {
      const user_id = req.params.user_id;

      // Extract basic fields
      const {
        full_name,
        bio,
        phone,
        location,
        skills,
        github,
        linkedin,
        website,
        password
      } = req.body;

      // Handle uploaded image (if exists)
      const profileImage = req.file
        ? `/uploads/${req.file.filename}`
        : null;

      // ---- Safe Skills Parsing ----
      let parsedSkills = [];
      try {
        parsedSkills =
          typeof skills === "string" ? JSON.parse(skills) : skills || [];
      } catch (err) {
        parsedSkills = [];
      }

      // ---- Build Profile Meta ----
      const meta = {
        skills: parsedSkills,
        social: {
          github: github || "",
          linkedin: linkedin || "",
          website: website || ""
        }
      };

      // ---- UPDATE PROFILE ----
      await db.execute(
        `UPDATE supervisor_profiles SET 
            full_name = ?, 
            bio = ?, 
            phone = ?, 
            location = ?, 
            profile_image = COALESCE(?, profile_image),
            profile_meta = ?
         WHERE user_id = ?`,
        [
          full_name || "",
          bio || "",
          phone || "",
          location || "",
          profileImage,
          JSON.stringify(meta), // store as JSON string
          user_id
        ]
      );

      // ---- UPDATE PASSWORD (IF PROVIDED) ----
      if (password && password.trim() !== "") {
        const hashed = await bcrypt.hash(password, 10);
        await db.execute(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashed, user_id]
        );
      }

      // ---- RETURN UPDATED PROFILE ----
      const [updated] = await db.execute(
        `SELECT * FROM supervisor_profiles WHERE user_id = ?`,
        [user_id]
      );

      const profileRow = updated[0];

      // Ensure profile_meta is ALWAYS string
      let metaString = profileRow.profile_meta;
      if (typeof metaString !== "string") {
        metaString = JSON.stringify(metaString || {});
      }

      res.json({
        success: true,
        profile: {
          ...profileRow,
          profile_meta: metaString
        }
      });

    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);





export default router;
