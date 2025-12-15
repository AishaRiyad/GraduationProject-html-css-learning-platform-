import React from "react";

export default function Footer() {
  return (
    <footer className="mt-12 bg-[#FFF8DC] border-t border-yellow-200 shadow-inner">

      <div className="text-sm text-gray-700 flex items-center justify-between">

        <div>© {new Date().getFullYear()} Challenges Arena</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
