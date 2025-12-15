import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";

export default function SectionRenderer({ section }) {
  if (!section) return null;

  const [userCode, setUserCode] = useState("");
  const [aiReview, setAiReview] = useState("");

  const renderIntro = () => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: "#fde68a",
        marginBottom: 25,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#d97706",
          marginBottom: 10,
        }}
      >
        {section.heading}
      </Text>

      <Text style={{ color: "#555", lineHeight: 22 }}>{section.text}</Text>

      {section.image && (
        <Image
          source={{ uri: `http://10.0.2.2:5000${section.image}` }}
          style={{
            width: "100%",
            height: 180,
            resizeMode: "contain",
            marginTop: 15,
          }}
        />
      )}
    </View>
  );

  const renderBasic = () => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: "#fde68a",
        marginBottom: 25,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#d97706",
          marginBottom: 10,
        }}
      >
        {section.heading}
      </Text>

      <Text style={{ color: "#555", lineHeight: 22, marginBottom: 15 }}>
        {section.text}
      </Text>

      {section.example && (
        <View
          style={{
            backgroundColor: "#f9fafb",
            borderWidth: 1,
            borderColor: "#e5e7eb",
            padding: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontFamily: "monospace", fontSize: 14 }}>
            {section.example}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyTags = () => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: "#fde68a",
        marginBottom: 25,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#d97706",
          marginBottom: 10,
        }}
      >
        {section.heading}
      </Text>

      <Text style={{ color: "#555", marginBottom: 15 }}>{section.text}</Text>

      <View
        style={{
          backgroundColor: "#f9fafb",
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text style={{ fontFamily: "monospace" }}>{section.example}</Text>
      </View>

      <Text
        style={{ marginTop: 12, color: "#6b7280", fontStyle: "italic" }}
      >
        These tags do not contain content inside.
      </Text>
    </View>
  );

  const renderCommonTags = () => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: "#fde68a",
        marginBottom: 25,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#d97706",
          marginBottom: 10,
        }}
      >
        {section.heading}
      </Text>

      <Text style={{ color: "#555", marginBottom: 15 }}>{section.text}</Text>

      {section.tags?.map((tag, index) => (
        <View
          key={index}
          style={{
            backgroundColor: "#fff7e6",
            marginBottom: 12,
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#fde68a",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#c2410c" }}>
            &lt;{tag.tag}&gt;
          </Text>
          <Text style={{ color: "#6b7280", marginTop: 4 }}>{tag.desc}</Text>

          <View
            style={{
              backgroundColor: "#f9fafb",
              borderWidth: 1,
              borderColor: "#e5e7eb",
              padding: 10,
              borderRadius: 8,
              marginTop: 10,
            }}
          >
            <Text style={{ fontFamily: "monospace" }}>{tag.example}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMiniProject = () => (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#fde68a",
        marginBottom: 25,
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#d97706",
          marginBottom: 12,
        }}
      >
        {section.heading}
      </Text>

      <Text style={{ color: "#555", marginBottom: 15 }}>{section.task}</Text>

      <TextInput
        multiline
        placeholder="Write your HTML code here..."
        value={userCode}
        onChangeText={setUserCode}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "#fefce8",
          height: 130,
          padding: 12,
          borderRadius: 14,
          fontFamily: "monospace",
          marginBottom: 15,
        }}
      />

      <TouchableOpacity
        onPress={() => setAiReview("AI reviewing your code...")}
        style={{
          backgroundColor: "#facc15",
          paddingVertical: 12,
          borderRadius: 50,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "bold", color: "white" }}>
          🤖 Review with AI
        </Text>
      </TouchableOpacity>

      {aiReview ? (
        <View
          style={{
            backgroundColor: "#fff7e6",
            padding: 12,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#fde68a",
            marginTop: 15,
          }}
        >
          <Text>{aiReview}</Text>
        </View>
      ) : null}
    </View>
  );

  // -------------------------
  // SECTION MAPPING
  // -------------------------
  switch (section.id) {
    case "intro":
      return renderIntro();
    case "what-are-tags":
    case "tag-structure":
      return renderBasic();
    case "empty-tags":
      return renderEmptyTags();
    case "nested-tags":
      return renderBasic();
    case "common-tags":
      return renderCommonTags();
    case "mini-project":
      return renderMiniProject();
    default:
      return renderBasic();
  }
}
