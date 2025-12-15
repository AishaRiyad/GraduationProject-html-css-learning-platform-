// File: components/SectionAccordionMobile.js
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import RenderBlocksMobile from "./RenderBlocksMobile";

// تفعيل الأنيميشن في أندرويد
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SectionAccordionMobile({
  sec,
  index,
  openIndex,
  setOpenIndex,
}) {
  const isOpen = openIndex === index;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(isOpen ? null : index);
  };

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <TouchableOpacity onPress={toggle} style={styles.header}>
        <View>
          <Text style={styles.title}>{sec.title}</Text>
          <View style={styles.underline} />
        </View>

        <View style={[styles.arrowBox, isOpen && styles.arrowOpen]}>
          <Text style={styles.arrow}>▼</Text>
        </View>
      </TouchableOpacity>

      {/* Body */}
      {isOpen && (
        <View style={styles.body}>
          {/* النصوص والكود */}
          <RenderBlocksMobile
            blocks={sec.content}
            secTitle={sec.title}
          />

          {/* صورة القسم (إن وجدت) */}
          {sec.media && (
            <Image
              source={{ uri: sec.media }}
              style={styles.media}
              resizeMode="cover"
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8D58A",
    marginBottom: 16,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#FFFDF3",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4E3A22",
  },

  underline: {
    marginTop: 4,
    width: 50,
    height: 3,
    backgroundColor: "#F5B700",
    borderRadius: 4,
  },

  arrowBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F1DA96",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "0deg" }],
    transition: "transform 0.2s",
  },

  arrowOpen: {
    backgroundColor: "#FFEBA0",
    transform: [{ rotate: "180deg" }],
  },

  arrow: {
    color: "#8A6B2A",
    fontSize: 16,
    fontWeight: "700",
  },

  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 6,
  },

  media: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#F1DA96",
  },
});
