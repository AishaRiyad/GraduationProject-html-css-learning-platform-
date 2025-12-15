// File: components/TableRendererMobile.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function TableRendererMobile({ table }) {
  if (!table) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {/* ---- Header ---- */}
        <View style={styles.rowHeader}>
          {table.headers.map((h, i) => (
            <View key={i} style={styles.cellHeader}>
              <Text style={styles.headerText}>{h}</Text>
            </View>
          ))}
        </View>

        {/* ---- Rows ---- */}
        {table.rows.map((row, rIndex) => (
          <View
            key={rIndex}
            style={[
              styles.row,
              { backgroundColor: rIndex % 2 === 0 ? "#FFFDF5" : "#FFF7D8" },
            ]}
          >
            {row.map((col, cIndex) => (
              <View key={cIndex} style={styles.cell}>
                <Text style={styles.cellText}>{col}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: "#E7CF88",
    borderRadius: 12,
    overflow: "hidden",
  },
  rowHeader: {
    flexDirection: "row",
    backgroundColor: "#FFEFB7",
  },
  cellHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: "#E8D48A",
  },
  headerText: {
    fontWeight: "bold",
    color: "#6A4E1F",
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderColor: "#E8D48A",
  },
  cellText: {
    color: "#6A5C3B",
  },
});
