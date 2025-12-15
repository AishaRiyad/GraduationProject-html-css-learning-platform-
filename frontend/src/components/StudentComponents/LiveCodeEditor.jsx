// 📁 components/LiveCodeEditor.jsx
import React, { useState } from "react";

export default function LiveCodeEditor({ initialCode }) {
  const [code, setCode] = useState(formatCode(initialCode || ""));
  const [output, setOutput] = useState("");

  // 🔹 وظيفة بسيطة لتحويل \n إلى أسطر حقيقية
  function formatCode(str) {
    return str.replace(/\\n/g, "\n").trim();
  }

  // 🔹 تشغيل الكود داخل iframe
 const runCode = () => {
  const fullHtml = `
    <html>
      <head>
        <style>
          body {
            font-family: sans-serif;
            padding: 20px;
            background: #fffef6;
          }
          form {
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 250px;
          }
          label {
            font-weight: bold;
          }
          input, button {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 6px;
          }
          button {
            background: #ffcc00;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: 0.3s;
          }
          button:hover {
            background: #ffb700;
          }
          #message {
            margin-top: 20px;
            padding: 10px;
            border-radius: 8px;
            background: #e8f5e9;
            color: #2e7d32;
            font-weight: bold;
            display: none;
          }
        </style>
      </head>
      <body>
        ${code}

        <div id="message"></div>

        <script>
          const form = document.querySelector("form");
          const messageBox = document.getElementById("message");

          if (form) {
            form.addEventListener("submit", (e) => {
              e.preventDefault();
              const nameInput = form.querySelector("input[type='text']");
              const name = nameInput ? nameInput.value.trim() : "";

              messageBox.style.display = "block";
              messageBox.textContent = name
                ? "✅ Form submitted! Welcome, " + name + " 🎉"
                : "✅ Form submitted successfully!";

              form.reset();
            });
          }
        </script>
      </body>
    </html>
  `;
  setOutput(fullHtml);
};


  return (
    <div className="mt-4">
      {/* 🧠 المحرر */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-56 p-3 border border-yellow-300 rounded-lg font-mono text-sm bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 whitespace-pre"
      />

      {/* زر التشغيل */}
      <button
        onClick={runCode}
        className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all"
      >
        ▶ Run Code
      </button>

      {/* الإخراج داخل iframe */}
      <div className="mt-4 p-4 bg-white border rounded-xl shadow-inner">
        <h4 className="font-semibold text-gray-700 mb-2">🔹 Output:</h4>
        <iframe
          title="Code Output"
          srcDoc={output}
          className="w-full h-64 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
}
