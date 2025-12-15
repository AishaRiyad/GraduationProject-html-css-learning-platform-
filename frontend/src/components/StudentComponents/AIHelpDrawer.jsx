import React, { useEffect } from "react";
import AIHelpBox from "./AIHelpBox.jsx";

export default function AIHelpDrawer({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <div
      className={[
        "fixed right-0 top-12 z-40",
        "h-[calc(100vh-3rem)] w-[min(420px,92vw)]",
        "bg-yellow-50 border-l border-yellow-200",
        "shadow-[-12px_0_24px_rgba(0,0,0,.08)]",
        "transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      ].join(" ")}
      aria-hidden={!isOpen}
      role="dialog"
      aria-label="AI Help"
    >
      <div className="flex items-center justify-between px-3 h-10 bg-yellow-100 border-b border-yellow-200">
        <div className="font-medium">AI Help</div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-700 hover:bg-yellow-200/60"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="p-3 overflow-y-auto h-[calc(100%-2.5rem)]">
        <AIHelpBox />
      </div>
    </div>
  );
}
