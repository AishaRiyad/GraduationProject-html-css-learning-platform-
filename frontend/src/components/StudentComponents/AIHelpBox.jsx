import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:5000/api/assist";
const TIMEOUT = 300000; // 3 دقائق

function cleanThink(s = "") {
  return s.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/<\/?think>/gi, "").trim();
}

// == 1) طلب عادي (نفس منطقك) ==
async function askAI(question, { signal } = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, html: "", history: [] }),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.messages?.[0]?.text || `HTTP ${res.status}`);
  return cleanThink(data?.messages?.[0]?.text || "");
}

// == 2) ستريم (إن توفر) — يقرأ التشunks تدريجيًا ويحدث الواجهة مباشرة ==
async function askAIStream(question, { signal, onChunk }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // لو السيرفر بدّه فلاغ خاص للستريم، ضيفيه هون. وإلا رح يشتغل لو بيرجع body متدفق.
    body: JSON.stringify({ question, html: "", history: [] }),
    signal,
  });

  // إذا ما في body readable، نرجع null لحتى نستعمل الطلب العادي
  if (!res.body || res.headers.get("content-type")?.includes("application/json")) {
    return null;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    // إذا السيرفر بيرجع JSONl/SSE، فيك تنظّفيه هون. حالياً بنعرِض النص كما هو.
    onChunk?.(chunk);
  }

  // لو السيرفر بيرجع نص نهائي بشكل chunks
  return cleanThink(full.trim());
}

export default function AIHelpBox() {
  const [q, setQ] = useState("");
  const [out, setOut] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastQ, setLastQ] = useState(""); // السؤال لعرضه كبابل تحت
  const abortRef = useRef(null);

  // لو خرجنا من الصفحة/المكون — أوقف أي طلب شغال
  useEffect(() => {
    return () => abortRef.current?.abort?.();
  }, []);

  const doRequest = async (question) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      // جرّب ستريم أولاً — إذا رجّع null معناها ما في ستريم أو JSON كامل
      let streamedText = "";
      const streamed = await askAIStream(question, {
        signal: controller.signal,
        onChunk: (chunk) => {
          streamedText += chunk;
          // حدثّي الواجهة تدريجيًا
          setOut((prev) => cleanThink((prev + chunk).trim()));
        },
      });

      if (streamed !== null) {
        // ستريم اشتغل فعليًا: تأكدي من النتيجة النهائية
        setOut(cleanThink(streamedText || streamed || "لا يوجد رد."));
        return;
      }

      // لا يوجد ستريم → نستخدم نفس منطقك الأساسي
      const text = await askAI(question, { signal: controller.signal });
      setOut(text || "لا يوجد رد.");
    } finally {
      clearTimeout(t);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const question = q.trim();
    if (!question || loading) return;

    setLastQ(question);
    setStatus("⏳ جارٍ الحصول على الرد…");
    setOut("");
    setLoading(true);

    // إعادة محاولة واحدة عند الفشل/المهلة
    let attempt = 0;
    let done = false;
    while (!done && attempt < 2) {
      try {
        await doRequest(question);
        setStatus("");
        done = true;
      } catch (err) {
        attempt++;
        if (attempt >= 2) {
          setStatus(
            err.name === "AbortError"
              ? "⏱️ انتهت المهلة. جرّبي مرة أخرى."
              : (err.message || "لم يصل رد من الخادم.")
          );
        } else {
          setStatus("انقطاع مؤقت… إعادة المحاولة…");
          // مهلة صغيرة قبل الإعادة
          await new Promise((r) => setTimeout(r, 800));
        }
      }
    }

    setLoading(false);
  };

  return (
    // الغلاف أصفر والـ dir=rtl
    <div
      dir="rtl"
      className="relative max-w-[520px] mx-0 my-2 rounded-xl border border-yellow-200
                 bg-gradient-to-b from-yellow-50 to-amber-100 shadow-sm p-3"
    >
      {/* حالة التحميل/الأخطاء */}
      <div className="min-h-[20px] text-pink-600 text-[13px] mb-2">
        {loading ? (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-pink-500 border-r-transparent animate-spin" />
            {status || "جارٍ المعالجة…"}
          </span>
        ) : (
          status
        )}
      </div>

      {/* الرسائل فوق (الرد أولاً ثم السؤال) */}
      <div className="flex flex-col gap-2 mb-20">
        {out && (
          <div className="self-end max-w-[90%] rounded-2xl p-3 border border-yellow-300 bg-yellow-50 text-slate-900">
            <div className="text-[12px] opacity-70 mb-1">المساعد</div>
            <div className="whitespace-pre-wrap">{out}</div>
          </div>
        )}
        {lastQ && (
          <div className="self-start max-w-[90%] rounded-2xl p-3 border border-amber-400 bg-amber-100 text-slate-900">
            <div className="text-[12px] opacity-70 mb-1">أنت</div>
            <div className="whitespace-pre-wrap">{lastQ}</div>
          </div>
        )}
      </div>

      {/* الإدخال مثبت أسفل اللوح */}
      <div className="sticky bottom-0 left-0 right-0 -mx-3 -mb-3 bg-yellow-50/90 backdrop-blur border-t border-yellow-200">
        <form onSubmit={onSubmit} className="flex gap-2 p-3">
          <input
            placeholder="اكتبي سؤالك..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-lg border border-yellow-300 bg-white px-3 py-2 text-sm
                       placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white text-sm font-semibold shadow
                       ${loading ? "bg-pink-400/70 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600"}`}
            title="إرسال"
          >
            {loading ? "…جارٍ" : "إرسال"}
          </button>
        </form>
      </div>
    </div>
  );
}
