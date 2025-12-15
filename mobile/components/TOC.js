import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function TOC({ sections, activeId, scrollRefs, scrollViewRef }) {
  const scrollToSection = (id) => {
    const ref = scrollRefs[id];
    ref?.current?.measureLayout(
      scrollViewRef.current,
      (x, y) => {
        scrollViewRef.current.scrollTo({ y, animated: true });
      },
      () => {}
    );
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>📚 Contents</Text>

      {sections.map((s) => {
        const active = s.id === activeId;

        return (
          <TouchableOpacity
            key={s.id}
            onPress={() => scrollToSection(s.id)}
            style={[styles.item, active && styles.activeItem]}
          >
            <Text style={[styles.itemText, active && styles.activeText]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#b45309",
    marginBottom: 12,
  },
  item: {
    paddingVertical: 8,
  },
  itemText: {
    fontSize: 16,
    color: "#444",
  },
  activeItem: {
    backgroundColor: "#fef3c7",
    borderRadius: 10,
  },
  activeText: {
    color: "#ca8a04",
    fontWeight: "bold",
  },
});
