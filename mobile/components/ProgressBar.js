import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProgressBar({ percent = 0, sections = [], activeId }) {
  return (
    <View style={{ marginBottom: 20 }}>
      {/* شريط التقدم */}
      <View style={styles.progressOuter}>
        <View style={[styles.progressInner, { width: `${percent}%` }]} />
      </View>

      {/* النقاط */}
      <View style={styles.sectionRow}>
        {sections.map((s) => (
          <View key={s.id} style={styles.sectionItem}>
            <View
              style={[
                styles.dot,
                { backgroundColor: activeId === s.id ? "#facc15" : "#fde68a" },
              ]}
            />
            <Text style={activeId === s.id ? styles.activeLabel : styles.label}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressOuter: {
    width: "100%",
    height: 8,
    backgroundColor: "#fef9c3",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressInner: {
    height: 8,
    backgroundColor: "#facc15",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sectionItem: {
    alignItems: "center",
    width: "25%",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginBottom: 3,
  },
  label: {
    fontSize: 12,
    color: "#7c6600",
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#7c6600",
  },
});
