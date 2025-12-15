// backend/src/routes/assistRoutes.js
import { Router } from "express";

const router = Router();

/* ========= الإعدادات ========= */
// إن كانت GPT4ALL_URL = http://localhost:4891/v1/chat/completions
// نستخرج الأساس فقط (http://localhost:4891)
const BASE =
  (process.env.GPT4ALL_URL?.replace(/\/v1\/chat\/completions$/, "") ||
    "http://localhost:4891");

const CHAT_URL = `${BASE}/v1/chat/completions`;
const COMP_URL  = `${BASE}/v1/completions`;

// ⚠️ اسم الموديل تمامًا كما يظهر في /v1/models
const MODEL = process.env.GPT4ALL_MODEL || "DeepSeek-R1-Distill-Qwen-1.5B";

// مهلة الطلب (اضبطيها من .env عند الحاجة)
const TIMEOUT_MS = Number(process.env.GPT4ALL_TIMEOUT_MS || 180_000); // 3 دقائق

/* ========= أدوات مساعدة ========= */
function buildMessages({ question = "", html = "", history = [] }) {
  const sys =
    "You are a helpful programming assistant. Answer in Arabic if the user writes Arabic, otherwise in English. When asked to fix code, return corrected snippet inside a code block.";
  const msgs = [{ role: "system", content: sys }];

  if (Array.isArray(history)) {
    for (const h of history) {
      msgs.push({
        role: h?.role === "assistant" ? "assistant" : "user",
        content: String(h?.content || ""),
      });
    }
  }

  msgs.push({
    role: "user",
    content: question?.trim() || `راجع الكود التالي وأصلحه:\n${html || "(لا يوجد كود)"}`,
  });

  return msgs;
}

// تحويل الرسائل إلى prompt لنقطة /v1/completions عند الحاجة
function messagesToPrompt(messages) {
  return (
    messages
      .map((m) => {
        const role =
          m.role === "system" ? "System" : m.role === "assistant" ? "Assistant" : "User";
        return `${role}: ${m.content}`;
      })
      .join("\n\n") + "\n\nAssistant:"
  );
}

async function postJSON(url, body, { signal } = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const raw = await res.text();
  let data;
  try { data = JSON.parse(raw); } catch { data = { raw }; }
  return { ok: res.ok, status: res.status, data };
}

function extractText(payload) {
  const ch0 = Array.isArray(payload?.choices) ? payload.choices[0] : null;
  const txt =
    ch0?.message?.content ??
    ch0?.text ??
    payload?.response ??
    payload?.generated_text ??
    "";
  return (txt || "").toString().trim();
}

// إزالة أي تفكير داخلي <think>…</think>
function cleanText(s = "") {
  return s
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .trim();
}

/* ========= الراوت ========= */
router.post("/", async (req, res) => {
  const { question = "", html = "", history = [] } = req.body || {};
  const messages = buildMessages({ question, html, history });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // 1) جرّب /v1/chat/completions
    const chatBody = {
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 600,
    };

    let { ok, status, data } = await postJSON(CHAT_URL, chatBody, {
      signal: controller.signal,
    });

    // 2) لو فشل أو لم نجد نصًا، اسقط إلى /v1/completions
    if (!ok || !extractText(data)) {
      const compBody = {
        model: MODEL,
        prompt: messagesToPrompt(messages),
        temperature: 0.3,
        max_tokens: 600,
      };
      const fb = await postJSON(COMP_URL, compBody, { signal: controller.signal });
      ok = fb.ok; status = fb.status; data = fb.data;
      console.log("↪️ Fallback to /v1/completions — status:", status);
    }

    clearTimeout(timeout);
    console.log("🧠 GPT4All response (first 400 chars):", JSON.stringify(data).slice(0, 400));

    if (!ok) {
      return res.status(status).json({
        ok: false,
        messages: [{
          type: "error",
          text: data?.error?.message || data?.error || data?.raw || `GPT4All API failed (status ${status})`,
        }],
      });
    }

    const text = cleanText(extractText(data)) || "لم أتمكّن من توليد رد.";
    return res.json({ ok: true, messages: [{ type: "assistant", text }] });
  } catch (e) {
    clearTimeout(timeout);
    const aborted = e?.name === "AbortError";
    console.error("❌ GPT4All error:", e);
    return res.status(502).json({
      ok: false,
      messages: [{
        type: "error",
        text: aborted
          ? "⏱️ انتهت المهلة في الاتصال بـ GPT4All. زيدي المهلة أو جرّبي نموذجًا أخف."
          : "⚠️ تعذّر الاتصال بـ GPT4All.",
      }],
    });
  }
});

export default router;
