import React, { useState } from "react";
import axios from "axios";

export default function TagHelper() {
  const [tag, setTag] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!tag) return;
    setLoading(true);
    setResponse("");

    try {
      const res = await axios.post("http://localhost:5000/api/ai/ask", {
        prompt: `Explain how to use the <${tag}> tag in HTML with one short example.`
      });

      setResponse(res.data.reply);
    } catch (err) {
      console.error("AI error:", err);
      setResponse("⚠️ AI request failed. Make sure Ollama is running and backend is active.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mt-10">
      <h2 className="text-lg font-bold text-orange-700 mb-3">
        🤖 Ask AI about any HTML tag
      </h2>
      <div className="flex gap-2">
        <input
          className="border border-orange-300 rounded-lg px-3 py-1 flex-grow"
          placeholder="e.g., img or a"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <button
          onClick={askAI}
          className="bg-orange-400 text-white px-4 py-1 rounded-lg hover:bg-orange-500"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Explain"}
        </button>
      </div>

      {response && (
        <div className="mt-4 p-3 bg-orange-50 border-l-4 border-orange-300 rounded">
          <p className="text-gray-800 text-sm whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  );
}
