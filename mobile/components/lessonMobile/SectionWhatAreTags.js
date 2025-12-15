import React from "react";
import { View, Text } from "react-native";

export default function SectionWhatAreTags({ sec }) {
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
      <Text style={{ color: "#555", lineHeight: 22, marginBottom: 20 }}>
        {sec.text}
      </Text>

      {/* مثال المقارنة */}
      <View
        style={{
          backgroundColor: "#fff7e6",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#fde68a",
          padding: 15,
        }}
      >
        <Text
          style={{
            color: "#92400e",
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 8,
          }}
        >
          Example:
        </Text>

        {/* بدون تاج */}
        <View
          style={{
            backgroundColor: "#fee2e2",
            padding: 10,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: "#991b1b" }}>Hello World!</Text>
          <Text style={{ fontSize: 12, color: "#7f1d1d", marginTop: 4 }}>
            Plain text (no formatting)
          </Text>
        </View>

        {/* السهم */}
        <Text
          style={{
            textAlign: "center",
            fontSize: 22,
            color: "#d97706",
            marginVertical: 8,
          }}
        >
          ↓
        </Text>

        {/* مع تاج */}
        <View
          style={{
            backgroundColor: "#dcfce7",
            padding: 10,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: "#065f46" }}>
            {"<p>Hello World!</p>"}
          </Text>
          <Text style={{ fontSize: 12, color: "#047857", marginTop: 4 }}>
            Wrapped inside a paragraph tag
          </Text>
        </View>
      </View>

      {/* ملاحظة ختامية */}
      <Text
        style={{
          marginTop: 18,
          fontSize: 14,
          color: "#6b7280",
          lineHeight: 20,
        }}
      >
        Tags tell the browser how to structure and display content — without
        them, everything would look the same.
      </Text>
    </View>
  );
}
