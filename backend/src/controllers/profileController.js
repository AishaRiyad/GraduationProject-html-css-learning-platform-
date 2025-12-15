// backend/src/controllers/profileController.js
import db from "../config/db.js";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.execute(
      `SELECT 
          u.id         AS user_id,
          u.name       AS username,
          u.email      AS user_email,
          u.last_login AS user_last_login,
          u.password_length,
          u.level,
          p.full_name,
          p.profile_image,
          p.phone_number,
          p.city,
          p.address,
          p.about_me
       FROM users u
       LEFT JOIN profile p ON p.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const r = rows[0];

    const displayName = r.full_name || r.username || "";
    const displayEmail = r.user_email;

    res.json({
      user: {
        id: r.user_id,
        name: displayName,
        full_name: displayName,
        email: displayEmail,
        profile_image: r.profile_image || "/user-avatar.jpg",
        last_login: r.user_last_login,
        phone_number: r.phone_number || "",
        city: r.city || "",
        address: r.address || "",
        about_me: r.about_me || "",
        passwordLength: r.password_length || 0,
        level: r.level || "basic",
      },
    });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  
    await db.execute("UPDATE profile SET profile_image = ? WHERE user_id = ?", [imageUrl, userId]);

    return res.status(200).json({
      message: "Profile image updated successfully",
      profile_image: imageUrl,
    });
  } catch (err) {
    console.error("updateProfileImage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { full_name, email, phone_number, city, address, about_me } = req.body;

  try {
 
    const [result] = await db.query(
      `UPDATE profile
       SET full_name = ?, email = ?, phone_number = ?, city = ?, address = ?, about_me = ?
       WHERE user_id = ?`,
      [full_name, email, phone_number, city, address, about_me, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

   

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new passwords are required" });
    }

    
    const [rows] = await db.execute("SELECT password FROM users WHERE id = ?", [userId]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    const currentHash = rows[0].password;
    
    const match = await bcrypt.compare(oldPassword, currentHash);
    if (!match) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

   
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.execute(
      "UPDATE users SET password = ?, password_length = ? WHERE id = ?",
      [newHash, newPassword.length, userId]
    );

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
