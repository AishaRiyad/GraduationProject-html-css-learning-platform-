import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";

export default function AIGeneratorSectionMobile({ sec }) {
  const [desc, setDesc] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!sec) return null;

  const handleGenerate = async () => {
    if (!desc.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://10.0.2.2:5000/api/ai-local/table-generator", {
        description: desc,
      });

      setCode(res.data.code || "");
    } catch (err) {
      console.log("AI Table Error:", err);
      alert("Failed to generate table.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{sec.heading}</Text>

      <Text style={styles.desc}>
        Type your table description, and the AI will generate an HTML+CSS table.
      </Text>

      {/* INPUT */}
      <TextInput
        placeholder={sec.ui?.placeholder}
        value={desc}
        onChangeText={setDesc}
        multiline
        style={styles.textarea}
      />

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Generating..." : sec.ui?.buttonText || "Generate Code"}
        </Text>
      </TouchableOpacity>

      {/* LOADING */}
      {loading && (
        <ActivityIndicator size="large" color="#F4C430" style={{ marginTop: 10 }} />
      )}

      {/* GENERATED RESULT */}
      {code !== "" ? (
        <>
          <Text style={styles.subTitle}>AI Generated Code:</Text>

          {/* CODE BLOCK */}
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{code}</Text>
          </View>

          <Text style={styles.subTitle}>Preview:</Text>

          {/* PREVIEW */}
          <View style={styles.previewBox}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: code }}
              style={{ height: 300 }}
            />
          </View>
        </>
      ) : (
        <Text style={styles.hint}>
          🧠 Enter a description and press <Text style={{ fontWeight: "700" }}>Generate</Text>.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 30,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 8,
  },

  desc: {
    color: "#666",
    fontSize: 14,
    marginBottom: 14,
  },

  textarea: {
    backgroundColor: "#FFFBEA",
    borderWidth: 1,
    borderColor: "#E6B800",
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: 12,
    fontSize: 14,
  },

  button: {
    backgroundColor: "#F4C430",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#064F54",
    fontWeight: "700",
    fontSize: 16,
  },

  subTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#064F54",
    marginTop: 18,
    marginBottom: 8,
  },

  codeBox: {
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },

  codeText: {
    color: "#dcdcdc",
    fontFamily: "monospace",
    fontSize: 12,
  },

  previewBox: {
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 12,
    overflow: "hidden",
  },

  hint: {
    marginTop: 12,
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
  },
});
