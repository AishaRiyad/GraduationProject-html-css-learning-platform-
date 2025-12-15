// src/components/SearchSection.jsx
import React, { useState } from "react";
import { Search } from "lucide-react";

export default function SearchSection({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
    console.log("Searching for:", query);
  };

  return (
    <div className="relative py-24 bg-gradient-to-b from-yellow-50 to-yellow-100 px-6">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 text-gray-800 drop-shadow-md">
        🔍 Search Lessons
      </h2>

      <form
        onSubmit={handleSearch}
        className="flex justify-center items-center gap-2 max-w-md mx-auto"
      >
        <div className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="w-full rounded-full py-4 px-6 pl-14 text-lg font-medium shadow-lg border-none focus:outline-none focus:ring-4 focus:ring-yellow-400/40 transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-yellow-500" />
        </div>
        <button
          type="submit"
          className="bg-yellow-500 text-white font-bold px-6 py-4 rounded-full shadow-lg hover:bg-yellow-600 transition-all"
        >
          Search
        </button>
      </form>
    </div>
  );
}
