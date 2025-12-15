import React, { useRef, useState, useEffect } from "react";

export default function LessonVideo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showIcon, setShowIcon] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ✅ تشغيل / إيقاف الفيديو عند النقر
  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }

    // عرض أيقونة التشغيل / الإيقاف مؤقتًا
    setShowIcon(true);
    setTimeout(() => setShowIcon(false), 700);
  };

  // ✅ تحديث الشريط أثناء التشغيل
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      const progressValue = (video.currentTime / video.duration) * 100;
      setProgress(progressValue);
    }
  };

  // ✅ عند سحب شريط التقديم
  const handleProgressChange = (e) => {
    const video = videoRef.current;
    const newTime = (e.target.value / 100) * video.duration;
    video.currentTime = newTime;
    setProgress(e.target.value);
  };

  return (
    <div className="flex flex-col items-center my-6">
      <div
        className="relative w-[80%] max-w-[800px] h-[500px] rounded-lg overflow-hidden shadow-md border border-gray-300 bg-black group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 🎥 الفيديو */}
        <video
          ref={videoRef}
          src="/videos/lesson1.mp4"
          playsInline
          onClick={handleVideoClick}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* 🎯 أيقونة التشغيل / الإيقاف */}
        {showIcon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300">
            <span className="text-white text-6xl">
              {isPlaying ? "⏸" : "▶"}
            </span>
          </div>
        )}

        {/* 🎚 شريط التقديم (مخفي إلا عند hover) */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-2 accent-yellow-400 appearance-none bg-gray-600 rounded-full cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
