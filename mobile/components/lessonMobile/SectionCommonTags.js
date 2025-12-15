import React from "react";
import { View, Text } from "react-native";

export default function SectionCommonTags({ sec }) {
  if (!sec || !sec.tags) return null;

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

      {/* نص الشرح */}
      <Text style={{ color: "#555", lineHeight: 22, marginBottom: 16 }}>
        {sec.text}
      </Text>

      {/* البطاقات */}
      <View style={{ gap: 16 }}>
        {sec.tags.map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "white",
              padding: 15,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              elevation: 2,
            }}
          >
            {/* اسم الوسم */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#c2410c",
                marginBottom: 6,
              }}
            >
              &lt;{item.tag}&gt;
            </Text>

            {/* الوصف */}
            <Text
              style={{
                color: "#6b7280",
                marginBottom: 10,
                fontSize: 14,
              }}
            >
              {item.desc}
            </Text>

            {/* كود المثال */}
            <View
              style={{
                backgroundColor: "#f9fafb",
                padding: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e5e7eb",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontFamily: "monospace", fontSize: 14 }}>
                {item.example}
              </Text>
            </View>

            {/* مخرجات الوسم */}
            <View
              style={{
                backgroundColor: "#ecfdf5",
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#bbf7d0",
              }}
            >
              <Text style={{ color: "#047857", fontWeight: "bold" }}>
                Rendered Output:
              </Text>

              <View style={{ marginTop: 6 }}>
                {item.tag === "h1" && (
                  <Text
                    style={{
                      fontSize: 22,
                      color: "#c2410c",
                      fontWeight: "bold",
                    }}
                  >
                    Title
                  </Text>
                )}

                {item.tag === "p" && (
                  <Text style={{ color: "#374151" }}>Text here</Text>
                )}

                {item.tag === "a" && (
                  <Text style={{ color: "#2563eb", textDecorationLine: "underline" }}>
                    Click me
                  </Text>
                )}

                {item.tag === "img" && (
                  <Text style={{ color: "#6b7280", fontStyle: "italic" }}>
                    (image would display here)
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* نص ختامي */}
      <Text
        style={{
          marginTop: 20,
          color: "#6b7280",
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        These are some of the most common HTML tags you'll use to structure web
        pages.
      </Text>
    </View>
  );
}
