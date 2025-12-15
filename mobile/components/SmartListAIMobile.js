// File: src/components/SmartListAIMobile.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import LiveCodeBoxMobile from "./LiveCodeBoxMobile";

const API = "http://10.0.2.2:5000";

export default function SmartListAIMobile({ aiTask }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await axios.post(`${API}/api/ai-local/generate-list`, {
        topic: input,
      });
      setResult(res.data.code || "⚠️ No result");
    } catch (e) {
      console.error("AI list error:", e.message);
      setResult("❌ Error generating list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {aiTask?.instruction ? (
        <Text style={styles.instruction}>{aiTask.instruction}</Text>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          placeholder={aiTask?.placeholder || "Enter a topic..."}
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={generate}
          disabled={loading}
          style={[styles.button, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>
              {aiTask?.buttonLabel || "Generate"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {result !== "" && (
        <ScrollView
          style={styles.resultWrapper}
          contentContainerStyle={{ paddingBottom: 4 }}
        >
          <LiveCodeBoxMobile initialCode={result} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    backgroundColor: "#FFF9E5",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  instruction: {
    fontSize: 14,
    color: "#5D4037",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#FFECB3",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#F5B700",
    borderRadius: 999,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  resultWrapper: {
    marginTop: 8,
  },
});
