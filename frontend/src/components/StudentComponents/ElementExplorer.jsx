import React, { useState } from "react";

export default function ElementExplorer({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Core HTML Elements</h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 font-semibold flex justify-between"
            >
              <span>{it.name}</span>
              <span>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div className="p-4 space-y-2">
                <p className="text-gray-700">{it.description}</p>
                {it.example && (
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    <code>{it.example}</code>
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
