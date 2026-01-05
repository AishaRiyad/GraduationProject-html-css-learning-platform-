// admin-front/src/AdminLayoutMobile.js
import React from "react";
import { View, StyleSheet } from "react-native";
import AdminHeaderMobile from "./AdminHeaderMobile";

export default function AdminLayoutMobile({ navigation, children }) {
  return (
    <View style={styles.root}>
      <AdminHeaderMobile navigation={navigation} />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fdf2f8" },
  body: { flex: 1, backgroundColor: "#fefce8" },
});
