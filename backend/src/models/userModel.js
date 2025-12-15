// src/models/userModel.js
import pool from "../config/db.js";

export const createUser = async (name, email, hashedPassword, role) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role]
  );
  return result.insertId;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0];
};
