import React, { useState, useEffect } from "react";
import axios from "axios";
import Confetti from "react-confetti";

export default function Quiz({ lessonId, questions, totalQuestions, onPassed }) {
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // تحديث حجم الزينة عند تغيير حجم النافذة
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const q = questions[step];
  const percent = Math.round(((step) / totalQuestions) * 100);

  const submitAnswer = async (idx) => {
    const isCorrect = idx === q.answer;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setFeedback(`✅ Correct! ${q.explain ? q.explain : ""}`);

      setTimeout(async () => {
        setFeedback("");
        // إذا في سؤال بعده
        if (step + 1 < totalQuestions) {
          setStep(step + 1);
        } else {
          // آخر سؤال
          const token = localStorage.getItem("token");
          const userId = localStorage.getItem("userId");
          const score = Math.round(((correct + 1) / totalQuestions) * 100);
          const passed = score >= 60;

          try {
            await axios.post(
              "http://localhost:5000/api/lessons/complete",
              {
                userId: Number(userId),
                lessonId: Number(lessonId),
                quiz_score: score,
                quiz_passed: passed ? 1 : 0,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (e) {
            console.error("❌ Failed to submit progress", e);
          }

if (passed) {
  console.log("✅ Quiz Passed — calling onPassed()");
  setShowConfetti(true);
  setFeedback("🎉 Congratulations! You passed!");

  // 🔥 فعّل الدرس التالي فوراً
  if (onPassed) onPassed();

  // 🎊 إخفاء الزينة بعد ثوانٍ
  setTimeout(() => setShowConfetti(false), 6000);
}


 else {
            setFeedback("❌ You did not pass.");
          }

          // خلي البار يوصل 100%
          setStep(totalQuestions);
        }
      }, 600);
    } else {
      setFeedback(`❌ Wrong. ${q.explain ? q.explain : "Try again."}`);
    }
  };

  // ✅ لما يخلص الكويز
  if (step >= totalQuestions) {
    const score = Math.round((correct / totalQuestions) * 100);
    const passed = score >= 60;

    return (
      <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow ring-1 ring-yellow-100 text-center overflow-hidden">
        {/* 🎊 الزينة على الشاشة الكاملة */}
        {passed && showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={400}
            gravity={0.3}
            recycle={false}
          />
        )}

        <h2 className="text-xl font-bold mb-2">Quiz Result</h2>
        <p className="mb-3">Score: {score}%</p>

        <p className={`font-semibold ${passed ? "text-green-600" : "text-red-600"}`}>{feedback}</p>

        {passed && (
          <div className="mt-4 animate-bounce">
            <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold shadow-sm">
              🎉 You passed! Great job!
            </span>
          </div>
        )}
      </div>
    );
  }

  // ✅ أثناء الكويز
  return (
    <div className="p-6 bg-white rounded-2xl shadow ring-1 ring-yellow-100">
      {/* شريط التقدم */}
      <div className="mb-4">
        <div className="w-full h-2 bg-yellow-100 rounded-full overflow-hidden">
          <div
            className="h-2 bg-yellow-400 transition-all"
            style={{
              width: `${step === totalQuestions - 1 ? 100 : percent}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-yellow-800 mt-1">
          <span>Progress</span>
          <span>
            {step} / {totalQuestions} ({percent}%)
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">Quiz</h2>
        <span className="text-sm text-gray-500">
          Question {step + 1} / {totalQuestions}
        </span>
      </div>

      <p className="font-semibold mb-4">{q.question}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {q.options.map((op, i) => (
          <button
            key={i}
            onClick={() => submitAnswer(i)}
            className="px-4 py-3 rounded-lg border bg-gray-50 hover:bg-yellow-50 text-left transition"
          >
            {op}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mt-4">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              feedback.startsWith("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {feedback}
          </span>
        </div>
      )}
    </div>
  );
}
