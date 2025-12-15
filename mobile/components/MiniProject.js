// components/lesson/MiniProjectSection.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { WebView } from "react-native-webview";

export default function MiniProjectSection({ sec }) {
  const [userCode, setUserCode] = useState("");
  const [aiReview, setAiReview] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);

  const handleReview = async () => {
    if (!userCode.trim()) {
      alert("Please write some HTML code first!");
      return;
    }

    setAiReview("🤖 Thinking...");
    setShowCongrats(false);

    const question = `Review this beginner HTML code and give suggestions:\n${userCode}`;

    try {
      const res = await fetch("http://10.0.2.2:5000/api/ai-local/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setAiReview(result);
      }

      setShowCongrats(true);
    } catch (err) {
      console.error(err);
      setAiReview("⚠️ Failed to connect to AI. Please try again.");
    }
  };

  return (
    <ScrollView className="bg-[#FFFCEB] border border-gray-200 rounded-2xl p-6 shadow-inner mb-10">
      {/* العنوان */}
      <Text className="text-xl font-semibold text-gray-800 mb-4 text-center">
        ✏️ Write your HTML code below:
      </Text>

      {/* Textarea */}
      <TextInput
        multiline
        className="w-full h-48 border border-gray-300 rounded-xl p-4 font-mono text-sm bg-gray-50 mb-6"
        placeholder={`<h1>My First Web Page</h1>\n<p>Hello World!</p>\n<img src="image.jpg">\n<a href="#">Visit me</a>`}
        value={userCode}
        onChangeText={setUserCode}
      />

      {/* Live Preview */}
      <View className="border border-gray-300 rounded-xl overflow-hidden shadow mb-6">
        <Text className="bg-gray-100 text-gray-700 text-center py-2 font-semibold border-b">
          🌐 Live Preview
        </Text>
        <View style={{ height: 250 }}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: userCode }}
            style={{ flex: 1, backgroundColor: "white" }}
          />
        </View>
      </View>

      {/* Review with AI */}
      <View className="mt-4 mb-6">
        <Text className="text-gray-700 text-center mb-3">
          Want feedback on your HTML page? Let the AI review it 👇
        </Text>

        <TouchableOpacity
          onPress={handleReview}
          className="bg-yellow-400 px-6 py-3 rounded-full shadow text-center mx-auto"
        >
          <Text className="text-white font-semibold text-base">🤖 Review with AI</Text>
        </TouchableOpacity>

        {aiReview !== "" && (
          <View className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-inner">
            <Text className="text-gray-800 text-sm whitespace-pre-line">
              {aiReview}
            </Text>
          </View>
        )}
      </View>

      {/* Congratulations box */}
      {showCongrats && (
        <View className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6 shadow text-center">
          <Text className="text-gray-800 text-lg font-semibold mb-2">🌟 Congratulations!</Text>
          <Text className="text-gray-700">
            You just built your first HTML web page — and used AI to review it!  
            Keep experimenting and adding new elements 💪
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
