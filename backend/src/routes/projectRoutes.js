// backend/src/routes/projectRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  initProjectsTable,
} from "../models/projectModel.js";

const router = express.Router();

// تأكد الجدول موجود (مرّة واحدة)
initProjectsTable().catch(console.error);

// لازم المستخدم يكون مسجّل
router.use(protect);

// GET /api/projects
router.get("/", async (req, res) => {
  const data = await listProjects(req.user.id);
  res.json(data);
});

// POST /api/projects
router.post("/", async (req, res) => {
  const { title, html } = req.body;
  if (!title || !html) return res.status(400).json({ error: "title and html are required" });
  const created = await createProject(req.user.id, { title, html });
  res.status(201).json(created);
});

// PUT /api/projects/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, html } = req.body;
  const updated = await updateProject(req.user.id, id, { title, html });
  if (!updated) return res.status(404).json({ error: "not_found" });
  res.json(updated);
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const ok = await deleteProject(req.user.id, id);
  if (!ok) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

export default router;
