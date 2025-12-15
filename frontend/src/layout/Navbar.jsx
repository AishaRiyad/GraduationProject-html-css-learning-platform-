import React from "react";
import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl text-sm font-semibold ${
   isActive ? "bg-gray-900 text-yellow-300" : "text-gray-800 hover:text-gray-900 hover:bg-yellow-200"

  }`;

export default function Navbar() {
  return (
    <header className="bg-gradient-to-r from-yellow-100  shadow-md text-gray-900">

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/challenges" className="text-xl font-extrabold">
          
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink to="/challenges" className={navLinkClass}>Challenges</NavLink>
          
         
          <NavLink to="/leaderboard" className={navLinkClass}>Leaderboard</NavLink>
        </nav>
      </div>
    </header>
  );
}
