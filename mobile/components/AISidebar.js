// components/lesson/AISidebar.js
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";

export default function AISidebar({ visible, onClose }) {
  const [aiQuestion, setAiQuestion] = useState("");
  const [chat, setChat] = useState([]);

  const handleAsk = async () => {
    if (!aiQuestion.trim()) return alert("Please type a question!");

    const newMsg = { question: aiQuestion, answer: "🤖 Thinking..." };
    setChat((prev) => [...prev, newMsg]);
    setAiQuestion("");

    try {
      const res = await fetch("http://10.0.2.2:5000/api/mobile/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: newMsg.question }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let stream = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        stream += decoder.decode(value);

        setChat((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].answer = stream;
          return updated;
        });
      }
    } catch (err) {
      setChat((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].answer =
          "⚠️ Failed to connect to AI. Try again.";
        return updated;
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      {/* الخلفية الداكنة */}
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        {/* الشريط الجانبي */}
        <View
          style={{
            height: "100%",
            width: "85%",
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 25,
            borderBottomLeftRadius: 25,
            alignSelf: "flex-end",
          }}
        >
          {/* رأس الشريط */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 15,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#ea580c",
              }}
            >
              🤖 Ask AI
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 26, color: "#555" }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* زر محادثة جديدة */}
          <TouchableOpacity
            onPress={() => setChat([])}
            style={{
              backgroundColor: "#fef9c3",
              paddingVertical: 10,
              borderRadius: 20,
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text style={{ color: "#ca8a04", fontWeight: "600" }}>
              🆕 New Chat
            </Text>
          </TouchableOpacity>

          {/* شاشة المحادثة */}
          <ScrollView
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#fcd34d",
              padding: 10,
              borderRadius: 15,
              backgroundColor: "#fffbeb",
            }}
          >
            {chat.length === 0 ? (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 30,
                  color: "#aaa",
                  fontStyle: "italic",
                }}
              >
                Ask me anything about HTML 👇
              </Text>
            ) : (
              chat.map((msg, i) => (
                <View key={i} style={{ marginBottom: 15 }}>
                  <View
                    style={{
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderColor: "#e5e7eb",
                      padding: 10,
                      borderRadius: 10,
                      marginBottom: 5,
                    }}
                  >
                    <Text style={{ fontWeight: "700", color: "#6b7280" }}>
                      You:
                    </Text>
                    <Text style={{ color: "#444" }}>{msg.question}</Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: "#ffedd5",
                      borderWidth: 1,
                      borderColor: "#fdba74",
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontWeight: "700", color: "#ea580c" }}>
                      AI:
                    </Text>
                    <Text style={{ color: "#444" }}>{msg.answer}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* مدخل السؤال */}
          <Text style={{ marginTop: 15, fontWeight: "600", marginBottom: 5 }}>
            Your Question
          </Text>

          <TextInput
            value={aiQuestion}
            onChangeText={setAiQuestion}
            multiline
            style={{
              borderWidth: 1,
              borderColor: "#fcd34d",
              borderRadius: 15,
              padding: 12,
              height: 90,
              backgroundColor: "#fffaf0",
            }}
            placeholder="Ask about any HTML tag..."
          />

          {/* زر الإرسال */}
          <TouchableOpacity
            onPress={handleAsk}
            style={{
              backgroundColor: "#f97316",
              padding: 14,
              borderRadius: 30,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: "white", fontSize: 16, fontWeight: "600" }}
            >
              🔍 Explain
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
