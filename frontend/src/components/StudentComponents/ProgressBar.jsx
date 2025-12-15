import React from "react";

export default function ProgressBar({ percent = 0, sections = [], activeId }) {
  return (
    <div className="mb-6">
      {/* الـ percent */}
      <div className="w-full h-2 bg-yellow-100 rounded-full overflow-hidden">
        <div
          className="h-2 bg-yellow-400 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>

      {/* نقاط الأقسام */}
      <div className="flex justify-between text-xs mt-2 text-yellow-800">
        {sections.map((s) => (
          <div key={s.id} className="flex flex-col items-center w-full">
            <span
              className={`w-2.5 h-2.5 rounded-full mb-1 ${
                activeId === s.id ? "bg-yellow-500" : "bg-yellow-300"
              }`}
              title={s.label}
            />
            <span className={`whitespace-nowrap ${activeId === s.id ? "font-semibold" : ""}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
