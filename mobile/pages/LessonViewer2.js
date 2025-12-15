// pages/LessonViewer2.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AISidebar from "../components/AISidebar";
import Quiz from "../components/Quiz";
import api from "../services/api";

// Section Components
import SectionWhatAreTags from "../components/lessonMobile/SectionWhatAreTags";
import SectionTagStructure from "../components/lessonMobile/SectionTagStructure";
import SectionEmptyTags from "../components/lessonMobile/SectionEmptyTags";
import SectionNestedTags from "../components/lessonMobile/SectionNestedTags";
import SectionCommonTags from "../components/lessonMobile/SectionCommonTags";
import SectionBlockInline from "../components/lessonMobile/SectionBlockInline";
import SectionAttributes from "../components/lessonMobile/SectionAttributes";
import SectionComments from "../components/lessonMobile/SectionComments";
import SectionBestPractices from "../components/lessonMobile/SectionBestPractices";
import SectionMiniProject from "../components/lessonMobile/SectionMiniProject";

export default function LessonViewer2({ navigation }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Load saved progress
  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem("lesson2_progress");
      if (saved) setCurrentIndex(parseInt(saved));
    };
    load();
  }, []);

  useEffect(() => {
    if (currentIndex >= 0) {
      AsyncStorage.setItem("lesson2_progress", String(currentIndex));
    }
  }, [currentIndex]);

  // Load lesson content
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/lessons/content/2");
        setLesson(res.data);
      } catch (e) {
        console.log("❌ Lesson load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#facc15" />
        <Text className="mt-2">Loading lesson...</Text>
      </View>
    );

  if (!lesson)
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500 text-lg">Lesson not found</Text>
      </View>
    );

  // =====================================================
  // Extract lesson structure
  // =====================================================
  const sections = lesson.content.sections;

  const intro = sections[0];

  const contentSections = [
    ...sections.filter((s) => s.id !== "intro" && s.id !== "quiz"),

    // ✨ إضافة قسم الكويز هنا:
    { id: "quiz-section", type: "quiz", heading: "Final Quiz" }
  ];

  const quizSection = sections.find((s) => s.id === "quiz") || { quiz: [] };
  const quizQuestions = quizSection.quiz || [];

  // =====================================================
  // Section Renderer
  // =====================================================
  const renderSection = (sec) => {
    // ✨ قسم الكويز
    if (sec.type === "quiz") {
      return (
        <Quiz
          lessonId={2}
          totalQuestions={quizQuestions.length}
          questions={quizQuestions}
          onPassed={() => {}}
        />
      );
    }

    switch (sec.id) {
      case "what-are-tags":
        return <SectionWhatAreTags sec={sec} />;

      case "tag-structure":
        return <SectionTagStructure sec={sec} />;

      case "empty-tags":
        return <SectionEmptyTags sec={sec} />;

      case "nested-tags":
        return <SectionNestedTags sec={sec} />;

      case "common-tags":
        return <SectionCommonTags sec={sec} />;

      case "block-inline":
        return <SectionBlockInline sec={sec} />;

      case "attributes":
        return <SectionAttributes sec={sec} />;

      case "comments":
        return <SectionComments sec={sec} />;

      case "best-practices":
        return <SectionBestPractices sec={sec} />;

      case "mini-project":
        return <SectionMiniProject sec={sec} />;

      default:
        return (
          <View className="p-4">
            <Text className="text-lg font-bold">{sec.heading}</Text>
            <Text className="text-gray-600 mt-2">{sec.text}</Text>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-[#FFFCEB]">

      {/* FIXED HEADER */}
      <View
        style={{
          paddingTop: 45,
          paddingBottom: 15,
          paddingHorizontal: 15,
          backgroundColor: "#FFF9C4",
          borderBottomWidth: 1,
          borderColor: "#FCD34D",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          elevation: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: "#FDE68A",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text>← Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#D97706" }}>
          {lesson.title}
        </Text>

        <TouchableOpacity
          onPress={() => setAiOpen(true)}
          style={{
            backgroundColor: "#FB923C",
            padding: 10,
            borderRadius: 50,
          }}
        >
          <Text style={{ fontSize: 20 }}>🤖</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView className="flex-1 p-4 mt-2">

        {/* UDEMY STYLE TOC */}
        <TouchableOpacity
          onPress={() => setDropdownOpen(!dropdownOpen)}
          style={{
            backgroundColor: "#FEF3C7",
            padding: 15,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: "#FACC15",
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#D97706",
              marginBottom: dropdownOpen ? 10 : 0,
            }}
          >
            {dropdownOpen ? "▼ Lesson Progress" : "► Lesson Progress"}
          </Text>

          {dropdownOpen &&
            contentSections.map((sec, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setCurrentIndex(i);
                  setDropdownOpen(false);
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 5,
                  borderRadius: 10,
                  backgroundColor:
                    currentIndex === i ? "#FDE68A" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: currentIndex === i ? "#B45309" : "#6B7280",
                  }}
                >
                  {sec.heading}
                </Text>
              </TouchableOpacity>
            ))}
        </TouchableOpacity>

        {/* SECTION CONTENT */}
        {renderSection(contentSections[currentIndex])}

        {/* BUTTONS */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 25,
            marginBottom: 40,
            paddingHorizontal: 4,
          }}
        >
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={() => setCurrentIndex(currentIndex - 1)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#E5E7EB",
                paddingVertical: 12,
                paddingHorizontal: 15,
                borderRadius: 30,
                borderWidth: 1,
                borderColor: "#D1D5DB",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 6 }}>←</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#374151" }}>
                Previous
              </Text>
            </TouchableOpacity>
          )}

          {currentIndex < contentSections.length - 1 && (
            <TouchableOpacity
              onPress={() => setCurrentIndex(currentIndex + 1)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FACC15",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 30,
                shadowColor: "#F59E0B",
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
                marginLeft: "auto",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "white",
                  marginRight: 6,
                }}
              >
                Next
              </Text>
              <Text style={{ fontSize: 18, color: "white" }}>→</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* AI Sidebar */}
      <AISidebar visible={aiOpen} onClose={() => setAiOpen(false)} />
    </View>
  );
}
