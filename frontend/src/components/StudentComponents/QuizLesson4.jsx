import React, { useState, useEffect } from "react";
import axios from "axios";
import Confetti from "react-confetti";

export default function QuizLesson4({ lessonId = 4, quizData, onPassed }) {
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 🔹 تحديث حجم الزينة مع تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🧠 لو ما في بيانات كويز
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return <p className="text-center text-gray-500">No quiz available.</p>;
  }

  const q = quizData.questions[step];
  const total = quizData.questions.length;

  const handleAnswer = async (idx) => {
    const isCorrect = idx === q.correctIndex;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setFeedback(`✅ Correct! ${q.explain || ""}`);

      setTimeout(async () => {
        setFeedback("");

        // 🔸 إذا في سؤال بعده
        if (step + 1 < total) {
          setStep(step + 1);
        } else {
          // 🔸 آخر سؤال — حساب النتيجة
          const score = Math.round(((correct + 1) / total) * 100);
          const passed = score >= 60;
          const token = localStorage.getItem("token");
          const userId = localStorage.getItem("userId");

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
            setShowConfetti(true);
            setFeedback("🎉 Congratulations! You passed!");
            if (onPassed) onPassed(); // 🔥 فتح الدرس التالي
            setTimeout(() => setShowConfetti(false), 6000);
          } else {
            setFeedback("❌ You did not pass. Try again!");
          }

          setStep(total); // ينهي الكويز
        }
      }, 700);
    } else {
      setFeedback(`❌ Wrong! ${q.explain || "Try again."}`);
    }
  };

  // 🎯 عند الانتهاء
  if (step >= total) {
    const score = Math.round((correct / total) * 100);
    const passed = score >= 60;

    return (
      <div className="relative bg-white p-8 rounded-2xl shadow text-center overflow-hidden">
        {passed && showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={400}
            gravity={0.3}
            recycle={false}
          />
        )}

        <h2 className="text-2xl font-bold mb-3">Quiz Result</h2>
        <p className="text-gray-700 mb-2">Score: {score}%</p>
        <p className={`font-semibold ${passed ? "text-green-600" : "text-red-600"}`}>
          {feedback}
        </p>

        {passed && (
          <p className="mt-3 text-yellow-700 bg-yellow-100 inline-block px-4 py-2 rounded-full font-semibold animate-bounce">
            🎉 Lesson 5 Unlocked!
          </p>
        )}
      </div>
    );
  }

  // 🧩 أثناء الكويز
  return (
    <div className="bg-white p-6 rounded-2xl shadow ring-1 ring-yellow-100 text-center">
      <h3 className="text-xl font-semibold mb-4 text-[#064F54]">
        Question {step + 1} of {total}
      </h3>

      <p className="font-medium text-gray-800 mb-5">{q.question}</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {q.options.map((op, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
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
