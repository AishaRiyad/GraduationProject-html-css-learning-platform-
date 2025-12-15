import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CertificatesTabMobile() {
  const navigation = useNavigation();

  return (
    <View style={{ padding: 5, marginTop: 10 }}>

      {/* 🔶 HTML Certificate */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("CertificatePageMobile", { topic: "html" })}
      >
        <Text style={styles.title}>HTML Certificate</Text>
        <Text style={styles.description}>
          Certificate for completing the Basic HTML level.
        </Text>

        <View style={styles.button}>
          <Text style={styles.buttonText}>View Certificate</Text>
        </View>
      </TouchableOpacity>

      {/* 🔷 CSS Certificate */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("CertificatePageMobile", { topic: "css" })}
      >
        <Text style={styles.title}>CSS Certificate</Text>
        <Text style={styles.description}>
          Certificate for completing the CSS level.
        </Text>

        <View style={styles.button}>
          <Text style={styles.buttonText}>View Certificate</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff7cc",
    borderColor: "#facc15",
    borderWidth: 1,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3f3f46",
  },
  description: {
    marginTop: 6,
    color: "#57534e",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#eab308",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
