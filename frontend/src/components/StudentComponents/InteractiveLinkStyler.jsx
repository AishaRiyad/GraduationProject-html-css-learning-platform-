import React, { useState } from "react";

export default function InteractiveLinkStyler() {
  const [linkColor, setLinkColor] = useState("#0000ff");
  const [hoverColor, setHoverColor] = useState("#ff0000");
  const [underline, setUnderline] = useState(true);

  const codeExample = `
a {
  color: ${linkColor};
  text-decoration: ${underline ? "none" : "none"};
}

a:hover {
  color: ${hoverColor};
  text-decoration: ${underline ? "underline" : "none"};
}`;

  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-2xl font-extrabold text-[#064F54] mb-4 flex items-center gap-2">
        🎨 Styling Links with CSS
      </h3>

      <p className="text-gray-700 leading-relaxed mb-4">
        You can change the color, remove the underline, and add hover effects to links using CSS.
      </p>

      <h4 className="font-semibold text-[#967a0e] mb-2">Example:</h4>

      {/* 🔹 الكود التفاعلي */}
      <pre className="bg-white text-black rounded-xl p-4 overflow-x-auto text-sm mb-4">
        <code>{codeExample}</code>
      </pre>

      {/* 🎨 أدوات التخصيص */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div>
          <label className="text-sm text-gray-700 font-semibold mr-2">
            Link Color:
          </label>
          <input
            type="color"
            value={linkColor}
            onChange={(e) => setLinkColor(e.target.value)}
            className="w-10 h-8 border rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="text-sm text-gray-700 font-semibold mr-2">
            Hover Color:
          </label>
          <input
            type="color"
            value={hoverColor}
            onChange={(e) => setHoverColor(e.target.value)}
            className="w-10 h-8 border rounded cursor-pointer"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={underline}
            onChange={() => setUnderline(!underline)}
            className="w-4 h-4"
          />
          Underline
        </label>
      </div>

      {/* 🔗 المعاينة */}
      <div className="bg-white border border-amber-200 rounded-xl p-4 text-center">
        <a
          href="#"
          style={{
            color: linkColor,
            textDecoration: underline ? "underline" : "none",
          }}
          onMouseEnter={(e) => (e.target.style.color = hoverColor)}
          onMouseLeave={(e) => (e.target.style.color = linkColor)}
          className="font-semibold transition duration-300"
        >
          Hover over me!
        </a>
      </div>
    </div>
  );
}
