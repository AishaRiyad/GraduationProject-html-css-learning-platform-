// mobile/components/BoxVisualizerMobile.js
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BoxVisualizerMobile() {
  const [hovered, setHovered] = useState(null);

  const sections = [
    { id: "header", label: "<header>" },
    { id: "main", label: "<main>" },
    { id: "aside", label: "<aside>" },
    { id: "footer", label: "<footer>" },
  ];

  const descriptions = {
    header: "Top section – usually contains logo or navigation links.",
    main: "Central area – holds the main content of the page.",
    aside: "Side section – often used for ads or related information.",
    footer: "Bottom section – typically shows contact info or credits.",
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[styles.box, styles.header]}
        onTouchStart={() => setHovered("header")}
        onTouchEnd={() => setHovered(null)}
      >
        <Text style={styles.label}>{sections[0].label}</Text>
      </View>

      {/* Main + Aside */}
      <View style={styles.row}>
        <View
          style={[styles.box, styles.main]}
          onTouchStart={() => setHovered("main")}
          onTouchEnd={() => setHovered(null)}
        >
          <Text style={styles.label}>{sections[1].label}</Text>
        </View>

        <View
          style={[styles.box, styles.aside]}
          onTouchStart={() => setHovered("aside")}
          onTouchEnd={() => setHovered(null)}
        >
          <Text style={styles.label}>{sections[2].label}</Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={[styles.box, styles.footer]}
        onTouchStart={() => setHovered("footer")}
        onTouchEnd={() => setHovered(null)}
      >
        <Text style={styles.label}>{sections[3].label}</Text>
      </View>

      {hovered && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{descriptions[hovered]}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 16,
  },
  box: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    marginVertical: 6,
    backgroundColor: "#fef3c7", // أصفر فاتح
    borderWidth: 1,
    borderColor: "#facc15",
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#78350f",
  },
  header: {
    width: "100%",
  },
  footer: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  main: {
    flex: 3,
  },
  aside: {
    flex: 1,
  },
  tooltip: {
    marginTop: 10,
    backgroundColor: "#fffbeb",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#facc15",
    alignSelf: "center",
  },
  tooltipText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },
});
