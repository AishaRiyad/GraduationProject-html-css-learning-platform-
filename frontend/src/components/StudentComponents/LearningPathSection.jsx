import React from "react";
import { Star, Code2, Award, MonitorPlay } from "lucide-react";

export default function LearningPathSection() {
  const cards = [
    {
      id: 1,
      title: "HTML Basics",
      icon: <Star className="text-yellow-400 w-12 h-12" />,
      links: ["Introduction", "Tags & Elements", "Basic Structure"],
      color: "from-yellow-300 to-orange-400",
      translateY: "translate-y-4",
      shadow: "shadow-yellow-800/70",
    },
    {
      id: 2,
      title: "Advanced HTML",
      icon: <Code2 className="text-blue-400 w-12 h-12" />,
      links: ["Forms", "Media & Semantic", "SEO Essentials"],
      color: "from-blue-400 to-indigo-500",
      translateY: "translate-y-20",
      shadow: "shadow-blue-800/70",
    },
    {
      id: 3,
      title: "Code Playground",
      icon: <MonitorPlay className="text-green-400 w-12 h-12" />,
      links: ["Try Examples", "Interactive Editor", "Live Preview"],
      color: "from-green-400 to-emerald-500",
      translateY: "-translate-y-12",
      shadow: "shadow-green-800/70",
    },
    {
      id: 4,
      title: "Certificate",
      icon: <Award className="text-purple-400 w-12 h-12" />,
      links: ["🔒 Locked"],
      locked: true,
      color: "from-purple-400 to-pink-500",
      translateY: "translate-y-20",
      shadow: "shadow-purple-800/70",
    },
  ];

  return (
    <div className="relative py-32 bg-gradient-to-b from-yellow-50 to-gray-50 overflow-x-auto px-6">
      {/* Learning Journey */}
      <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-24 text-gray-800 tracking-wide drop-shadow-md">
        🚀 Learning Journey
      </h2>

      {/* البطاقات: توزيع أفقي على طول العرض */}
      <div className="flex justify-between items-start gap-10 z-10 min-w-[1200px]">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative w-72 p-6 rounded-3xl text-white transform ${card.translateY} bg-gradient-to-tr ${card.color} shadow-2xl ${card.shadow} transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-opacity-70 hover:text-gray-900`}
          >
            <div className="flex items-center gap-4 mb-4">
              {card.icon}
              <h3 className="text-2xl font-bold transition-colors duration-300 hover:text-gray-900">{card.title}</h3>
            </div>
            <ul className="space-y-2 ml-2">
              {card.links.map((link, i) => (
                <li key={i} className="flex items-center gap-2">
                  {!card.locked ? (
                    <span className="hover:underline cursor-pointer transition-colors duration-300 hover:text-gray-900">{link}</span>
                  ) : (
                    <span className="italic">{link}</span>
                  )}
                </li>
              ))}
            </ul>
            {card.locked && (
              <button className="mt-4 bg-white text-purple-600 font-bold px-4 py-2 rounded-full hover:bg-purple-100 transition-all">
                Try Now to Unlock 🔓
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
