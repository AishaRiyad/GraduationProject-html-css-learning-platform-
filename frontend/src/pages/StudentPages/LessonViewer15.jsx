import React, { useEffect, useState } from "react";
import axios from "axios";
import StepCodeEditor from "../../components/StudentComponents/StepCodeEditor";
import AIEvaluationResult from "../../components/StudentComponents/AIEvaluationResult";
import CertificateModal from "../../components/StudentComponents/CertificateModal";
import { motion, AnimatePresence } from "framer-motion";

const API = "http://localhost:5000";

export default function LessonViewer15() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const FINAL_STEP_INDEX = 6;
const [finalScore, setFinalScore] = useState(0);




  // 🧠 تحميل الدرس من قاعدة البيانات
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/lessons/content/41`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(res.data.content);
      } catch (e) {
        console.error("❌ Failed to load Lesson 15", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  if (loading)
    return <div className="text-center text-gray-500 p-10">Loading lesson...</div>;
  if (!lesson)
    return <div className="text-center text-red-500 p-10">Lesson not found</div>;

  // ✅ لما المستخدم يقيّم كوده
const handleEvaluationResult = async (result) => {
    console.log("🧠 Raw evaluation result:", result);
  setEvaluation(result);
  const numericScore = Number(result.stepScore) || 0;
    setFinalScore(numericScore);

 
  // نعتبر النجاح من 70 فأكثر للتقدم للخطوة التالية
  if (result.score >= 70) {
    setCompletedSteps((prev) => [...prev, currentStep]);

    const isFinalStep = currentStep === FINAL_STEP_INDEX;

    if (isFinalStep) {
      // الشهادة والترقية فقط عند الخطوة 7 وبعلامة ≥ 80
      if (result.score >= 80) {
        try {
          const token = localStorage.getItem("token");
          await axios.put(
            `${API}/api/auth/upgrade-level`,
            {
              newLevel: "advanced",                // انتبه لحروف صغيرة
              badge_name: "Basic Level Completed",
              badge_image: "basic_level_badge.png",
               score: result.score ?? finalScore,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setShowCertificate(true);               // 👈 الشهادة فقط هنا
        } catch (err) {
          console.error("❌ Failed to upgrade level or store achievement:", err);
        }
      } else {
        console.log("⚠️ Score below 80 — certificate not awarded.");
      }
    } else {
      // باقي الخطوات: تقدّم فقط بدون شهادة
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setEvaluation(null);
        setShowCertificate(false); // تأكيد عدم ظهور الشهادة بالخطوات الوسطى
      }, 1200);
    }
  }
};




  const totalSteps = lesson.sections.length - 2; // بدون الخاتمة
  const progress = Math.min(((currentStep + 1) / totalSteps) * 100, 100);

  const section = lesson.sections[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 p-8">
      <div className="max-w-5xl mx-auto">

        {/* ====== العنوان ====== */}
        <h1 className="text-3xl font-bold text-amber-800 text-center mb-3">
          {lesson.title}
        </h1>
        <p className="text-gray-600 text-center mb-8">{lesson.description}</p>

        {/* ====== شريط التقدم ====== */}
        <div className="w-full bg-gray-200 h-4 rounded-full mb-10 overflow-hidden">
          <motion.div
            className="h-4 bg-gradient-to-r from-amber-400 to-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
        <p className="text-center text-gray-700 font-medium mb-8">
          Step {currentStep + 1} of {totalSteps} ({Math.round(progress)}% Complete)
        </p>

        {/* ====== عرض المرحلة الحالية ====== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md p-6 border border-amber-100"
          >
            <h2 className="text-2xl font-semibold text-amber-700 mb-3">
              {section.title}
            </h2>

            {/* النصوص */}
            {Array.isArray(section.content) &&
              section.content.map((item, i) =>
                typeof item === "string" ? (
                  <p key={i} className="text-gray-700 mb-2 leading-relaxed">
                    {item}
                  </p>
                ) : item.type === "ai-tool" ? (
                  <StepCodeEditor
  lessonId={41}
  step={currentStep + 1} // رقم الخطوة الحالي
  onEvaluate={handleEvaluationResult}
/>

                ) : null
              )}

           {/* النتيجة */}
{evaluation && (
  <>
    <AIEvaluationResult
      score={evaluation.score}
      feedback={evaluation.feedback}
    />

    <div className="flex justify-center mt-6">
      <button
        onClick={async () => {
          if (currentStep === FINAL_STEP_INDEX) {
            try {
              const token = localStorage.getItem("token");
            const scoreToSave = Number(finalScore) || Number(evaluation?.stepScore) || 0;


              console.log("💾 Sending finalScore to DB:", scoreToSave);

 // ✅ ضمان وجودها

              await axios.put(
                `${API}/api/auth/upgrade-level`,
                {
                  newLevel: "advanced",
                  badge_name: "Basic Level Completed",
                  badge_image: "basic_level_badge.png",
                  score: scoreToSave, // 👈 رح يخزن العلامة الصح
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              console.log("🏆 Achievement stored with score:", scoreToSave);
              setShowCertificate(true);
            } catch (err) {
              console.error("❌ Error saving achievement:", err);
            }
          } else {
            setCurrentStep((prev) => prev + 1);
            setEvaluation(null);
          }
        }}
        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg shadow-md transition"
      >
        {currentStep < FINAL_STEP_INDEX ? "Next Step →" : "View Certificate 🎓"}
      </button>
    </div>
  </>
)}






            {/* رسالة تحفيزية بعد النجاح */}
            {completedSteps.includes(currentStep) && !showCertificate && (
              <div className="text-center mt-4 text-green-700 font-medium animate-pulse">
                ✅ Great! Step completed successfully. Next step unlocking...
              </div>
            )}
            {/* زر البدء في أول خطوة فقط */}
{currentStep === 0 && (
  <div className="flex justify-center mt-6">
    <button
      onClick={() => setCurrentStep(currentStep + 1)}
      className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md transition duration-300"
    >
      Start Project →
    </button>
  </div>
)}

          </motion.div>
        </AnimatePresence>

        {/* ====== الشهادة النهائية ====== */}
        {showCertificate && (
          <CertificateModal onClose={() => setShowCertificate(false)} />
        )}
      </div>
    </div>
  );
}
