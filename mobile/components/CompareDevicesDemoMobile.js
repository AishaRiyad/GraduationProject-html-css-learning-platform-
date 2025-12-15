import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";

/**
 * 🖥️ CompareDevicesDemoMobile
 * نسخة موبايل 1:1 من مكوّن CompareDevicesDemo في الويب
 */

export default function CompareDevicesDemoMobile({ currentIndex }) {
  const [device, setDevice] = useState("laptop");

  // تغيير الجهاز تلقائيًا عند دخول هذا القسم
  useEffect(() => {
    setDevice("mobile");
  }, [currentIndex]);

  const getConfig = () => {
    switch (device) {
      case "mobile":
        return { width: 360, columns: 1, height: 480 };
      case "laptop":
        return { width: 850, columns: 2, height: 420 };
      case "desktop":
        return { width: 1000, columns: 3, height: 440 };
      default:
        return { width: 850, columns: 2, height: 420 };
    }
  };

  const { width, columns, height } = getConfig();

  return (
    <View style={styles.wrapper}>
      {/* العنوان */}
      <Text style={styles.header}>💻 Compare Design on Devices</Text>

      <Text style={styles.description}>
        Choose a device to visualize how the responsive layout adapts.
      </Text>

      {/* أزرار اختيار الجهاز */}
      <View style={styles.deviceButtons}>
        {["mobile", "laptop", "desktop"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setDevice(type)}
            style={[
              styles.deviceButton,
              device === type && styles.deviceButtonActive(type),
            ]}
          >
            <Text style={styles.deviceButtonText}>
              {type === "mobile" && "📱 Mobile"}
              {type === "laptop" && "💻 Laptop"}
              {type === "desktop" && "🖥️ Desktop"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Frame Preview */}
      <View
        style={[
          styles.frame,
          { width, height },
        ]}
      >
        {/* Nav Bar */}
        <View style={styles.navBar}>
          <View style={styles.navCircles}>
            <View style={[styles.circle, { backgroundColor: "#EF5350" }]} />
            <View style={[styles.circle, { backgroundColor: "#FFEE58" }]} />
            <View style={[styles.circle, { backgroundColor: "#66BB6A" }]} />
          </View>

          <Text style={styles.navTitle}>
            {device === "mobile" && "📱 Mobile (360px)"}
            {device === "laptop" && "💻 Laptop (1024px)"}
            {device === "desktop" && "🖥️ Desktop (1440px)"}
          </Text>
        </View>

        {/* Layout */}
        <View
          style={[
            styles.layout,
            {
              flexDirection: device === "mobile" ? "column" : "row",
              height: height - 40,
            },
          ]}
        >
          {/* Sidebar */}
          <View
            style={[
              styles.sidebar,
              device === "mobile" && { width: "100%" },
            ]}
          >
            <Text style={styles.sideItem}>🏠 Home</Text>
            <Text style={styles.sideItem}>📄 Articles</Text>
            <Text style={styles.sideItem}>⚙️ Settings</Text>
          </View>

          {/* Content */}
          <View
            style={[
              styles.content,
              {
                backgroundColor:
                  device === "desktop" ? "#F3F4F6" : "#FFF8E1",
              },
              device === "mobile" && { width: "100%" },
            ]}
          >
            <View style={[styles.cardsContainer, getGrid(columns)]}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.card}>
                  <View style={styles.cardCircle}></View>
                  <Text style={styles.cardText}>Card {i}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Footer text */}
      <Text style={styles.footer}>
        {device === "mobile" && (
          <>
            <Text style={styles.mobileText}>📱 Mobile:</Text> Sidebar moves
            below content, cards stack vertically.
          </>
        )}

        {device === "laptop" && (
          <>
            <Text style={styles.laptopText}>💻 Laptop:</Text> Sidebar left,
            cards become 2 columns.
          </>
        )}

        {device === "desktop" && (
          <>
            <Text style={styles.desktopText}>🖥️ Desktop:</Text> 3-column layout
            with spacious design.
          </>
        )}
      </Text>
    </View>
  );
}

/** 🌟 Helper: dynamic grid */
function getGrid(columns) {
  return {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  };
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFDF2",
    borderColor: "#FFE082",
    borderWidth: 1,
    borderRadius: 30,
    padding: 20,
    marginTop: 18,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    color: "#4E342E",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: "#4E342E",
    textAlign: "center",
    marginBottom: 15,
  },
  deviceButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 14,
    gap: 10,
  },
  deviceButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFF5CC",
  },
  deviceButtonActive: (type) => ({
    backgroundColor:
      type === "mobile"
        ? "#FFB74D"
        : type === "laptop"
        ? "#4FC3F7"
        : "#81C784",
  }),
  deviceButtonText: {
    color: "#4E342E",
    fontWeight: "600",
  },

  frame: {
    alignSelf: "center",
    backgroundColor: "#fffef9",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFECB3",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 16,
  },
  navBar: {
    height: 40,
    backgroundColor: "#F5B700",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  navCircles: {
    position: "absolute",
    left: 10,
    flexDirection: "row",
    gap: 6,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },
  navTitle: {
    color: "white",
    fontWeight: "700",
  },

  layout: {
    flex: 1,
  },

  sidebar: {
    width: "25%",
    backgroundColor: "#FFF9C4",
    borderRightWidth: 1,
    borderColor: "#FFECB3",
    justifyContent: "center",
    padding: 16,
    gap: 10,
  },
  sideItem: {
    fontSize: 15,
    color: "#4E342E",
    fontWeight: "600",
  },

  content: {
    flex: 1,
    padding: 16,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  card: {
    width: 100,
    height: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFECB3",
    justifyContent: "center",
    alignItems: "center",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowColor: "#000",
  },
  cardCircle: {
    width: 35,
    height: 35,
    backgroundColor: "#FFD54F",
    borderRadius: 20,
    marginBottom: 6,
  },
  cardText: {
    fontWeight: "600",
    color: "#4E342E",
  },

  footer: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 6,
    color: "#555",
    fontStyle: "italic",
  },
  mobileText: { color: "#F57C00", fontWeight: "700" },
  laptopText: { color: "#0288D1", fontWeight: "700" },
  desktopText: { color: "#2E7D32", fontWeight: "700" },
});
