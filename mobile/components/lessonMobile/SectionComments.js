import React from "react";
import { View, Text } from "react-native";

export default function SectionComments({ sec }) {
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

      {/* الشرح */}
      <Text style={{ color: "#555", lineHeight: 22, marginBottom: 18 }}>
        {sec.text}
      </Text>

      {/* المثال */}
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
            marginBottom: 8,
            fontSize: 16,
          }}
        >
          Example:
        </Text>

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

      {/* كيف يظهر للمستخدم */}
      <View
        style={{
          backgroundColor: "#ecfdf5",
          padding: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#bbf7d0",
        }}
      >
        <Text
          style={{
            color: "#047857",
            fontWeight: "bold",
            marginBottom: 8,
            fontSize: 15,
          }}
        >
          Rendered Output:
        </Text>

        <Text style={{ color: "#065f46", marginBottom: 4 }}>
          The comment is invisible to the user.
        </Text>

        <Text style={{ color: "#065f46", fontWeight: "bold" }}>
          Visible text
        </Text>
      </View>

      {/* ملاحظة */}
      <Text
        style={{
          marginTop: 20,
          color: "#6b7280",
          lineHeight: 20,
        }}
      >
        Comments are useful for leaving notes in HTML files—browsers ignore them,
        and visitors never see them.
      </Text>
    </View>
  );
}
