import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";

export default function SectionMiniProject({ sec }) {
  const [userCode, setUserCode] = useState("");
  const [aiReview, setAiReview] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const handleReview = async () => {
    if (!userCode.trim()) {
      alert("Please write some HTML code first!");
      return;
    }

    setLoadingAI(true);
    setAiReview("🤖 Thinking...");

    try {
      const response = await fetch("http://10.0.2.2:5000/api/ai-local/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            "Review this beginner HTML code and give suggestions:\n" + userCode,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setAiReview(result);
      }
    } catch (err) {
      setAiReview("⚠ Unable to connect to AI. Try again.");
    }

    setLoadingAI(false);
  };

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

      {/* المهمة */}
      <Text
        style={{
          color: "#6b7280",
          textAlign: "center",
          marginBottom: 18,
          fontSize: 15,
        }}
      >
        {sec.task}
      </Text>

      {/* محرر الكود */}
      <Text
        style={{
          color: "#374151",
          fontWeight: "600",
          marginBottom: 6,
        }}
      >
        ✏️ Write your HTML code:
      </Text>

      <TextInput
        multiline
        value={userCode}
        onChangeText={setUserCode}
        placeholder={`<h1>My First Web Page</h1>\n<p>Hello World!</p>`}
        style={{
          height: 150,
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 12,
          padding: 12,
          backgroundColor: "#f9fafb",
          fontFamily: "monospace",
          textAlignVertical: "top",
          marginBottom: 20,
        }}
      />

      {/* Live Preview */}
      <Text
        style={{
          color: "#374151",
          fontWeight: "600",
          marginBottom: 6,
        }}
      >
        🌐 Live Preview:
      </Text>

      <View
        style={{
          height: 220,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "white",
          marginBottom: 20,
        }}
      >
        <WebView source={{ html: userCode }} />
      </View>

      {/* زر AI */}
      <TouchableOpacity
        onPress={handleReview}
        disabled={loadingAI}
        style={{
          backgroundColor: "#facc15",
          paddingVertical: 12,
          borderRadius: 30,
          alignItems: "center",
          marginBottom: 12,
          opacity: loadingAI ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          🤖 Review with AI
        </Text>
      </TouchableOpacity>

      {/* نتيجة AI */}
      {aiReview ? (
        <ScrollView
          style={{
            maxHeight: 200,
            backgroundColor: "#fef9c3",
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#fde68a",
          }}
        >
          <Text style={{ color: "#7c2d12", fontSize: 14 }}>{aiReview}</Text>
        </ScrollView>
      ) : null}
    </View>
  );
}
