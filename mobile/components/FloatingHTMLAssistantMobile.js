import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";

/**
 * 💬 FloatingHTMLAssistantMobile
 * نفس الفكرة تبع الويب — زر عائم + ChatBox
 */

export default function FloatingHTMLAssistantMobile() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuestion = async () => {
    if (!question.trim()) return;

    setMessages([...messages, { from: "user", text: question }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await axios.post("http://10.0.2.2:5000/api/ai-local/html-assistant", {
        question,
      });

      setMessages((prev) => [
        ...prev,
        { from: "ai", text: res.data.answer },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ Error reaching AI Assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 💬 Floating button */}
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={styles.floatingBtn}
      >
        <Text style={styles.floatingBtnText}>💬</Text>
      </TouchableOpacity>

      {/* 📦 Chat box */}
      {open && (
        <View style={styles.chatBox}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatHeaderText}>🤖 HTML Assistant</Text>
          </View>

          <ScrollView style={styles.msgArea}>
            {messages.map((m, idx) => (
              <View
                key={idx}
                style={[
                  styles.msgBubble,
                  m.from === "user" ? styles.userMsg : styles.aiMsg,
                ]}
              >
                <Text style={styles.msgText}>{m.text}</Text>
              </View>
            ))}

            {loading && (
              <Text style={styles.loadingText}>Thinking...</Text>
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Ask about HTML..."
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={sendQuestion}
            />

            <TouchableOpacity onPress={sendQuestion} style={styles.sendBtn}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: "absolute",
    bottom: 26,
    right: 26,
    backgroundColor: "#F5B700",
    width: 60,
    height: 60,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  floatingBtnText: { fontSize: 30, color: "white" },
  chatBox: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 300,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
    overflow: "hidden",
    elevation: 10,
  },
  chatHeader: {
    backgroundColor: "#F5B700",
    padding: 10,
  },
  chatHeaderText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  msgArea: { maxHeight: 250, padding: 10 },
  msgBubble: {
    padding: 8,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "75%",
  },
  userMsg: {
    backgroundColor: "#FFF9C4",
    alignSelf: "flex-end",
  },
  aiMsg: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
  },
  msgText: {
    color: "#4E342E",
    fontSize: 14,
  },
  loadingText: {
    textAlign: "center",
    color: "#999",
    marginVertical: 4,
  },
  inputRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#FDE68A",
  },
  input: {
    flex: 1,
    padding: 10,
  },
  sendBtn: {
    backgroundColor: "#F5B700",
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  sendBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});
