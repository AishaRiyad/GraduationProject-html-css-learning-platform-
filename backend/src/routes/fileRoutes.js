import express from "express";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import unzipper from "unzipper";
const router = express.Router();

router.get("/read-file", (req, res) => {
  const filePath = req.query.path;

  if (!filePath) {
    return res.status(400).json({ error: "Missing file path" });
  }

  // حل مشكلة backend/backend
  const cleanedPath = filePath.replace(/^\//, "");
  const absolutePath = path.join(process.cwd(), cleanedPath);

  console.log("Resolved path:", absolutePath);

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const textTypes = [".html", ".css", ".js", ".txt", ".json", ".xml", ".md"];

  if (textTypes.includes(ext)) {
    const content = fs.readFileSync(absolutePath, "utf8");
    return res.json({ type: "text", content });
  }

  const mimeType = mime.lookup(absolutePath);
  if (mimeType?.includes("pdf") || mimeType?.includes("image")) {
    return res.json({
      type: "binary",
      url: `/files/stream?path=${filePath}`,
    });
  }

  return res.status(400).json({ error: "Unsupported file type for preview" });
});

// stream endpoint
router.get("/stream", (req, res) => {
  const filePath = req.query.path;
  const cleanedPath = filePath.replace(/^\//, "");
  const absolutePath = path.join(process.cwd(), cleanedPath);

  const mimeType = mime.lookup(absolutePath);
  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", "inline");
  res.sendFile(absolutePath);
});
router.get("/read-zip", async (req, res) => {
  const filePath = req.query.path;

  if (!filePath) return res.status(400).json({ error: "Missing file path" });

  const absolutePath = path.join(process.cwd(), filePath.replace(/^\//, ""));

  if (!fs.existsSync(absolutePath)) {
    return res.status(404).json({ error: "Zip file not found" });
  }

  const directory = await unzipper.Open.file(absolutePath);
  
  const files = directory.files.map(f => ({
    name: f.path,
    isDirectory: f.type === "Directory"
  }));

  res.json({ files });
});
router.get("/read-zip-file", async (req, res) => {
  const zipPath = req.query.zip;
  const fileInside = req.query.file;

  const absolutePath = path.join(process.cwd(), zipPath.replace(/^\//, ""));

  const directory = await unzipper.Open.file(absolutePath);

  const file = directory.files.find(f => f.path === fileInside);

  if (!file) return res.status(404).json({ error: "File not found inside zip" });

  const content = await file.buffer();

  res.json({
    name: fileInside,
    content: content.toString("utf8")
  });
});

export default router;
