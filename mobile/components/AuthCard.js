// components/AuthCard.js
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

export default function AuthCard({
  title,
  altLinkText,
  onAltLinkPress,
  imageSrc,
  children,
}) {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.card}>

        {/* الصورة فوق */}
        <Image source={imageSrc} style={styles.topImage} resizeMode="cover" />

        {/* المحتوى داخل البطاقة */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>

            {altLinkText && (
              <TouchableOpacity onPress={onAltLinkPress}>
                <Text style={styles.altLink}>{altLinkText}</Text>
              </TouchableOpacity>
            )}
          </View>

          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    minHeight: "100%",
    backgroundColor: "#111827", // bg-gray-900
    padding: 20,
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  topImage: {
    width: "100%",
    height: 350, // طول صورة الزهور فوق
  },

  contentContainer: {
    paddingHorizontal: 25,
    paddingBottom: 25,
    paddingTop: 20,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },

  altLink: {
    fontSize: 14,
    color: "#facc15",
    fontWeight: "600",
  },
});
