import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
} from "react-native";

/**
 * 🟣 FlexPlaygroundMobile
 * نسخة موبايل من الـ Interactive Flex Playground الموجود بالويب
 * — Drag & Drop
 * — تغيير الاتجاه
 * — عرض الكود (Read Only)
 */

export default function FlexPlaygroundMobile() {
  const [direction, setDirection] = useState("row");

  const initialBoxes = [
    { id: 1, label: "Box 1", color: "#FFB74D" },
    { id: 2, label: "Box 2", color: "#4DB6AC" },
    { id: 3, label: "Box 3", color: "#9575CD" },
  ];

  const [boxes, setBoxes] = useState(initialBoxes);

  const positions = useRef(
    boxes.map(() => new Animated.ValueXY())
  ).current;

  /** 🔄 إعادة ضبط */
  const resetBoxes = () => {
    setBoxes(initialBoxes);
    positions.forEach((p) => p.setValue({ x: 0, y: 0 }));
  };

  /** 🔀 عند السحب */
  const createPanResponder = (index) =>
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        positions[index].setValue({
          x: direction === "row" ? gesture.dx : 0,
          y: direction === "column" ? gesture.dy : 0,
        });
      },
      onPanResponderRelease: (_, gesture) => {
        const moved = boxes[index];
        let newIndex = index;

        if (direction === "row") {
          if (gesture.dx > 60 && index < boxes.length - 1) newIndex = index + 1;
          if (gesture.dx < -60 && index > 0) newIndex = index - 1;
        } else {
          if (gesture.dy > 60 && index < boxes.length - 1) newIndex = index + 1;
          if (gesture.dy < -60 && index > 0) newIndex = index - 1;
        }

        if (newIndex !== index) {
          const updated = [...boxes];
          updated.splice(index, 1);
          updated.splice(newIndex, 0, moved);
          setBoxes(updated);
        }

        Animated.spring(positions[index], {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    });

  const code = `
<style>
  .container {
    display: flex;
    flex-direction: ${direction};
    gap: 10px;
  }
  .box {
    flex: 1;
    padding: 20px;
    color: white;
    text-align: center;
  }
</style>

<div class="container">
${boxes
  .map(
    (b) =>
      `  <div class="box" style="background-color:${b.color};">${b.label}</div>`
  )
  .join("\n")}
</div>
`.trim();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>🧱 Interactive Flex Layout Playground</Text>

      {/* 🔧 محرر الكود */}
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{code}</Text>
      </View>

      {/* أزرار تغيير الاتجاه */}
      <View style={styles.directionButtons}>
        <TouchableOpacity
          onPress={() => setDirection("row")}
          style={[
            styles.dirBtn,
            direction === "row" && styles.dirBtnActiveRow,
          ]}
        >
          <Text
            style={[
              styles.dirBtnText,
              direction === "row" && styles.dirBtnTextActive,
            ]}
          >
            ↔️ Horizontal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDirection("column")}
          style={[
            styles.dirBtn,
            direction === "column" && styles.dirBtnActiveColumn,
          ]}
        >
          <Text
            style={[
              styles.dirBtnText,
              direction === "column" && styles.dirBtnTextActive,
            ]}
          >
            ↕️ Vertical
          </Text>
        </TouchableOpacity>
      </View>

      {/* الصناديق التفاعلية */}
      <View
        style={[
          styles.boxContainer,
          direction === "column" && styles.columnDirection,
        ]}
      >
        {boxes.map((box, i) => {
          const pan = positions[i];
          return (
            <Animated.View
              key={box.id}
              {...createPanResponder(i).panHandlers}
              style={[
                styles.box,
                { backgroundColor: box.color },
                { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
              ]}
            >
              <Text style={styles.boxLabel}>{box.label}</Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Reset */}
      <View style={styles.resetWrapper}>
        <TouchableOpacity onPress={resetBoxes} style={styles.resetBtn}>
          <Text style={styles.resetText}>🔁 Reset Example</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    backgroundColor: "#ffffffdd",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFEB9D",
    padding: 14,
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    color: "#5D4037",
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: "#FFFDF5",
    borderWidth: 1,
    borderColor: "#F5D46F",
    borderRadius: 10,
    padding: 10,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#444",
  },
  directionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
  },
  dirBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#e6e6e6",
  },
  dirBtnActiveRow: {
    backgroundColor: "#FFD54F",
  },
  dirBtnActiveColumn: {
    backgroundColor: "#FFD54F",
  },
  dirBtnText: {
    fontWeight: "600",
    color: "#444",
  },
  dirBtnTextActive: {
    color: "#fff",
  },
  boxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 14,
  },
  columnDirection: {
    flexDirection: "column",
  },
  box: {
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  boxLabel: {
    color: "white",
    fontWeight: "700",
  },
  resetWrapper: {
    marginTop: 12,
    alignItems: "center",
  },
  resetBtn: {
    backgroundColor: "#FFD54F",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  resetText: {
    color: "white",
    fontWeight: "700",
  },
});

