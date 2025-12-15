import React from "react";
import { View, Text } from "react-native";

export default function SectionTagStructure({ sec }) {
  if (!sec) return null;

  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#fde68a",
        marginBottom: 25,
        elevation: 4,
      }}
    >
      {/* العنوان */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#d97706",
          marginBottom: 10,
        }}
      >
        {sec.heading}
      </Text>

      {/* الوصف */}
      <Text
        style={{
          color: "#555",
          lineHeight: 22,
          marginBottom: 16,
        }}
      >
        {sec.text}
      </Text>

      {/* مربع المثال */}
      <View
        style={{
          backgroundColor: "#fff7e6",
          borderRadius: 16,
          borderColor: "#fde68a",
          borderWidth: 1,
          padding: 18,
        }}
      >
        {/* عنوان المثال */}
        <Text
          style={{
            color: "#92400e",
            fontWeight: "bold",
            marginBottom: 8,
            fontSize: 16,
          }}
        >
          Example:
        </Text>

        {/* كود المثال */}
        <View
          style={{
            backgroundColor: "#f9fafb",
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            marginBottom: 18,
          }}
        >
          <Text style={{ fontFamily: "monospace", fontSize: 15 }}>
            {sec.example}
          </Text>
        </View>

        {/* الشرح التفصيلي للأجزاء الثلاثة */}
        <Text
          style={{
            color: "#6b7280",
            fontSize: 15,
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          A basic HTML tag consists of these parts:
        </Text>

        {/* الأجزاء */}
        <View
          style={{
            flexDirection: "column",
            gap: 12,
            marginBottom: 15,
          }}
        >
          {/* Opening tag */}
          <View
            style={{
              backgroundColor: "#dcfce7",
              padding: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#047857", fontWeight: "bold" }}>
              🟢 Opening Tag:
            </Text>
            <Text style={{ fontFamily: "monospace", color: "#065f46" }}>
              {"<p>"}
            </Text>
          </View>

          {/* Content */}
          <View
            style={{
              backgroundColor: "#fef9c3",
              padding: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#854d0e", fontWeight: "bold" }}>
              🟡 Content:
            </Text>
            <Text style={{ color: "#854d0e" }}>
              This is a paragraph
            </Text>
          </View>

          {/* Closing tag */}
          <View
            style={{
              backgroundColor: "#fee2e2",
              padding: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#b91c1c", fontWeight: "bold" }}>
              🔴 Closing Tag:
            </Text>
            <Text style={{ fontFamily: "monospace", color: "#991b1b" }}>
              {"</p>"}
            </Text>
          </View>
        </View>
      </View>

      {/* ملخص */}
      <Text
        style={{
          marginTop: 20,
          color: "#6b7280",
          lineHeight: 20,
        }}
      >
        Understanding tag structure is essential — almost every HTML tag follows
        this exact pattern.
      </Text>
    </View>
  );
}
