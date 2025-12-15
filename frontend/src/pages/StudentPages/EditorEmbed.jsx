import React from "react";

export default function EditorEmbed() {
  const EDITOR_URL = "http://localhost:5173"; // غيّرها إذا اختلف البورت/الدومين
  return (
    <div style={{ height: "100vh" }}>
      <iframe
        title="HTML Editor"
        src={EDITOR_URL}
        style={{ border: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
