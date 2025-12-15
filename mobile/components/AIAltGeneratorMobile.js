import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

export default function AIAltGeneratorMobile() {
  const [imageUrl, setImageUrl] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [altText, setAltText] = useState("");
  const [loading, setLoading] = useState(false);

  // فتح المعرض + Base64
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const img = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.9,
    });

    if (!img.canceled) {
      const base64 = `data:image/jpeg;base64,${img.assets[0].base64}`;
      setFileBase64(base64);
      setPreview(base64);
      setImageUrl("");
    }
  };

  // استدعاء API
  const handleGenerate = async () => {
    if (!imageUrl && !fileBase64) return;

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai-local/smart-image",
        {
          imageUrl,
          imageBase64: fileBase64 || null,
        }
      );

      let aiAlt = "Image";

      // إذا السيرفر رجع <img ...>
      if (res.data.result.includes("<img")) {
        const match = res.data.result.match(/alt=['"]([^'"]+)['"]/);
        aiAlt = match ? match[1] : "Image";
      } else {
        aiAlt = res.data.result.trim();
      }

      setAltText(aiAlt);

      // تقصير Base64 على الويب — نحافظ على نفس المنطق
      const finalSrc = imageUrl || fileBase64;
      const shortSrc =
        finalSrc.length > 80 ? finalSrc.substring(0, 80) + "..." : finalSrc;

      const htmlTag = `<img src='${shortSrc}' alt='${aiAlt}'>`;

      setResult(htmlTag);
    } catch (e) {
      console.log(e);
      setResult("Error generating alt text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 AI Alt Text Generator</Text>

      {/* Inputs */}
      <View style={styles.inputs}>
        <TextInput
          style={styles.input}
          placeholder="Paste image URL…"
          value={imageUrl}
          onChangeText={(value) => {
            setImageUrl(value);
            setFileBase64("");
            setPreview(value);
          }}
        />
      </View>

      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text style={styles.uploadText}>📁 Upload Image</Text>
      </TouchableOpacity>

      {/* Generate Button */}
      <TouchableOpacity
        disabled={loading || (!imageUrl && !fileBase64)}
        style={[
          styles.generateBtn,
          (!imageUrl && !fileBase64) && { backgroundColor: "#BBB" },
        ]}
        onPress={handleGenerate}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.generateText}>Generate Alt with AI</Text>
        )}
      </TouchableOpacity>

      {/* Preview Image */}
      {preview !== "" && (
        <View style={styles.previewBox}>
          <Image
            source={{ uri: preview }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Output */}
      {result !== "" && (
        <View style={styles.outputBox}>
          <Text style={styles.outputTitle}>Generated HTML:</Text>

          <ScrollView horizontal style={styles.codeBox}>
            <Text style={styles.codeText}>{result}</Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF9D9",
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F4D06F",
    marginTop: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 10,
  },

  inputs: {
    gap: 10,
  },

  input: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1E8B1",
  },

  uploadBtn: {
    backgroundColor: "#F4C430",
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },

  uploadText: {
    color: "#064F54",
    fontWeight: "700",
    textAlign: "center",
  },

  generateBtn: {
    backgroundColor: "#065F46",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },

  generateText: {
    color: "#FFF",
    fontWeight: "700",
    textAlign: "center",
  },

  previewBox: {
    alignItems: "center",
    marginTop: 15,
  },

  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F4D06F",
  },

  outputBox: {
    marginTop: 20,
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
  },

  codeText: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#333",
  },
});
