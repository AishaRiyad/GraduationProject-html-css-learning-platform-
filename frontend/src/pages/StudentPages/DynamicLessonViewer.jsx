import React from "react";
import { useParams } from "react-router-dom";
import LessonViewer from "./LessonViewer";
import LessonViewer2 from "./LessonViewer2";
import LessonViewer3 from "./LessonViewer3";
import LessonViewer4 from "./LessonViewer4";
import LessonViewer5 from "./LessonViewer5";
import LessonViewer6 from "./LessonViewer6";
import LessonViewer7 from "./LessonViewer7";
import LessonViewer8 from "./LessonViewer8";
import LessonViewer9 from "./LessonViewer9";
import LessonViewer10 from "./LessonViewer10";
import LessonViewer11 from "./LessonViewer11";
import LessonViewer12 from "./LessonViewer12";
import LessonViewer13 from "./LessonViewer13";
import LessonViewer14 from "./LessonViewer14";
import LessonViewer15 from "./LessonViewer15";
export default function DynamicLessonViewer() {
  const { lessonId } = useParams();

  if (lessonId === "1") return <LessonViewer />;
  if (lessonId === "2") return <LessonViewer2 />;
    if (lessonId === "3") return <LessonViewer3 />;
    if (lessonId === "4") return <LessonViewer4 />;
if (lessonId === "5") return <LessonViewer5 />;
  if (lessonId === "6") return <LessonViewer6 />;
   if (lessonId === "7") return <LessonViewer7 />;
    if (lessonId === "8") return <LessonViewer8 />;
    if (lessonId === "9") return <LessonViewer9 />;
     if (lessonId === "10") return <LessonViewer10 />;
          if (lessonId === "11") return <LessonViewer11 />;
          if (lessonId === "12") return <LessonViewer12 />;
           if (lessonId === "13") return <LessonViewer13 />;
           if (lessonId === "14") return <LessonViewer14 />;
            if (lessonId === "15") return <LessonViewer15 />;
  // ممكن تضيفي دروس تانية بنفس الفكرة
  return <LessonViewer />; // افتراضي لباقي الدروس
}
