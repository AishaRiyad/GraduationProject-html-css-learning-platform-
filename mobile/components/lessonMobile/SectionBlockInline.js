import React from "react";
import { View, Text } from "react-native";

export default function SectionBlockInline({ sec }) {
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

      {/* الوصف */}
      <Text style={{ color: "#555", lineHeight: 22, marginBottom: 20 }}>
        {sec.text}
      </Text>

      {/* مثال block elements */}
      <View
        style={{
          backgroundColor: "#fff7e6",
          padding: 14,
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
            marginBottom: 8,
            fontSize: 16,
          }}
        >
          Block Elements:
        </Text>

        {/* الصندوقين */}
        <View style={{ gap: 10 }}>
          <View
            style={{
              backgroundColor: "#fef3c7",
              padding: 12,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "monospace",
                color: "#b45309",
                fontSize: 14,
              }}
            >
              {"<div>Block 1</div>"}
            </Text>

            <View
              style={{
                marginTop: 10,
                backgroundColor: "#fde68a",
                height: 25,
                borderRadius: 8,
                justifyContent: "center",
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: "#92400e" }}>Block 1 (full width)</Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#fef3c7",
              padding: 12,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontFamily: "monospace",
                color: "#b45309",
                fontSize: 14,
              }}
            >
              {"<div>Block 2</div>"}
            </Text>

            <View
              style={{
                marginTop: 10,
                backgroundColor: "#fde68a",
                height: 25,
                borderRadius: 8,
                justifyContent: "center",
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: "#92400e" }}>Block 2 (full width)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* مثال inline elements */}
      <View
        style={{
          backgroundColor: "#ecfdf5",
          padding: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#bbf7d0",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            color: "#047857",
            fontWeight: "bold",
            marginBottom: 8,
            fontSize: 16,
          }}
        >
          Inline Elements:
        </Text>

        {/* الصندوقين inline */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <View
            style={{
              backgroundColor: "#d1fae5",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontFamily: "monospace", color: "#065f46" }}>
              {"<span>Inline 1</span>"}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#d1fae5",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontFamily: "monospace", color: "#065f46" }}>
              {"<span>Inline 2</span>"}
            </Text>
          </View>
        </View>

        <Text
          style={{
            marginTop: 8,
            color: "#065f46",
            fontSize: 13,
          }}
        >
          Inline elements stay on the same line.
        </Text>
      </View>

      {/* نص ختامي */}
      <Text style={{ color: "#6b7280", lineHeight: 20 }}>
        Understanding the difference between block and inline elements is
        essential for page layout and structure.
      </Text>
    </View>
  );
}
