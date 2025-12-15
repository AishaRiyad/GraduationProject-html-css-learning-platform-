import React from "react";

export default function TOC({ sections, activeId }) {
  return (
    <aside
  className="hidden md:block sticky top-36 self-start -ml-8"
  style={{ alignSelf: "flex-start" }}
>

      <div className="backdrop-blur-md bg-yellow-50/70 border border-yellow-200/80 rounded-3xl shadow-lg p-5 w-60 transition-all duration-300">
        <h3 className="text-lg font-extrabold text-yellow-700 mb-4 flex items-center gap-2">
          📖 <span>Contents</span>
        </h3>

        <ul className="space-y-2">
          {sections.map((s) => {
            const isActive = s.id === activeId;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 shadow-sm scale-[1.02]"
                      : "text-gray-700 hover:bg-yellow-50 hover:scale-[1.02]"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(s.id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
