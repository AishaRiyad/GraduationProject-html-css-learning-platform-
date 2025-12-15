// File: pages/FilePreviewScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

const API = "http://10.0.2.2:5000";

export default function FilePreviewScreen({ route, navigation }) {
  const { url, name } = route.params || {};
  const fullUrl = url?.startsWith("http") ? url : `${API}${url || ""}`;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name || "File Preview"}
        </Text>
      </View>

      <WebView
        source={{ uri: fullUrl }}
        style={{ flex: 1 }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{ marginTop: 8, color: "#1f2937" }}>Loading file…</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
  },
  backText: {
    color: "#111827",
    fontWeight: "600",
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
