import express from "express";
import axios from "axios";
import fetch from "node-fetch";
import db from "../config/db.js";
import NodeCache from "node-cache";
import path from "path";
//import fs from "fs/promises";
 import fs from "fs";

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 });

// ✔ AI endpoint optimized for React Native (NO STREAM)
router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // 🔥 CALL OLLAMA (non-stream mode)
    const aiRes = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt,
      stream: false, // ❗ أهم شيء — يمنع السترريم
    });

    // Response from Ollama
    return res.json({
      success: true,
      reply: aiRes.data.response,
    });
  } catch (err) {
    console.error("🔥 Mobile AI Error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to generate AI response",
    });
  }
});

export default router;
