// File: components/MediaRendererMobile.js
import React, { useState } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { Video } from "expo-av";

export default function MediaRendererMobile({ src, type = "image" }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Media not available</Text>
      </View>
    );
  }

  if (type === "video") {
    return (
      <Video
        source={{ uri: src }}
        style={styles.video}
        resizeMode="cover"
        useNativeControls
        onError={() => setError(true)}
      />
    );
  }

  return (
    <View style={styles.imageBox}>
      <Image
        source={{ uri: src }}
        resizeMode="cover"
        style={styles.image}
        onError={() => setError(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    marginTop: 12,
    padding: 2,
    borderRadius: 14,
    backgroundColor: "#F3DFA680",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  fallback: {
    height: 180,
    borderRadius: 14,
    backgroundColor: "#FFF7D4",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: "#AD8A3A",
  },
  video: {
    width: "100%",
    height: 220,
    borderRadius: 14,
  },
});
