// File: components/RenderStringWithFencesMobile.js
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import CodePlaygroundMobile from "./CodePlaygroundMobile";

export default function RenderStringWithFencesMobile({
  text,
  secTitle,
  indexKey,
}) {
  const fenceRe = /```(\w+)?\n([\s\S]*?)```/m;
  const match = text.match(fenceRe);

  // لا يحتوي على كود → نص فقط
  if (!match) {
    return (
      <Text
        key={`p-${indexKey}`}
        style={styles.paragraph}
      >
        {text}
      </Text>
    );
  }

  const language = (match[1] || "html").toLowerCase();
  const codeContent = match[2] || "";

  const before = text.slice(0, match.index).trim();
  const after = text.slice(match.index + match[0].length).trim();

  return (
    <View key={`f-${indexKey}`} style={{ marginVertical: 12 }}>
      {/* النص قبل الكود */}
      {before.length > 0 && (
        <Text style={styles.paragraph}>{before}</Text>
      )}

      {/* منطقة الكود */}
      <CodePlaygroundMobile
        lang={language}
        rawCode={codeContent}
        secTitle={secTitle}
        indexKey={indexKey}
      />

      {/* النص بعد الكود */}
      {after.length > 0 && (
        <Text style={styles.afterText}>{after}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
    color: "#4A3F35",
  },
  afterText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#6B5B4E",
  },
});
