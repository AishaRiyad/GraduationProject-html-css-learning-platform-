import React, { useState } from "react";
import { motion } from "framer-motion";

export default function InteractiveFlexPlayground() {
  const [boxes, setBoxes] = useState([
    { id: 1, label: "Box 1", color: "#FFB74D" },
    { id: 2, label: "Box 2", color: "#4DB6AC" },
    { id: 3, label: "Box 3", color: "#9575CD" },
  ]);

  const [direction, setDirection] = useState("row"); // 🔹 الاتجاه الافتراضي
  const [code, setCode] = useState(getHTML(boxes, "row"));

  function getHTML(currentBoxes, dir) {
    return `
<style>
  .container {
    display: flex;
    flex-direction: ${dir};
    gap: 10px;
    transition: all 0.3s;
  }
  .box {
    flex: 1;
    padding: 20px;
    color: white;
    text-align: center;
    border-radius: 8px;
    cursor: grab;
  }
</style>

<div class="container">
  ${currentBoxes
    .map(
      (b) =>
        `<div class="box" style="background-color:${b.color};">${b.label}</div>`
    )
    .join("\n")}
</div>
    `.trim();
  }

  // ✅ التبديل بالسحب
  const onDragEnd = (event, info, id) => {
    const movedIndex = boxes.findIndex((b) => b.id === id);
    const moveX = info.offset.x;
    const moveY = info.offset.y;

    // 🔹 تحديد الاتجاه حسب النمط الحالي
    const directionType = direction === "row" ? moveX : moveY;
    const dir = directionType > 50 ? 1 : directionType < -50 ? -1 : 0;

    if (dir !== 0) {
      const newIndex = movedIndex + dir;
      if (newIndex >= 0 && newIndex < boxes.length) {
        const newBoxes = [...boxes];
        const [moved] = newBoxes.splice(movedIndex, 1);
        newBoxes.splice(newIndex, 0, moved);
        setBoxes(newBoxes);
        setCode(getHTML(newBoxes, direction));
      }
    }
  };

  const resetBoxes = () => {
    const initial = [
      { id: 1, label: "Box 1", color: "#FFB74D" },
      { id: 2, label: "Box 2", color: "#4DB6AC" },
      { id: 3, label: "Box 3", color: "#9575CD" },
    ];
    setBoxes(initial);
    setDirection("row");
    setCode(getHTML(initial, "row"));
  };

  const toggleDirection = (newDir) => {
    setDirection(newDir);
    setCode(getHTML(boxes, newDir));
  };

  return (
    <div className="mt-8 bg-white/90 border border-yellow-200 rounded-2xl shadow-md p-5">
      <h3 className="text-[#5D4037] font-semibold mb-3 text-center">
        🧱 Interactive Flex Layout Playground
      </h3>

      {/* 🔧 محرر الكود */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-36 p-3 border border-yellow-100 rounded-lg text-sm font-mono text-gray-800 bg-[#FFFDF5] outline-none focus:ring-2 focus:ring-yellow-300"
        readOnly
      ></textarea>

      {/* 🔘 أزرار التحكم بالاتجاه */}
      <div className="flex justify-center gap-4 mt-3">
        <button
          onClick={() => toggleDirection("row")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            direction === "row"
              ? "bg-yellow-400 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-yellow-100"
          }`}
        >
          ↔️ Horizontal
        </button>
        <button
          onClick={() => toggleDirection("column")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            direction === "column"
              ? "bg-yellow-400 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-yellow-100"
          }`}
        >
          ↕️ Vertical
        </button>
      </div>

      {/* 🎨 النتيجة */}
      <div className="mt-5 border border-yellow-100 rounded-lg bg-white p-4">
        <p className="text-sm text-gray-500 mb-2">
          Result (drag boxes {direction === "row" ? "left/right" : "up/down"}):
        </p>
        <div
          className={`flex ${
            direction === "column" ? "flex-col" : ""
          } gap-3 justify-center md:justify-start`}
        >
          {boxes.map((b) => (
            <motion.div
              key={b.id}
              className="rounded-xl text-white text-center py-4 px-8 cursor-grab"
              style={{ backgroundColor: b.color }}
              drag
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              onDragEnd={(event, info) => onDragEnd(event, info, b.id)}
              whileTap={{ scale: 1.1 }}
            >
              {b.label}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 🔁 زر إعادة الضبط */}
      <div className="text-center mt-4">
        <button
          onClick={resetBoxes}
          className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full text-sm font-semibold transition"
        >
          🔁 Reset Example
        </button>
      </div>
    </div>
  );
}
