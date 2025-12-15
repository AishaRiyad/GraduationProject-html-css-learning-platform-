import React from "react";
import { View, Text } from "react-native";

export default function SectionEmptyTags({ sec }) {
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
      {/* عنوان القسم */}
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

      {/* النص */}
      <Text style={{ color: "#555", lineHeight: 22, marginBottom: 18 }}>
        {sec.text}
      </Text>

      {/* مربع المثال */}
      <View
        style={{
          backgroundColor: "#fff7e6",
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#fde68a",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color: "#92400e",
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 10,
          }}
        >
          Example:
        </Text>

        {/* كود الوسوم */}
        <View
          style={{
            backgroundColor: "#f9fafb",
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <Text style={{ fontFamily: "monospace", fontSize: 15 }}>
            {sec.example}
          </Text>
        </View>
      </View>

      {/* معاينة الوسوم الفارغة */}
      <View
        style={{
          backgroundColor: "#ecfdf5",
          padding: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#d1fae5",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color: "#047857",
            fontWeight: "bold",
            marginBottom: 6,
            fontSize: 15,
          }}
        >
          What these tags do:
        </Text>

        <Text style={{ color: "#065f46", marginBottom: 6 }}>
          • {"<br>"} → adds a line break
        </Text>
        <Text style={{ color: "#065f46", marginBottom: 6 }}>
          • {"<hr>"} → adds a horizontal line
        </Text>
        <Text style={{ color: "#065f46" }}>
          • {"<img>"} → displays an image
        </Text>
      </View>

      {/* ملخص */}
      <Text style={{ color: "#6b7280", lineHeight: 20 }}>
        Empty tags don’t contain inner content — they close themselves. They are
        commonly used for images, spacing, and page structure.
      </Text>
    </View>
  );
}
