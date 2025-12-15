import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function InteractiveImageResizerMobile() {
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(150);

  const reset = () => {
    setWidth(200);
    setHeight(150);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📐 Image Resizer</Text>

      {/* Controls */}
      <View style={styles.controlsRow}>
        {/* Width */}
        <View style={styles.controlItem}>
          <Text style={styles.label}>Width:</Text>
          <TextInput
            keyboardType="numeric"
            value={String(width)}
            onChangeText={(v) => setWidth(Number(v))}
            style={styles.input}
          />
          <Text style={styles.unit}>px</Text>
        </View>

        {/* Height */}
        <View style={styles.controlItem}>
          <Text style={styles.label}>Height:</Text>
          <TextInput
            keyboardType="numeric"
            value={String(height)}
            onChangeText={(v) => setHeight(Number(v))}
            style={styles.input}
          />
          <Text style={styles.unit}>px</Text>
        </View>

        {/* Reset */}
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      <View style={styles.previewBox}>
        <View
          style={[
            styles.imageWrapper,
            { width: width, height: height },
          ]}
        >
          <Image
            source={{
              uri: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg",
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.code}>
          {`<img src='cat.png' width='${width}' height='${height}'>`}
        </Text>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFDF2",
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
    marginBottom: 15,
  },

  controlsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },

  controlItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  label: {
    fontWeight: "600",
    color: "#555",
  },

  input: {
    width: 60,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F4D06F",
    borderRadius: 8,
    textAlign: "center",
  },

  unit: {
    color: "#777",
    fontSize: 12,
  },

  resetBtn: {
    marginLeft: "auto",
    backgroundColor: "#F4C430",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
  },

  resetText: {
    fontWeight: "700",
    color: "#064F54",
  },

  previewBox: {
    alignItems: "center",
  },

  imageWrapper: {
    borderWidth: 2,
    borderColor: "#FACC15",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  code: {
    marginTop: 10,
    color: "#555",
    fontSize: 14,
  },
});
