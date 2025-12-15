// src/components/InlineQuiz.jsx
import React, { useState } from "react";

export default function InlineQuiz({ data, onCorrect }) {
  const { question, options, answer, points } = data;
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");

  const submit = () => {
    if (selected === null) return;
    if (options[selected] === answer) {
      setFeedback("✅ Correct!");
      onCorrect(points);
    } else {
      setFeedback("❌ Try again!");
    }
  };

  return (
    <div className="mt-4">
      <p className="font-medium text-gray-800 mb-3">{question}</p>
      <div className="grid sm:grid-cols-2 gap-2 mb-3">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`border rounded-lg px-3 py-2 text-left hover:bg-gray-50 ${
              selected === i ? "border-[#004D40]" : "border-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        onClick={submit}
        className="bg-[#F4C430] hover:brightness-95 px-4 py-2 rounded font-semibold"
      >
        Submit
      </button>
      {feedback && <p className="mt-2 font-semibold">{feedback}</p>}
    </div>
  );
}
