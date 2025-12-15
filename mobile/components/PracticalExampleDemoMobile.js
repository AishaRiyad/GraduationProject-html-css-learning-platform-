import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

/**
 * 🧱 PracticalExampleDemoMobile
 * نسخة موبايل من PracticalExampleDemo في الويب
 * - نفس النص
 * - نفس الكود
 * - نفس حركة السلايدر وتغيّر اتجاه البوكسات
 */

export default function PracticalExampleDemoMobile({ description }) {
  const [width, setWidth] = useState(300);

  const code = `
<style>
  .container { display: flex; }
  .box { flex: 1; padding: 20px; background: #eee; margin: 5px; }

  @media (max-width: 600px) {
    .container { flex-direction: column; }
  }
</style>

<div class="container">
  <div class="box">Box 1</div>
  <div class="box">Box 2</div>
</div>`.trim();

  const isStacked = width <= 600;

  return (
    <View style={styles.wrapper}>
      {/* العنوان */}
      <Text style={styles.title}>
        🧱 Practical Example: Two Columns to One
      </Text>

      {/* الوصف القادم من JSON */}
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      {/* الكود */}
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{code}</Text>
      </View>

      {/* تعليمات التجربة */}
      <Text style={styles.hint}>
        👇 Try it yourself: Drag the slider to resize and watch the layout
        change!
      </Text>

      {/* السلايدر + قيمة العرض */}
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>
          📏 Width:{" "}
          <Text style={styles.sliderValue}>{Math.round(width)}px</Text>
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={300}
          maximumValue={900}
          value={width}
          onValueChange={setWidth}
          step={10}
          minimumTrackTintColor="#F5B700"
          maximumTrackTintColor="#FFE082"
          thumbTintColor="#F5B700"
        />
      </View>

      {/* النتيجة التفاعلية */}
      <View
        style={[
          styles.demoContainer,
          { width },
          isStacked && { flexDirection: "column" },
        ]}
      >
        <View style={[styles.box, styles.box1]}>
          <Text style={styles.boxText}>Box 1</Text>
        </View>
        <View style={[styles.box, styles.box2]}>
          <Text style={styles.boxText}>Box 2</Text>
        </View>
      </View>

      {/* التوضيح الختامي */}
      <Text style={styles.footer}>
        💡 When the width goes below 600px, the boxes stack vertically —
        demonstrating how <Text style={styles.codeInline}>@media</Text> queries
        create responsive layouts.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    backgroundColor: "#FFFDF5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFECB3",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4E342E",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#4E342E",
    textAlign: "center",
    marginBottom: 14,
  },
  codeBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBDEFB",
    padding: 10,
    marginBottom: 14,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#1A237E",
  },
  hint: {
    fontSize: 14,
    color: "#4E342E",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500",
  },
  sliderRow: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  sliderValue: {
    color: "#F5B700",
    fontWeight: "700",
  },
  slider: {
    width: "90%",
  },
  demoContainer: {
    alignSelf: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FFECB3",
    backgroundColor: "#FFFFFF",
    padding: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  box: {
    flex: 1,
    paddingVertical: 18,
    margin: 4,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  box1: {
    backgroundColor: "#FFE082",
  },
  box2: {
    backgroundColor: "#FFB74D",
  },
  boxText: {
    color: "#4E342E",
    fontWeight: "700",
    fontSize: 16,
  },
  footer: {
    marginTop: 12,
    fontSize: 13,
    color: "#555",
    fontStyle: "italic",
    textAlign: "center",
  },
  codeInline: {
    fontFamily: "monospace",
    fontWeight: "700",
  },
});
