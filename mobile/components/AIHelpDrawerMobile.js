import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import AIHelpBoxMobile from "./AIHelpBoxMobile";

export default function AIHelpDrawerMobile({ visible, onClose }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.background} onPress={onClose} />

      <View style={styles.drawer}>
        <View style={styles.topBar}>
          <Text style={styles.title}>AI Help</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <AIHelpBoxMobile />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: "flex-end",
  },
  background: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    width: "100%",
    height: "65%",
    backgroundColor: "#fffdf3",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#c98f00" },
  close: { fontSize: 22, color: "#d17800" },
});
