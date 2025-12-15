import React, { useState } from "react";
import { motion } from "framer-motion";

export default function BoxVisualizer() {
  const [hovered, setHovered] = useState(null);

  const sections = [
    { id: "header", label: "<header>", color: "from-amber-400 to-yellow-300" },
    { id: "main", label: "<main>", color: "from-yellow-200 to-amber-100" },
    { id: "aside", label: "<aside>", color: "from-amber-200 to-yellow-100" },
    { id: "footer", label: "<footer>", color: "from-yellow-300 to-amber-200" },
  ];

  const descriptions = {
    header: "Top section – usually contains logo or navigation links.",
    main: "Central area – holds the main content of the page.",
    aside: "Side section – often used for ads or related information.",
    footer: "Bottom section – typically shows contact info or credits.",
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-6">
      <div className="grid grid-rows-[100px_200px_100px] grid-cols-[3fr_1fr] gap-3">
        {sections.map((sec, i) => (
          <motion.div
            key={sec.id}
            onMouseEnter={() => setHovered(sec.id)}
            onMouseLeave={() => setHovered(null)}
            layout
            className={`${
              sec.id === "header" ? "col-span-2 row-start-1" :
              sec.id === "main" ? "col-span-1 row-start-2" :
              sec.id === "aside" ? "col-start-2 row-start-2" :
              "col-span-2 row-start-3"
            } rounded-2xl bg-gradient-to-br ${sec.color} 
               flex items-center justify-center font-semibold text-amber-900 shadow-sm cursor-default transition-all`}
          >
            {sec.label}
          </motion.div>
        ))}
      </div>

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute left-1/2 -translate-x-1/2 bottom-[-60px] bg-amber-50 border border-amber-200 text-stone-700 rounded-xl px-4 py-2 shadow-md text-sm"
        >
          {descriptions[hovered]}
        </motion.div>
      )}
    </div>
  );
}
