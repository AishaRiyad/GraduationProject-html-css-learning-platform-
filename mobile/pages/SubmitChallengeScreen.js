import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "http://10.0.2.2:5000";

export default function SubmitChallengeScreen({ route, navigation }) {
  const { challengeId } = route.params;
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!url.trim()) {
      setError("Submission URL is required.");
      return;
    }

    try {
      setBusy(true);
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${API}/api/challenges/${challengeId}/submit`,
        { submission_url: url.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Your submission has been sent!");
      navigation.goBack();

    } catch (err) {
      console.error(err);
      setError("Failed to submit. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Submit your solution</Text>

        <Text style={styles.label}>Submission URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://github.com/username/project"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={busy}
          style={[styles.button, busy && { opacity: 0.5 }]}
        >
          <Text style={styles.buttonText}>
            {busy ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF9C3",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: "#78350F",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D4D4D4",
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  error: {
    color: "red",
    marginBottom: 8,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#FACC15",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
  },
});
