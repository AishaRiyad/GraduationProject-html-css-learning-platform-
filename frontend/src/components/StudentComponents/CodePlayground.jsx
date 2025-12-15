import React, { useRef, useState, useEffect } from "react";

export default function CodePlayground({ initialCode }) {
  const [code, setCode] = useState(initialCode || "");
  const iframeRef = useRef(null);

  // ✅ استقبال كود جديد من HtmlStructureBuilder
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "addCode") {
        setCode((prev) => prev + "\n" + event.data.code);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const run = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(code);
    doc.close();
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">Try it yourself</h2>
        <button
          onClick={run}
          className="px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-500 font-semibold"
        >
          Run ▶
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-72 p-3 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <div className="border rounded-lg overflow-hidden">
          <iframe
            ref={iframeRef}
            title="preview"
            className="w-full h-72 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
