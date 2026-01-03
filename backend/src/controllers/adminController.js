import bcrypt from "bcryptjs";
import db from "../config/db.js";

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists." });
    }

  
    const hashed = await bcrypt.hash(password, 10);

    
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role, password_length, level)
       VALUES (?, ?, ?, 'admin', ?, 'basic')`,
      [name, email, hashed, password.length]
    );

    return res.json({
      message: "Admin created successfully.",
      admin: {
        id: result.insertId,
        name,
        email,
        role: "admin",
      },
    });
  } catch (err) {
    console.error("ADMIN_CREATE_ERROR:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
