import React, { useState } from "react";
import axios from "axios";

export default function QuizLesson5({
  lessonId = 5,
  quizData,
  onPassed,
  isFinal = false,            // 👈 جديد: هل هذا آخر كويز بالدرس؟
}) {
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return <p className="text-center text-gray-500">No quiz available.</p>;
  }

  const q = quizData.questions[step];
  const total = quizData.questions.length;

  const handleAnswer = async (idx) => {
    const isCorrect = idx === q.correctIndex;

    if (isCorrect) {
      setCorrect((prev) => prev + 1);
      setFeedback("✅ Correct!");
      setAnswered(true);
    } else {
      setFeedback("❌ Wrong! Try again.");
      return; // لا نكمل إن كان خطأ
    }

    setTimeout(async () => {
      setFeedback("");

      // لو في سؤال تالي داخل نفس الكويز
      if (step + 1 < total) {
        setStep(step + 1);
        setAnswered(false);
        return;
      }

      // نهاية أسئلة هذا الكويز (غالباً سؤال واحد لكل قسم)
      const score = Math.round(((isCorrect ? correct + 1 : correct) / total) * 100);
      const passed = score >= 60;

      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
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
        console.error("❌ Failed to submit quiz progress", e);
      }

      // نبلغ الصفحة الأم إنه هذا القسم تم اجتيازه
      if (passed && onPassed) onPassed();

      // ✅ شاشة الإنهاء تظهر فقط إن كان هذا آخر كويز في الدرس
      if (passed && isFinal) {
        setFinished(true);
      } else {
        // لقسم غير أخير: نبقي الرسالة الصغيرة فقط ونمنع الضغط
        setAnswered(true);
        setFeedback("✅ Correct!"); // تبقى قصيرة بدون شاشة إنهاء
      }
    }, 600);
  };

  // شاشة الإنهاء — فقط للـ isFinal = true
  if (finished) {
    const score = Math.round((correct / total) * 100);
    return (
      <div className="bg-white/80 backdrop-blur-md border border-yellow-200 rounded-2xl shadow-md p-6 text-center">
        <h2 className="text-xl font-bold text-[#5D4037] mb-3">Quiz Completed!</h2>
        <p className="text-gray-700 mb-2 font-medium">Your Score: {score}%</p>
        <p className="font-semibold text-green-600">
          ✅ You passed! The next lesson is now unlocked.
        </p>
      </div>
    );
  }

  // أثناء الكويز (سؤال واحد غالباً في القسم)
  return (
    <div className="bg-white/80 backdrop-blur-md border border-yellow-200 rounded-2xl shadow-md p-5 text-center">
      <h3 className="text-lg font-bold text-[#5D4037] mb-4">{q.question}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {q.options.map((op, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={answered}
            className={`p-3 rounded-lg border border-gray-200 font-medium transition ${
              answered
                ? "bg-green-50 text-green-800 cursor-not-allowed"
                : "hover:bg-yellow-50 text-gray-800"
            }`}
          >
            {op}
          </button>
        ))}
      </div>

      {feedback && (
        <p
          className={`mt-3 font-semibold ${
            feedback.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
