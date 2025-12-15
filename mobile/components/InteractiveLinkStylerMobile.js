import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function InteractiveLinkStylerMobile() {
  const [linkColor, setLinkColor] = useState("#0000ff");
  const [hoverColor, setHoverColor] = useState("#ff0000");
  const [underline, setUnderline] = useState(true);

  const codeExample = `
a {
  color: ${linkColor};
  text-decoration: ${underline ? "underline" : "none"};
}

a:hover {
  color: ${hoverColor};
  text-decoration: ${underline ? "underline" : "none"};
}`;

  // لتغيير لون الرابط مباشرة أثناء الضغط
  const [previewColor, setPreviewColor] = useState(linkColor);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎨 Styling Links with CSS</Text>

      <Text style={styles.description}>
        You can change the color, remove the underline, and add hover effects
        to links using CSS.
      </Text>

      {/* Example */}
      <Text style={styles.subtitle}>Example:</Text>

      <ScrollView horizontal style={styles.codeBox}>
        <Text style={styles.codeText}>{codeExample}</Text>
      </ScrollView>

      {/* Controls */}
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Link Color:</Text>
        <TextInput
          style={styles.input}
          value={linkColor}
          onChangeText={(val) => {
            setLinkColor(val);
            setPreviewColor(val);
          }}
        />
      </View>

      <View style={styles.controlGroup}>
        <Text style={styles.label}>Hover Color:</Text>
        <TextInput
          style={styles.input}
          value={hoverColor}
          onChangeText={setHoverColor}
        />
      </View>

      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => setUnderline(!underline)}
      >
        <View style={[styles.checkBoxSquare, underline && styles.checkedBox]} />
        <Text style={styles.checkboxLabel}>Underline</Text>
      </TouchableOpacity>

      {/* Preview */}
      <View style={styles.previewBox}>
        <TouchableOpacity
          onPressIn={() => setPreviewColor(hoverColor)}
          onPressOut={() => setPreviewColor(linkColor)}
        >
          <Text
            style={{
              color: previewColor,
              textDecorationLine: underline ? "underline" : "none",
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            Hover over me!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFBEA",
    padding: 15,
    borderRadius: 20,
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

  description: {
    color: "#555",
    marginBottom: 10,
    lineHeight: 20,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#967a0e",
    marginTop: 10,
    marginBottom: 6,
  },

  codeBox: {
    backgroundColor: "#FFFDF5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1E8B1",
    padding: 10,
    marginBottom: 15,
  },

  codeText: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#1F2937",
  },

  controlGroup: {
    marginBottom: 12,
  },

  label: {
    color: "#333",
    marginBottom: 5,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#F4D06F",
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },

  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  checkBoxSquare: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#064F54",
    marginRight: 8,
    borderRadius: 4,
  },

  checkedBox: {
    backgroundColor: "#064F54",
  },

  checkboxLabel: {
    fontSize: 15,
    color: "#333",
  },

  previewBox: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F4D06F",
    alignItems: "center",
  },
});
