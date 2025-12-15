// src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

// تقييد محاولات تسجيل الدخول
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // مدة الـ window: 15 دقيقة
  max: 5, // أقصى 5 محاولات تسجيل دخول خلال الـ window
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true, // يضيف headers RateLimit-* في الرد
  legacyHeaders: false,   // يمنع headers القديمة X-RateLimit-*
});
