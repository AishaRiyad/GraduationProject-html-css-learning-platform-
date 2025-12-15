// src/components/InteractiveImageResizer.jsx
import React, { useState } from "react";

export default function InteractiveImageResizer() {
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(150);

 return (
  <div className="bg-[#FFFDF2] border border-amber-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-6">
  

  

    {/* حقول التحكم */}
    <div className="flex flex-wrap gap-5 items-center">
      <label className="flex items-center gap-2 text-gray-700">
        <span className="font-semibold">Width:</span>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="border border-amber-300 rounded-lg px-2 py-1 w-24 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <span className="text-sm text-gray-500">px</span>
      </label>

      <label className="flex items-center gap-2 text-gray-700">
        <span className="font-semibold">Height:</span>
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          className="border border-amber-300 rounded-lg px-2 py-1 w-24 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        <span className="text-sm text-gray-500">px</span>
      </label>

      <button
        onClick={() => {
          setWidth(200);
          setHeight(150);
        }}
        className="ml-auto px-4 py-2 rounded-lg bg-[#F4C430] hover:brightness-95 text-[#064F54] font-semibold transition"
      >
        Reset
      </button>
    </div>

   {/* عرض الصورة */}
<div className="flex flex-col items-center">
  <div
    style={{
      width: `${width}px`,
      height: `${height}px`,
      overflow: "hidden",
      borderRadius: "0.75rem",
      border: "2px solid #facc15",
      transition: "all 0.3s ease",
    }}
    className="shadow-md bg-white flex items-center justify-center"
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg"
      alt="Resizable example"
      className="h-full w-full object-cover transition-all duration-300 ease-in-out"
    />
  </div>

  <p className="text-gray-600 text-sm mt-2">
    {`<img src='cat.png' width='${width}' height='${height}'>`}
  </p>
</div>
</div>
);
}
