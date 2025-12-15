import React from "react";
import { View, Text, StyleSheet } from "react-native";
import RenderHtml from "react-native-render-html";
import { Dimensions } from "react-native";

export default function IntroSectionMobile({ sec }) {
  if (!sec) return null;

  const contentWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{sec.heading}</Text>

      {/* Render Rich HTML */}
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html: sec.html || "" }}
        tagsStyles={{
          p: { color: "#555", lineHeight: 22, marginBottom: 12 },
          strong: { fontWeight: "700" },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffffaa",
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 10,
  },
});
