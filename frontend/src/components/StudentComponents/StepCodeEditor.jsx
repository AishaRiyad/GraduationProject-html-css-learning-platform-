import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function StepCodeEditor({
  lessonId,
  step,
  endpoint = "http://localhost:5000/api/ai-local/evaluate-basic-project",
  placeholder,
  onEvaluate,
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [output, setOutput] = useState(""); // 👈 لتشغيل الكود في iframe

  // 🧠 إرسال الكود إلى الذكاء الاصطناعي لتقييمه
  const handleEvaluate = async () => {
    if (!code.trim())
      return alert("Please write your HTML code before evaluating 📝");

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const res = await axios.post(
        endpoint,
        { userId, lessonId, htmlCode: code, step },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(res.data);
      if (onEvaluate) onEvaluate(res.data);
    } catch (err) {
      console.error("❌ Evaluation Error:", err);
      setResult({
        feedback: "⚠️ Error connecting to AI Evaluator. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ▶️ تشغيل الكود داخل iframe
  const handleRunCode = () => {
    if (!code.trim()) return alert("Please enter some HTML code first 📝");
    setOutput(code);
  };

  return (
    <div className="mt-5">
      {/* 🔹 تقسيم إلى قسمين: المحرر + المعاينة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🎨 محرر الكود */}
        <div className="border border-amber-200 rounded-xl bg-white shadow-sm p-4 flex flex-col">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={placeholder || "Write your HTML code here..."}
            rows={12}
            className="w-full p-3 border rounded-md font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-amber-400 outline-none resize-y flex-grow"
          />

          {/* 🔸 الأزرار */}
          <div className="flex justify-between mt-3">
            <button
              onClick={handleRunCode}
              className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium shadow-md transition"
            >
              ▶️ Run Code
            </button>

            <button
              onClick={handleEvaluate}
              disabled={loading}
              className={`px-5 py-2 rounded-md font-medium transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-md"
              }`}
            >
              {loading ? "Evaluating..." : "Evaluate with AI"}
            </button>
          </div>
        </div>

        {/* 🪄 عرض نتيجة الكود فعليًا داخل iFrame */}
        <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-3 overflow-hidden">
          <h3 className="text-amber-700 font-semibold mb-2 text-center">
            💻 Live Preview
          </h3>
          <iframe
            title="live-preview"
            srcDoc={output}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-[400px] border rounded-lg bg-white"
          ></iframe>
        </div>
      </div>

      {/* ====== نتيجة تقييم الذكاء الاصطناعي (تحت زي قبل) ====== */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-amber-50 shadow-sm"
        >
          {result.stepScore !== undefined && (
            <p className="text-lg font-semibold text-amber-700">
              🧮 Step Score:{" "}
              <span
                className={
                  result.stepScore >= 80
                    ? "text-green-600"
                    : result.stepScore >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
                }
              >
                {result.stepScore} / 100
              </span>
            </p>
          )}

          {result.avgScore !== undefined && (
            <p className="text-gray-700 mt-1">
              📊 Current Average:{" "}
              <span className="font-semibold text-amber-700">
                {result.avgScore}%
              </span>
            </p>
          )}

          <p className="text-gray-700 mt-2 leading-relaxed">
            💬 <span className="italic">{result.feedback}</span>
          </p>

          {/* ✅ رسالة تحفيزية */}
          {result.stepScore >= 80 && (
            <p className="text-green-600 font-semibold mt-3 animate-pulse">
              Great job! You can move to the next step 🎯
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
