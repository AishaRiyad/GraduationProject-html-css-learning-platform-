import React from "react";
import { View, Text } from "react-native";

export default function SectionBestPractices({ sec }) {
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
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        {sec.heading}
      </Text>

      {/* توضيح بسيط */}
      <Text style={{ textAlign: "center", color: "#6b7280", marginBottom: 18 }}>
        Here are common mistakes and their correct versions 👇
      </Text>

      {/* قائمة الأخطاء والصواب */}
      {sec.items?.map((item, idx) => (
        <View
          key={idx}
          style={{
            backgroundColor: "#fff7e6",
            borderWidth: 1,
            borderColor: "#fde68a",
            borderRadius: 16,
            padding: 14,
            marginBottom: 14,
          }}
        >
          {/* Incorrect */}
          <Text
            style={{
              color: "#dc2626",
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 15,
            }}
          >
            ❌ Incorrect
          </Text>

          <View
            style={{
              backgroundColor: "#fee2e2",
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#fecaca",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "monospace",
                color: "#991b1b",
              }}
            >
              {item.bad}
            </Text>
          </View>

          {/* Correct */}
          <Text
            style={{
              color: "#059669",
              fontWeight: "bold",
              marginBottom: 6,
              fontSize: 15,
            }}
          >
            ✅ Correct
          </Text>

          <View
            style={{
              backgroundColor: "#d1fae5",
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#a7f3d0",
            }}
          >
            <Text
              style={{
                fontFamily: "monospace",
                color: "#065f46",
              }}
            >
              {item.good}
            </Text>
          </View>
        </View>
      ))}

      {/* ملاحظات ختامية */}
      <View
        style={{
          marginTop: 10,
          backgroundColor: "#fef3c7",
          padding: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#fde68a",
        }}
      >
        <Text style={{ color: "#92400e", fontWeight: "600", marginBottom: 4 }}>
          💡 Remember:
        </Text>

        <Text style={{ color: "#6b7280", lineHeight: 20 }}>
          • Always close your tags properly.{"\n"}
          • Use lowercase tag names for clean code.{"\n"}
          • Keep HTML neat and readable.
        </Text>
      </View>
    </View>
  );
}
