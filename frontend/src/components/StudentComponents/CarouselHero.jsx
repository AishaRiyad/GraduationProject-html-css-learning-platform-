// src/components/CarouselHero.jsx
import React, { useState, useEffect } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import htmlCard1 from "../../assets/images/html_card1.png";
import htmlCard2 from "../../assets/images/html_card2.png";
import codeEditorVideo from "../../assets/videos/html_card3.mp4";
import htmlCard4 from "../../assets/images/html_card4.png";
import htmlCard5 from "../../assets/images/html_card5.png";
const slides = [
  {
    id: 1,
    image: htmlCard1,
    title: "Learn HTML from Scratch",
    description: "Start your web development journey by learning the basics of HTML.",
    buttonText: "Start Learning",
    buttonAction: () => alert("Navigate to HTML Basics!"),
  },
  {
    id: 2,
    image: htmlCard2,
    title: "Where HTML is Used",
    description: "Discover how HTML powers every website and web application you see online.",
    buttonText: "Explore Examples",
    buttonAction: () => alert("Navigate to HTML Use Cases!"),
  },
  {
    id: 3,
    image: "",
    title: "Try a Code Editor",
    description: "Experiment with your first HTML code using our interactive code editor.",
    buttonText: "Open Editor",
    buttonAction: () => alert("Navigate to Code Editor!"),
  },
  {
    id: 4,
    image: htmlCard4,
    title: "Build Your First Project",
    description: "Apply your HTML skills in real projects and see the results instantly.",
    buttonText: "Start Project",
    buttonAction: () => alert("Navigate to Projects!"),
  },
  {
    id: 5,
    image: htmlCard5,
    title: "Earn a Certificate",
    description: "Complete all lessons and projects to get your HTML certificate.",
    buttonText: "View Certificate",
    buttonAction: () => alert("Navigate to Certificate!"),
  },
];

export default function CarouselHero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-lg">
        
      {/* الخلفية: صورة أو فيديو */}
      {slides[currentIndex].id === 3 ? (
        <video 
           className="absolute top-0 left-1/2 w-[150%] h-640 object-cover -translate-x-1/2"
          autoPlay
          muted
          loop
        >
          <source src={codeEditorVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={slides[currentIndex].image}
          alt={slides[currentIndex].title}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
        />
      )}
      {/* الصورة الحالية */}
      <img
        src={slides[currentIndex].image}
        alt={slides[currentIndex].title}
        className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
      />

{/* Overlay للنصوص */}
<div
  className={`absolute inset-0 flex flex-col justify-center p-8 md:p-16 text-white ${
    slides[currentIndex].id === 1
      ? "items-end text-right bg-black bg-opacity-20" // الكارد الأولى
      : slides[currentIndex].id === 2 || slides[currentIndex].id === 3|| slides[currentIndex].id === 4|| slides[currentIndex].id === 5
      ? "items-start text-left bg-black bg-opacity-20" // الكارد الثانية
      : "items-start text-left bg-black bg-opacity-20" // باقي الكاروسيل
  }`}
>
  {/* div داخلي لترتيب النصوص والزر فقط */}
  {slides[currentIndex].id === 1 ? (
    <div className="flex flex-col items-end text-center space-y-4 max-w-md">
      <h2 className="text-5xl md:text-4xl font-bold drop-shadow-lg">
        {slides[currentIndex].title}
      </h2>
      <p className="text-2xl md:text-lg drop-shadow-md">
        {slides[currentIndex].description}
      </p>
      <button
        onClick={slides[currentIndex].buttonAction}
        className="px-6 py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-lg transform transition-all hover:bg-yellow-500 hover:scale-105"
      >
        {slides[currentIndex].buttonText}
      </button>
    </div>
  ) : slides[currentIndex].id === 2 || slides[currentIndex].id === 3|| slides[currentIndex].id === 4 || slides[currentIndex].id === 5? (
    // كارد الثانية: نصوص مثل ما هي، زر مثل الكارد الأولى
    <>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
        {slides[currentIndex].title}
      </h2>
      <p className="mb-6 text-xl md:text-lg max-w-md drop-shadow-md">
        {slides[currentIndex].description}
      </p>
      <button
        onClick={slides[currentIndex].buttonAction}
        className="px-6 py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-lg transform transition-all hover:bg-yellow-500 hover:scale-105"
      >
        {slides[currentIndex].buttonText}
      </button>
    </>
  ) : (
    // باقي الكاروسيل
    <>
      <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
        {slides[currentIndex].title}
      </h2>
      <p className="mb-6 text-xl md:text-lg max-w-md drop-shadow-md">
        {slides[currentIndex].description}
      </p>
      <button
        onClick={slides[currentIndex].buttonAction}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2"
      >
        {slides[currentIndex].buttonText} <ArrowRightIcon className="w-5 h-5" />
      </button>
    </>
  )}
</div>




      {/* Indicators / نقاط أسفل الصورة */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((slide, index) => (
          <span
            key={slide.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              index === currentIndex ? "bg-white" : "bg-gray-400"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
}
