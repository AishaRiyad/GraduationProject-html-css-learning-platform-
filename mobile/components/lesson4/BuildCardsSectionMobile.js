import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";

export default function BuildCardsSectionMobile({ sec }) {
  const [editorCode, setEditorCode] = useState(sec.editorScaffold || "");
  const [selectedExplain, setSelectedExplain] = useState("");

  if (!sec) return null;

  // 🔧 نفس نظام الويب: إدراج القطع مكانها
  const insertSnippet = (snippet) => {
    setEditorCode((prev) => {
      // إذا الجدول فاضي:
      if (prev.trim() === "" || !prev.includes("<table")) {
        return snippet + "\n";
      }
      return prev + "\n" + snippet;
    });
  };

  return (
    <View style={styles.wrapper}>
      {/* TITLE */}
      <Text style={styles.title}>{sec.heading}</Text>
      <Text style={styles.instructions}>{sec.instructions}</Text>

      {/* CARDS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {sec.cards?.map((card, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => {
              insertSnippet(card.snippet);
              setSelectedExplain(card.explain);
            }}
          >
            <Text style={styles.cardLabel}>{card.label}</Text>
            <Text style={styles.cardExplain}>{card.explain}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* EXPLANATION */}
      {selectedExplain !== "" && (
        <View style={styles.explainBox}>
          <Text style={styles.explainText}>{selectedExplain}</Text>
        </View>
      )}

      {/* CODE EDITOR */}
      <Text style={styles.editorLabel}>Your Code:</Text>

      <TextInput
        multiline
        value={editorCode}
        onChangeText={setEditorCode}
        style={styles.editor}
      />

      {/* PREVIEW */}
      <Text style={styles.previewTitle}>Live Preview:</Text>

      <View style={styles.previewBox}>
        <WebView
          originWhitelist={["*"]}
          source={{
            html: `
            <style>
              table { border-collapse: collapse; width: 100%; margin-top: 10px; background: #fff; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
              th { background: #f7f2b9; color: #064F54; font-weight: bold; }
              tbody tr:nth-child(odd) { background: #fafafa; }
              tbody tr:hover { background: #f1f7ff; }
              caption { font-weight: bold; margin-bottom: 6px; }
            </style>
            ${editorCode}
          `,
          }}
          style={{ height: 250 }}
        />
      </View>

   
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#fffef5",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 25,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 10,
  },

  instructions: {
    fontSize: 15,
    color: "#666",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#FAFAE6",
    borderWidth: 1,
    borderColor: "#D6D3A0",
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    width: 180,
  },

  cardLabel: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 14,
    color: "#064F54",
    marginBottom: 4,
  },

  cardExplain: {
    fontSize: 12,
    color: "#666",
  },

  explainBox: {
    backgroundColor: "#FFF7D1",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F4C430",
    marginTop: 12,
    marginBottom: 15,
  },

  explainText: {
    fontSize: 14,
    color: "#555",
  },

  editorLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#064F54",
  },

  editor: {
    backgroundColor: "#FFFBEA",
    borderWidth: 1,
    borderColor: "#E6B800",
    padding: 10,
    borderRadius: 12,
    minHeight: 150,
    fontFamily: "monospace",
    marginBottom: 20,
  },

  previewTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
    color: "#064F54",
  },

  previewBox: {
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 25,
  },

  exampleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 8,
  },

  exampleBox: {
    borderWidth: 1,
    borderColor: "#E4D78C",
    borderRadius: 12,
    overflow: "hidden",
  },
});
