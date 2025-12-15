import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";




import authRoutes from "./routes/authRoutes.js";
import assistRoutes from "./routes/assistRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import aiLocalRoutes from "./routes/aiLocalRoutes.js";
import mobileAI from  "./routes/mobileAI.js";
import { exec } from "child_process";
import fetch from "node-fetch";
import cookieParser from "cookie-parser";
import externalRoutes from "./routes/externalRoutes.js";
import 'dotenv/config';
import cssLessonsRoutes from "./routes/cssLessonsRoutes.js";
import submitProjectRoutes from "./routes/submitProjectRoutes.js";
import projectHubRoutes from "./routes/projectHubRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import interactionRoutes from "./routes/interactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supervisorRoutes from "./routes/supervisorRoutes.js";
import adminRoutes from "../admin-backend/src/routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import {initSocket} from "./socket.js";
import supervisorReviewRoutes from "./routes/supervisorRoutes.js";
import supervisorTasksRoutes from "./routes/supervisorTasksRoutes.js";
import supervisorStudentsRoutes from "./routes/supervisorStudentsRoutes.js";
import supervisorSubmissionsRoutes from "./routes/supervisorSubmissionsRoutes.js";
import supervisorChatRoutes from "./routes/supervisorChatRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import deviceTokenRoutes from "./routes/deviceTokenRoutes.js"; 
import adminNotificationRoutes from "./routes/adminNotificationRoutes.js";
import studentNotificationRoutes from "./routes/studentNotificationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import sessionsRoutes from "./routes/sessionsRoutes.js";

import expoPushRoutes from "./routes/expoPushRoutes.js";
dotenv.config();

const app = express();
const server = http.createServer(app);
app.set("trust proxy", 1);

const io = initSocket(server);
app.set("io", io);

app.use(cookieParser());

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(s => s.trim()).filter(Boolean)
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Postman / curl
      return cb(null, allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);


app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, _res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

async function ensureOllamaRunning() {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    if (res.ok) {
      console.log("✅ Ollama is already running!");
      return;
    }
  } catch {
    console.log("⚠️ Ollama not running — starting it now...");
    exec("ollama serve", (err) => {
      if (err) {
        console.error("❌ Failed to start Ollama:", err.message);
      } else {
        console.log("✅ Ollama started successfully!");
      }
    });
  }
}
ensureOllamaRunning();
pool.getConnection()
  .then((c) => { console.log("Database connected"); c.release(); })
  .catch((e) => console.error("DB connection failed:", e));
  app.use("/api", expoPushRoutes);
app.use("/api", deviceTokenRoutes);
app.use("/api", notificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/lessons", lessonRoutes);
app.use("/api/ai-local", aiLocalRoutes);
app.use("/api/mobile/ai", mobileAI);
app.use("/api/projects", projectRoutes);
app.use("/api/assist", assistRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api", externalRoutes);
app.use("/api/css-lessons", cssLessonsRoutes);
app.use("/api/submit-projects", submitProjectRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/project-hub", projectHubRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/supervisor", supervisorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);
app.use("/api/student/notifications", studentNotificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/files", fileRoutes);
app.use("/api/supervisor", supervisorReviewRoutes);
app.use("/api/supervisor", supervisorTasksRoutes);
app.use("/api/supervisor", supervisorStudentsRoutes);
app.use("/api/supervisor", supervisorSubmissionsRoutes);
app.use("/api/supervisor-chat", supervisorChatRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", taskRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/notifications", notificationRoutes);



app.get("/api/health", (req, res) => {
  res.json({ message: "Backend OK " });
});

const PORT = process.env.PORT || 5000;
console.log(" This is the app.js file actually running!");

server.listen(PORT, () => console.log(`API + WebSocket running on :${PORT}`));

