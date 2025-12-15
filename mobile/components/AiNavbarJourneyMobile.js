// File: components/AiNavbarJourneyMobile.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";

export default function AiNavbarJourneyMobile({ API }) {
  const [messages, setMessages] = useState([]);
  const [userChoice, setUserChoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const send = async () => {
    if (!userChoice.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: userChoice }]);
    const input = userChoice;
    setUserChoice("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/ai-local/navbar-journey`, {
        step,
        userChoice: input,
      });

      setMessages((prev) => [
        ...prev,
        { from: "ai", text: (res.data.message || "").trim() },
      ]);

      setStep((s) => s + 1);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ AI connection error. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>🤖 Interactive Navbar Journey</Text>

      {/* رسائل AI */}
      <View style={styles.messagesWrapper}>
        <ScrollView style={styles.messages} showsVerticalScrollIndicator={false}>
          {messages.length === 0 && (
            <Text style={styles.placeholder}>
              Start by typing your first idea…
            </Text>
          )}

          {messages.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.msg,
                msg.from === "user" ? styles.userMsg : styles.aiMsg,
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  msg.from === "user" ? styles.userMsgText : styles.aiMsgText,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          ))}

          {loading && (
            <Text style={styles.loadingText}>AI is thinking…</Text>
          )}
        </ScrollView>
      </View>

      {/* إدخال المستخدم */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Type your answer…"
          value={userChoice}
          onChangeText={setUserChoice}
          style={styles.input}
          placeholderTextColor="#8f8c82"
        />

        <TouchableOpacity
          onPress={send}
          disabled={loading}
          style={[styles.sendBtn, loading && { opacity: 0.6 }]}
        >
          <Text style={styles.sendText}>{loading ? "…" : "Send"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFF7D6",
    borderWidth: 1,
    borderColor: "#E6C970",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5D4037",
    marginBottom: 10,
  },

  messagesWrapper: {
    maxHeight: 220,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D58A",
    backgroundColor: "white",
    padding: 8,
    marginBottom: 15,
  },

  messages: {
    maxHeight: 200,
  },

  placeholder: {
    fontSize: 13,
    color: "#A28D6A",
  },

  msg: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
    maxWidth: "85%",
  },

  userMsg: {
    backgroundColor: "#F5B700",
    alignSelf: "flex-end",
  },

  aiMsg: {
    backgroundColor: "#FFF3CC",
    borderWidth: 1,
    borderColor: "#E8D58A",
    alignSelf: "flex-start",
  },

  msgText: {
    fontSize: 14,
    lineHeight: 19,
  },

  userMsgText: {
    color: "white",
    fontWeight: "600",
  },

  aiMsgText: {
    color: "#5D4037",
  },

  loadingText: {
    color: "#8B6D3A",
    fontStyle: "italic",
    fontSize: 13,
    marginTop: 4,
  },

  inputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6C970",
    fontSize: 14,
    color: "#594737",
  },

  sendBtn: {
    backgroundColor: "#F5B700",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  sendText: {
    color: "white",
    fontWeight: "700",
  },
});
