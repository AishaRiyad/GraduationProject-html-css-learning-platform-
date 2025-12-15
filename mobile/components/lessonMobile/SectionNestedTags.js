import React from "react";
import { View, Text } from "react-native";

export default function SectionNestedTags({ sec }) {
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
          color: "#c2410c",
          marginBottom: 12,
        }}
      >
        {sec.heading}
      </Text>

      {/* وصف القسم */}
      <Text style={{ color: "#555", lineHeight: 22, marginBottom: 20 }}>
        {sec.text}
      </Text>

      {/* مربع الشرح */}
      <View
        style={{
          backgroundColor: "#fff7e6",
          padding: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#fde68a",
        }}
      >
        {/* مثال بدون تداخل */}
        <View
          style={{
            backgroundColor: "#fee2e2",
            padding: 12,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#991b1b", fontWeight: "bold" }}>
            Without Nesting:
          </Text>

          <Text
            style={{
              marginTop: 5,
              fontSize: 14,
              color: "#7f1d1d",
              fontFamily: "monospace",
            }}
          >
            This is bold text.
          </Text>

          <Text
            style={{
              marginTop: 4,
              fontSize: 12,
              color: "#7f1d1d",
              fontStyle: "italic",
            }}
          >
            No formatting applied — plain text.
          </Text>
        </View>

        {/* السهم */}
        <Text
          style={{
            textAlign: "center",
            color: "#d97706",
            fontSize: 22,
            marginBottom: 16,
          }}
        >
          ↓
        </Text>

        {/* مثال مع تداخل */}
        <View
          style={{
            backgroundColor: "#dcfce7",
            padding: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#047857", fontWeight: "bold" }}>
            With Nesting:
          </Text>

          <View
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              padding: 10,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                color: "#065f46",
              }}
            >
              {sec.example}
            </Text>
          </View>

          <Text
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "#065f46",
            }}
          >
            Rendered Output:{" "}
            <Text style={{ fontWeight: "bold", color: "#064e3b" }}>
              This is <Text style={{ fontWeight: "bold" }}>bold</Text> text.
            </Text>
          </Text>
        </View>
      </View>

      {/* شرح إضافي */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ color: "#6b7280", lineHeight: 20 }}>
          Think of nested tags as boxes inside other boxes.  
          The inner tag applies formatting to part of the content inside the outer tag.
        </Text>
      </View>
    </View>
  );
}
