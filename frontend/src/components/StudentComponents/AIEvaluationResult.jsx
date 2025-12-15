import React from "react";

export default function AIEvaluationResult({ score, feedback }) {
  const passed = score >= 80;

  return (
    <div className="mt-12 p-6 border rounded-2xl bg-white shadow-md">
      


      {passed && (
        <p className="text-green-700 text-center font-medium">
          ✅ Great job! You passed the Basic Level.
        </p>
      )}
    </div>
  );
}
