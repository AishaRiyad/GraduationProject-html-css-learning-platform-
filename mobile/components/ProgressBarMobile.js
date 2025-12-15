// File: components/ProgressBarMobile.js
import React from "react";
import { View, StyleSheet } from "react-native";

export default function ProgressBarMobile({ progress }) {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${progress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    width: "100%",
    backgroundColor: "#EADFAB",
  },
  bar: {
    height: "100%",
    backgroundColor: "#F5B700",
  },
});
