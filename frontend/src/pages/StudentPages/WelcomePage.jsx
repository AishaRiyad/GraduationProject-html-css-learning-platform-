import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  const [activePopup, setActivePopup] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080c18] to-[#0b0f1f] flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background Glow Effects */}
      <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-yellow-500/10 blur-[140px]"></div>
      <div className="absolute bottom-[-60px] right-[-40px] w-[500px] h-[500px] bg-blue-500/10 blur-[160px]"></div>

      {/* MAIN CARD */}
      <div className="relative bg-white/95 backdrop-blur-xl border border-white/20
      max-w-6xl w-full rounded-3xl shadow-[0_10px_60px_rgba(0,0,0,0.35)]
      overflow-hidden animate-slideFade">

        {/* NAVIGATION INSIDE CARD */}
        <div className="flex justify-between items-center px-10 py-6 border-b border-gray-200">
          <div className="text-4xl font-extrabold tracking-wide">
            <span className="text-gray-900">HT</span>
            <span className="text-yellow-500">ML</span>
          </div>

          <div className="hidden md:flex gap-8 text-gray-600 font-medium">
            <NavItem text="Learn" onClick={() => setActivePopup("learn")} />
            <NavItem text="Challenges" onClick={() => setActivePopup("challenges")} />
            <NavItem text="Projects" onClick={() => setActivePopup("projects")} />
            <NavItem text="Contact" onClick={() => setActivePopup("contact")} />
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid md:grid-cols-2 gap-12 p-10">

          {/* LEFT TEXT */}
          <div className="flex flex-col justify-center px-4">
            
            <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
              Master Front-End  
              <span className="block mt-2 bg-gradient-to-r from-yellow-500 to-orange-400 bg-clip-text text-transparent animate-gradientFlow">
                From Zero To Hero
              </span>
            </h1>

            <p className="mt-6 text-gray-600 text-lg leading-relaxed">
              Become a real front-end developer with interactive lessons, 
              instant code execution, challenges, and real projects — all in one platform.
            </p>

            {/* BUTTONS */}
            <div className="mt-10 flex gap-5">
              <Link
                to="/login"
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-xl
                text-lg font-semibold shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl
                text-lg font-semibold shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl"
              >
                Create Account
              </Link>
            </div>

          </div>

          {/* RIGHT IMAGE */}
          <div className="flex items-center justify-center relative">
            <div className="absolute w-72 h-72 bg-yellow-400/20 blur-3xl rounded-full"></div>

            <img
              src="/welcome-hero.png"
              alt="Hero"
              className="w-[90%] max-w-md drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]
              rounded-2xl animate-floating"
            />
          </div>

        </div>
      </div>

      {/* POPUP */}
      {activePopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-[90%] max-w-lg animate-slideFade">
            
            <PopupContent active={activePopup} />

            <button
              onClick={() => setActivePopup(null)}
              className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-black
              py-2 rounded-xl font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- COMPONENTS ---- */

function NavItem({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative group hover:text-black transition"
    >
      {text}
      <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
    </button>
  );
}

function PopupContent({ active }) {
  const content = {
    learn: {
      title: "Learn",
      text: "Access structured HTML & CSS lessons designed to take you from beginner to advanced."
    },
    challenges: {
      title: "Challenges",
      text: "Solve daily and weekly coding challenges and climb the global leaderboard."
    },
    projects: {
      title: "Projects",
      text: "Work on real projects to build your portfolio and gain practical experience."
    },
    contact: {
      title: "Contact",
      text: "Need help? We're here to assist you anytime."
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">{content[active].title}</h2>
      <p className="text-gray-700 text-lg">{content[active].text}</p>
    </>
  );
}

/* ---- EXTRA ANIMATIONS (ADD THESE TO index.css OR globals.css) ----

.animate-gradientFlow {
  background-size: 200% 200%;
  animation: gradientFlow 4s ease infinite;
}
@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

.animate-slideFade {
  animation: slideFade 0.6s ease forwards;
}
@keyframes slideFade {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-floating {
  animation: floating 4s ease-in-out infinite;
}
@keyframes floating {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
------------------------------------------------------------------ */

