import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

/**
 * 🎨 LiveCodeBoxMobile Component
 * يعرض كود HTML ويعرض نتيجته بشكل مباشر في WebView.
 */
export default function LiveCodeBoxMobile({
  initialCode,
  readOnly = false,
  hideResult = false,
}) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(initialCode);

  useEffect(() => {
    setOutput(code);
  }, [code]);

  const htmlWrapper = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style> body { padding: 10px; font-family: sans-serif; } </style>
      </head>
      <body>${output}</body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💡 Try it yourself!</Text>

      {/* محرر الكود */}
      <TextInput
        value={code}
        onChangeText={(t) => !readOnly && setCode(t)}
        editable={!readOnly}
        multiline
        style={[styles.textArea, readOnly && styles.disabled]}
      />

      {/* الناتج */}
      {!hideResult && (
        <View style={styles.previewBox}>
          <Text style={styles.previewTitle}>Result:</Text>

          <WebView
            style={styles.webview}
            originWhitelist={["*"]}
            source={{ html: htmlWrapper }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    backgroundColor: "#ffffffcc",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE9A8",
  },
  title: {
    color: "#5D4037",
    fontWeight: "700",
    marginBottom: 8,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderColor: "#F5D46F",
    backgroundColor: "#FFFDF5",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    fontFamily: "monospace",
    textAlignVertical: "top",
  },
  disabled: {
    opacity: 0.8,
    backgroundColor: "#f2f2f2",
  },
  previewBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FFEBB5",
    borderRadius: 10,
    padding: 6,
    backgroundColor: "#FFFFFF",
  },
  previewTitle: {
    color: "#777",
    fontSize: 12,
    marginBottom: 6,
  },
  webview: {
    height: 180,
    borderRadius: 6,
    overflow: "hidden",
  },
});
