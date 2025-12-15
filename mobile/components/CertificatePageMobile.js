import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute } from "@react-navigation/native";

const API = "http://10.0.2.2:5000";

export default function CertificatePageMobile() {
  const route = useRoute();
  const { topic } = route.params; // "html" or "css"
  const normalizedTopic = (topic || "html").toLowerCase();

  const [state, setState] = useState({
    loading: true,
    finished: false,
    cert: null,
    error: null,
  });

  useEffect(() => {
    loadCertificate();
  }, []);

  const loadCertificate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(
        `${API}/api/quiz/certificate/${normalizedTopic}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data.ok) {
        setState({
          loading: false,
          finished: false,
          cert: null,
          error: res.data.message || "Error loading certificate",
        });
      } else {
        setState({
          loading: false,
          finished: res.data.finished,
          cert: res.data.certificate || null,
          error: null,
        });
      }
    } catch (err) {
      setState({
        loading: false,
        finished: false,
        cert: null,
        error: "Certificate not available",
      });
    }
  };

  if (state.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#eab308" />
        <Text style={{ marginTop: 10 }}>Loading certificate...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{state.error}</Text>
      </View>
    );
  }

  if (!state.finished || !state.cert) {
    return (
      <View style={styles.center}>
        <Text style={styles.notDone}>Quiz Not Completed Yet</Text>
        <Text style={styles.notDoneSub}>
          Complete all {normalizedTopic.toUpperCase()} levels to unlock your certificate.
        </Text>
      </View>
    );
  }

  const { name, completedAt, userId } = state.cert;
  const title =
    normalizedTopic === "css"
      ? "CSS Mastery Certificate"
      : "HTML Mastery Certificate";

 return (
  <View style={styles.wrapper}>
    <View style={styles.card}>

      {/* Background circles */}
      <View style={styles.circleTop} />
      <View style={styles.circleBottom} />

      <Text style={styles.mainTitle}>CERTIFICATE OF COMPLETION</Text>

      <Text style={styles.subText}>This certificate is proudly presented to</Text>

      <Text style={styles.nameText}>{name}</Text>

      <Text style={styles.bodyText}>
        for successfully completing all required levels of the{" "}
        <Text style={{ fontWeight: "bold" }}>
          {normalizedTopic.toUpperCase()} Quiz Journey.
        </Text>
      </Text>

      <View style={styles.badgeWrapper}>
        <Text style={styles.badge}>{title}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Completion Date</Text>
          <Text style={styles.footerValue}>
            {new Date(completedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Instructor</Text>
          <Text style={styles.footerValue}>HTML & CSS Learning Platform</Text>
        </View>

        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Certificate ID</Text>
          <Text style={styles.footerValue}>
            #{userId}-{normalizedTopic.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  </View>
);


}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",   // 👈 المحتوى الآن في منتصف الشاشة عموديًا
    alignItems: "center",       // 👈 منتصف الشاشة أفقيًا
    padding: 20,
  },

  card: {
    width: "95%",
    backgroundColor: "#faf5e6",
    padding: 25,
    borderWidth: 8,
    borderColor: "#fbbf24",
    borderRadius: 25,
    position: "relative",
    overflow: "hidden",
  },

  circleTop: {
    position: "absolute",
    top: -40,               // 👈 قللتها حتى ما ترفع المحتوى
    left: -40,
    width: 120,
    height: 120,
    backgroundColor: "#fde68a",
    borderRadius: 100,
  },

  circleBottom: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 150,
    height: 150,
    backgroundColor: "#fef3c7",
    borderRadius: 100,
  },

  mainTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#b45309",
    letterSpacing: 3,
    marginBottom: 15,
  },

  subText: {
    textAlign: "center",
    color: "#555",
    marginBottom: 6,
  },

  nameText: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#78350f",
    marginVertical: 10,
  },

  bodyText: {
    textAlign: "center",
    color: "#444",
    marginVertical: 10,
    paddingHorizontal: 10,
    fontSize: 14,
  },

  badgeWrapper: {
    alignItems: "center",
    marginVertical: 15,
  },

  badge: {
    borderWidth: 1,
    borderColor: "#eab308",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    color: "#b45309",
    fontWeight: "600",
  },

  footer: {
    marginTop: 20,
    gap: 18,
  },

  footerItem: {
    alignItems: "center",
  },

  footerLabel: {
    fontWeight: "bold",
    color: "#444",
  },

  footerValue: {
    color: "#555",
    marginTop: 3,
  },
});
