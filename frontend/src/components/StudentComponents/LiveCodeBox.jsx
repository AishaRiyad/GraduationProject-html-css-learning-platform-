import React, { useState, useEffect } from "react";

/**
 * 🎨 LiveCodeBox Component
 * يعرض كود HTML ويعرض نتيجته بشكل حي.
 */
export default function LiveCodeBox({ initialCode, readOnly = false, hideResult = false }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(initialCode);

  useEffect(() => setOutput(code), [code]);

  return (
    <div className="mt-6 bg-white/80 border border-yellow-200 rounded-2xl shadow-inner p-4">
      <h3 className="text-[#5D4037] font-semibold mb-3">💡 Try it yourself!</h3>

      <textarea
        value={code}
        onChange={(e) => !readOnly && setCode(e.target.value)}
        readOnly={readOnly}
        className={`w-full h-28 p-3 border border-yellow-100 rounded-lg text-sm font-mono text-gray-800 outline-none focus:ring-2 focus:ring-yellow-300 resize-none bg-[#FFFDF5] ${readOnly ? "opacity-90 cursor-not-allowed" : ""}`}
      ></textarea>

      {!hideResult && (
        <div className="mt-4 bg-white border border-yellow-100 rounded-lg shadow-sm p-4 overflow-auto">
          <h4 className="text-sm text-gray-600 mb-2">Result:</h4>
          <iframe
            title="live-preview"
            className="w-full h-48 border-0 rounded-md bg-white"
            srcDoc={`
              <html>
                <head><base href="${window.location.origin}/" /></head>
                <body style="margin:0; padding:10px; font-family:sans-serif;">
                  ${output}
                </body>
              </html>`}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
    </div>
  );
}
