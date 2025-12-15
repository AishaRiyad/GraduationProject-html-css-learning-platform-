// components/ProgressSidebar.js
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function ProgressSidebar({ sections, currentIndex, setCurrentIndex }) {
  const progress = Math.round(((currentIndex + 1) / sections.length) * 100);

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "white",
        borderColor: "#fcd34d",
        borderWidth: 1,
        padding: 18,
        borderRadius: 22,
        marginBottom: 18,
        elevation: 4,
      }}
    >
      <Text
        style={{
          textAlign: "center",
          fontSize: 22,
          fontWeight: "bold",
          color: "#d97706",
          marginBottom: 14,
        }}
      >
        Lesson Progress
      </Text>

      <ScrollView style={{ maxHeight: 310 }} showsVerticalScrollIndicator={false}>
        {sections.map((sec, i) => {
          const isActive = i === currentIndex;
          const isCompleted = i < currentIndex;

          return (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentIndex(i)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 10,
                backgroundColor: isActive
                  ? "#fff7cc"
                  : isCompleted
                  ? "#ecfdf5"
                  : "transparent",
                borderLeftWidth: isActive ? 4 : 0,
                borderLeftColor: "#facc15",
                borderRadius: 10,
                marginBottom: 8,
              }}
            >
              {/* Circle */}
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: isActive
                    ? "#f59e0b"
                    : isCompleted
                    ? "#10b981"
                    : "#d1d5db",
                  backgroundColor: isActive
                    ? "#fbbf24"
                    : isCompleted
                    ? "#6ee7b7"
                    : "transparent",
                  marginRight: 12,
                }}
              />

              {/* Section Title */}
              <Text
                style={{
                  flexShrink: 1,
                  color: isActive
                    ? "#b45309"
                    : isCompleted
                    ? "#047857"
                    : "#6b7280",
                  fontWeight: isActive ? "bold" : "500",
                  fontSize: 15,
                }}
              >
                {sec.heading}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Progress % */}
      <View
        style={{
          marginTop: 12,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "#fde68a",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 15, color: "#6b7280" }}>
          Progress:{" "}
          <Text style={{ fontSize: 17, fontWeight: "bold", color: "#d97706" }}>
            {progress}%
          </Text>
        </Text>
      </View>
    </View>
  );
}
