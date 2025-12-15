import React from "react";
import { View, Text } from "react-native";

export default function SectionAttributes({ sec }) {
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
      <Text style={{ color: "#555", lineHeight: 22, marginBottom: 20 }}>
        {sec.text}
      </Text>

      {/* صندوق المثال */}
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
            color: "#c2410c",
            fontWeight: "bold",
            marginBottom: 10,
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
          }}
        >
          <Text style={{ fontFamily: "monospace", fontSize: 15 }}>
            {sec.example}
          </Text>
        </View>
      </View>

      {/* معاينة بسيطة */}
      <View
        style={{
          backgroundColor: "#ecfdf5",
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#bbf7d0",
          marginBottom: 25,
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
          How attributes work:
        </Text>

        <Text style={{ color: "#065f46", marginBottom: 6 }}>
          • <Text style={{ fontFamily: "monospace" }}>src</Text> → image file path
        </Text>

        <Text style={{ color: "#065f46", marginBottom: 6 }}>
          • <Text style={{ fontFamily: "monospace" }}>alt</Text> → alternative text
        </Text>

        <Text style={{ color: "#065f46" }}>
          • <Text style={{ fontFamily: "monospace" }}>width / height</Text> → size control
        </Text>
      </View>

      {/* نص ختامي */}
      <Text style={{ color: "#6b7280", lineHeight: 20 }}>
        Attributes add extra details to a tag—like image source, alternative text,
        size, links, and more. They’re essential for controlling behavior and
        accessibility.
      </Text>
    </View>
  );
}
