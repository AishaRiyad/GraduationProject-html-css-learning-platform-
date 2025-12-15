import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

/**
 * 📱 MediaQueryDemoMobile
 * نفس الويب: سلايدر + صندوق يتغير لونه حسب العرض
 */

export default function MediaQueryDemoMobile() {
  const [width, setWidth] = useState(300);

  const bgColor = width <= 600 ? "#ADD8E6" : "#FFF";

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>💻 Example Code:</Text>

      <View style={styles.codeBox}>
        <Text style={styles.codeText}>
{`@media (max-width: 600px) {
  body {
    background-color: lightblue;
  }
}`}
        </Text>
      </View>

      <Text style={styles.subTitle}>
        🌈 Try resizing the box using the slider!
      </Text>

      <View style={styles.sliderRow}>
        <Text style={styles.label}>
          Width: <Text style={styles.value}>{width}px</Text>
        </Text>

        <Slider
          style={{ width: "85%" }}
          minimumValue={300}
          maximumValue={900}
          value={width}
          onValueChange={(v) => setWidth(v)}
          minimumTrackTintColor="#F5B700"
        />
      </View>

      <View
        style={[
          styles.demoBox,
          { width, backgroundColor: bgColor },
        ]}
      >
        <Text style={styles.boxText}>
          {width <= 600
            ? "Light Blue (Small Screen)"
            : "Normal (Desktop View)"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    backgroundColor: "#FFFDF0",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4E342E",
    textAlign: "center",
    marginBottom: 10,
  },
  codeBox: {
    backgroundColor: "#E3F2FD",
    padding: 10,
    borderRadius: 10,
    borderColor: "#BBDEFB",
    borderWidth: 1,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#1A237E",
  },
  subTitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#4E342E",
    marginBottom: 14,
  },
  sliderRow: {
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: "#555",
  },
  value: {
    color: "#F5B700",
    fontWeight: "700",
  },
  demoBox: {
    height: 160,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  boxText: {
    color: "#4E342E",
    fontWeight: "700",
  },
});
