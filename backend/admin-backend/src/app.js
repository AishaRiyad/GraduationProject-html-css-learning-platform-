// backend/src/app.js (add near other routes)
import adminRoutes from "../admin-backend/src/routes/adminRoutes.js";
import adminNotificationRoutes from "./src/routes/adminNotificationRoutes.js";
// ... after app.use(cors()), etc.
app.use("/api/admin", adminRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);