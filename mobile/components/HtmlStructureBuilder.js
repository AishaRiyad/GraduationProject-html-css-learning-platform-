import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { WebView } from "react-native-webview";

export default function HtmlStructureBuilder() {
  const [code, setCode] = useState("");
  const [flipped, setFlipped] = useState([]);

  const elements = [
    {
      id: "doctype",
      tag: "<!DOCTYPE html>",
      description: "Defines HTML5 document.",
      color: "#D4AC0D",
    },
    { id: "html", tag: "<html>\n</html>", description: "Root element.", color: "#27AE60" },
    { id: "head", tag: "<head>\n<title>Playground</title>\n</head>", description: "Meta/title.", color: "#2980B9" },
    { id: "body", tag: "<body>\n</body>", description: "Page content.", color: "#8E44AD" },
    { id: "h1", tag: "<h1>Hello!</h1>", description: "Main heading.", color: "#E74C3C" },
    { id: "p", tag: "<p>Edit me</p>", description: "Paragraph text.", color: "#7F8C8D" },
  ];

  const handleFlip = (el) => {
    setFlipped((prev) =>
      prev.includes(el.id) ? prev.filter((x) => x !== el.id) : [...prev, el.id]
    );

    if (!flipped.includes(el.id)) {
      setCode((prev) => prev + "\n" + el.tag);
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.header}>🧱 Build HTML Structure</Text>

      <View style={styles.grid}>
        {elements.map((el) => (
          <TouchableOpacity
            key={el.id}
            onPress={() => handleFlip(el)}
            style={[styles.card, { borderColor: el.color }]}
          >
            <Text style={{ color: el.color, fontWeight: "bold" }}>
              {flipped.includes(el.id) ? el.description : el.tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.editorBox}>
        <View style={styles.runRow}>
          <Text style={styles.editorTitle}>Try it Yourself</Text>
        </View>

        <TextInput
          multiline
          style={styles.textarea}
          value={code}
          onChangeText={setCode}
        />

        <View style={{ height: 200, marginTop: 10 }}>
          <WebView
            source={{ html: code }}
            originWhitelist={['*']}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "bold", color: "#CA8A04", marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "48%",
    padding: 10,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: "white",
  },
  editorBox: { marginTop: 15, backgroundColor: "white", padding: 15, borderRadius: 12 },
  runRow: { flexDirection: "row", justifyContent: "space-between" },
  editorTitle: { fontSize: 18, fontWeight: "bold" },
  textarea: {
    height: 150,
    borderWidth: 1,
    borderColor: "#facc15",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    fontFamily: "monospace",
  },
});
