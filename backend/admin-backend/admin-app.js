import express from "express";
import cors from "cors";
import adminRoutes from "./admin/routes/adminRoutes.js";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL?.split(",") ?? ["http://localhost:3000"], credentials: true }));
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.listen(process.env.ADMIN_PORT || 6000);
