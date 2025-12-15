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
import * as ImagePicker from "expo-image-picker";
import { WebView } from "react-native-webview";

export default function AICodeGeneratorMobile() {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // رفع صورة + تحويل Base64
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const img = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.9,
    });

    if (!img.canceled) {
      setFileBase64(`data:image/jpeg;base64,${img.assets[0].base64}`);
      setImageUrl("");
    }
  };

  // اتصال API
  const handleGenerate = async () => {
    setLoading(true);
    setResult("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai-local/html-generator",
        {
          link: linkUrl,
          imageUrl,
          imageBase64: fileBase64 || null,
        }
      );

      setResult(res.data.code || "No result received");
    } catch (err) {
      console.log(err);
      setResult("<p style='color:red;'>Error generating HTML code.</p>");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>✨ AI HTML Generator</Text>

      {/* Inputs */}
      <View style={styles.inputsBox}>
        <TextInput
          style={styles.input}
          placeholder="Website link (optional)"
          value={linkUrl}
          onChangeText={setLinkUrl}
        />

        <TextInput
          style={styles.input}
          placeholder="Image URL (optional)"
          value={imageUrl}
          onChangeText={(text) => {
            setImageUrl(text);
            setFileBase64("");
          }}
        />
      </View>

      {/* Upload button */}
      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text style={styles.uploadText}>📁 Upload Image</Text>
      </TouchableOpacity>

      {/* Generate Button */}
      <TouchableOpacity
        style={[
          styles.generateBtn,
          !(linkUrl || imageUrl || fileBase64) && { backgroundColor: "#BBB" },
        ]}
        disabled={loading || (!linkUrl && !imageUrl && !fileBase64)}
        onPress={handleGenerate}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.generateText}>Generate HTML with AI</Text>
        )}
      </TouchableOpacity>

      {/* Result */}
      {result !== "" && (
        <View style={styles.outputBox}>
          <Text style={styles.outputTitle}>🧠 Generated Code</Text>

          <ScrollView horizontal style={styles.codeBox}>
            <Text style={styles.codeText}>{result}</Text>
          </ScrollView>

          <Text style={styles.previewTitle}>🔍 Live Preview</Text>
          <View style={styles.webviewBox}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: result }}
              style={{ height: 180 }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFBEA",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F4D06F",
    padding: 15,
    marginTop: 20,
  },

  mainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 10,
  },

  inputsBox: {
    gap: 10,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F1E8B1",
    padding: 10,
    borderRadius: 10,
  },

  uploadBtn: {
    backgroundColor: "#F4C430",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  uploadText: {
    textAlign: "center",
    color: "#064F54",
    fontWeight: "700",
  },

  generateBtn: {
    backgroundColor: "#065F46",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  generateText: {
    color: "#FFF",
    fontWeight: "700",
    textAlign: "center",
  },

  outputBox: {
    marginTop: 10,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1E8B1",
  },

  outputTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 8,
  },

  codeBox: {
    backgroundColor: "#FFFDF5",
    borderWidth: 1,
    borderColor: "#E6B800",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  codeText: {
    fontFamily: "monospace",
    color: "#333",
    fontSize: 13,
  },

  previewTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#967a0e",
  },

  webviewBox: {
    borderWidth: 1,
    borderColor: "#E6B800",
    borderRadius: 10,
    overflow: "hidden",
  },
});
