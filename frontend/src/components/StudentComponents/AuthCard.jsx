import React from "react";
import { Link } from "react-router-dom"; // <-- هنا

export default function AuthCard({ title, altLinkText, altLinkHref, children, imageSrc }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full mx-auto flex">
        {/* left image */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src={imageSrc}
            alt="decorative"
            className="h-full w-full object-cover"
          />
          <div 
            className="absolute bg-yellow-400 rounded-full w-10 h-10 flex items-center justify-center shadow z-50"
            style={{
              top: "-20px",  
              left: "35%",  
              transform: "translateX(-50%)" 
            }}
          >
            <img src="/icons/my-icon.png" alt="icon" className="w-5 h-5"/>
          </div>
        </div>

        {/* right form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {altLinkText && altLinkHref && (
              <Link 
                to={altLinkHref} 
                className="text-sm text-yellow-400 font-semibold"
              >
                {altLinkText}
              </Link>
            )}
          </div>

          <div className="text-sm text-gray-500 mb-6">
            {/* تعليمات إضافية */}
          </div>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

