import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function AIHelpBoxMobile() {
  const [q, setQ] = useState("");
  const [reply, setReply] = useState("");

  const askAI = async () => {
    if (!q.trim()) return;

    setReply("Loading...");

    try {
      const res = await fetch("http://10.0.2.2:5000/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          html: "",
          history: [],
        }),
      });

      const data = await res.json();
      setReply(data?.messages?.[0]?.text || "No reply");
    } catch {
      setReply("Error connecting to server.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.chatBox}>
        {reply ? (
          <View style={styles.aiMsg}>
            <Text>{reply}</Text>
          </View>
        ) : (
          <Text style={{ color: "#777", marginTop: 20 }}>
            Ask AI anything about your HTML/CSS code.
          </Text>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask something..."
          value={q}
          onChangeText={setQ}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={askAI}>
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatBox: { flex: 1, padding: 10 },
  aiMsg: {
    backgroundColor: "#fff4c0",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sendBtn: {
    backgroundColor: "#f4b400",
    borderRadius: 10,
    marginLeft: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
});
