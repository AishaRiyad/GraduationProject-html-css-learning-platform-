import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";

const API = "http://10.0.2.2:5000";

export default function ChallengeDetailsScreen({ route, navigation }) {
  const { challengeId } = route.params;

  const [challenge, setChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const [htmlFile, setHtmlFile] = useState(null);
  const [cssFile, setCssFile] = useState(null);

  /* -----------------------------
        FETCH Challenge Details
  ------------------------------ */
  const fetchChallenge = async () => {
    const res = await axios.get(`${API}/api/challenges/${challengeId}`);
    setChallenge(res.data);
  };

  /* -----------------------------
        FETCH Submissions
  ------------------------------ */
  const fetchSubmissions = async () => {
    const token = await AsyncStorage.getItem("token");

    const res = await axios.get(
      `${API}/api/challenges/${challengeId}/submissions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSubmissions(res.data || []);
  };

  /* -----------------------------
        DELETE Submission
  ------------------------------ */
  const handleDeleteSubmission = async (submissionId) => {
    Alert.alert("Delete Submission", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(
              `${API}/api/challenges/submissions/${submissionId}`
            );
            fetchSubmissions();
          } catch (err) {
            Alert.alert("Error", "Failed to delete submission.");
          }
        },
      },
    ]);
  };

  /* -----------------------------
         FILE PICKER (REAL)
  ------------------------------ */
  const pickFile = async (setter, type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setter(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick file.");
    }
  };

  /* -----------------------------
       UPLOAD HTML + CSS FILES
  ------------------------------ */
  const handleUploadFiles = async () => {
    if (!htmlFile || !cssFile) {
      Alert.alert("Error", "Please choose both HTML and CSS files.");
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("html", {
        uri: htmlFile.uri,
        type: "text/html",
        name: htmlFile.name,
      });

      fd.append("css", {
        uri: cssFile.uri,
        type: "text/css",
        name: cssFile.name,
      });

      const token = await AsyncStorage.getItem("token");

      await axios.post(`${API}/api/challenges/${challengeId}/submit`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Files submitted successfully!");
      fetchSubmissions();

      setHtmlFile(null);
      setCssFile(null);
    } catch (err) {
      Alert.alert("Error", "Failed to submit files.");
    } finally {
      setSubmitting(false);
    }
  };

  /* -----------------------------
           AI Evaluation
  ------------------------------ */
  const handleEvaluateAI = async () => {
    if (submissions.length === 0)
      return Alert.alert("Error", "Submit files first!");

    try {
      setEvaluating(true);
      const token = await AsyncStorage.getItem("token");

      const latest = submissions[0];

      const body = {
        challengeId: latest.challenge_id,
        userId: latest.user_id,
      };

      const res = await axios.post(
        `${API}/api/ai-local/evaluate-challenge`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiResult({
        score: res.data.score,
        feedback: res.data.feedback,
      });

      Alert.alert("AI Evaluation Done!", `Score: ${res.data.score}/100`);
    } catch (err) {
      Alert.alert("Error", "AI evaluation failed.");
    } finally {
      setEvaluating(false);
    }
  };

  /* -----------------------------
            INITIAL LOAD
  ------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([fetchChallenge(), fetchSubmissions()]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );

  if (!challenge)
    return (
      <View style={styles.center}>
        <Text style={{ color: "#444" }}>Challenge not found.</Text>
      </View>
    );

  /* -----------------------------
               UI
  ------------------------------ */
  return (
    <ScrollView style={styles.screen}>
      {/* Challenge Info */}
      <View style={styles.card}>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.description}</Text>

        <View style={styles.tagBox}>
          <Text style={styles.tagText}>
            {challenge.difficulty.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.deadline}>
          ⏳ Deadline:{" "}
          <Text style={{ fontWeight: "700" }}>
            {new Date(challenge.deadline).toLocaleString()}
          </Text>
        </Text>
      </View>

      {/* Upload Files */}
      <View style={styles.uploadCard}>
        <Text style={styles.uploadTitle}>Upload Your Solution</Text>

        {/* HTML */}
        <TouchableOpacity
          style={styles.fileButton}
          onPress={() => pickFile(setHtmlFile, "text/html")}
        >
          <Text style={styles.fileButtonText}>
            {htmlFile ? htmlFile.name : "Choose HTML file"}
          </Text>
        </TouchableOpacity>

        {/* CSS */}
        <TouchableOpacity
          style={styles.fileButton}
          onPress={() => pickFile(setCssFile, "text/css")}
        >
          <Text style={styles.fileButtonText}>
            {cssFile ? cssFile.name : "Choose CSS file"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.5 }]}
          disabled={submitting}
          onPress={handleUploadFiles}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? "Submitting..." : "Upload Solution"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submissions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Submissions</Text>

        {submissions.length === 0 ? (
          <Text style={styles.emptyText}>No submissions yet.</Text>
        ) : (
          submissions.map((s) => (
            <View key={s.id} style={styles.submissionCard}>
              <Text style={styles.subUser}>{s.user_name}</Text>
              <Text style={styles.subDate}>
                {new Date(s.submitted_at).toLocaleString()}
              </Text>

              {/* HTML */}
              {s.html_path ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`${API}${s.html_path}`)}
                >
                  <Text style={styles.linkText}>View HTML</Text>
                </TouchableOpacity>
              ) : null}

              {/* CSS */}
              {s.css_path ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`${API}${s.css_path}`)}
                >
                  <Text style={styles.linkText}>View CSS</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteSubmission(s.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* AI Evaluation */}
      <View style={styles.aiCard}>
        <Text style={styles.sectionTitle}>🤖 AI Evaluation</Text>
        <Text style={styles.aiHint}>
          Let AI check your latest submission and give you a score.
        </Text>

        {aiResult ? (
          <View style={styles.aiBox}>
            <Text style={styles.aiScore}>Score: {aiResult.score}/100</Text>
            <Text style={styles.aiFeedback}>{aiResult.feedback}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No AI evaluation yet.</Text>
        )}

        <TouchableOpacity
          style={[styles.aiButton, evaluating && { opacity: 0.5 }]}
          disabled={evaluating}
          onPress={handleEvaluateAI}
        >
          <Text style={styles.aiButtonText}>
            {evaluating ? "Evaluating..." : "Get AI Evaluation"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* -----------------------------
             STYLES
------------------------------ */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF9C3",
    padding: 15,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 15,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#78350F" },
  description: { fontSize: 15, marginTop: 8, color: "#444" },

  tagBox: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#FCE7F3",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: "#9D174D",
    fontWeight: "700",
  },

  deadline: { marginTop: 10, fontSize: 14, color: "#555" },

  uploadCard: {
    backgroundColor: "#FFF7CE",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  uploadTitle: { fontSize: 18, fontWeight: "700", color: "#78350F" },

  fileButton: {
    marginTop: 12,
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  fileButtonText: { fontSize: 14, color: "#444" },

  submitBtn: {
    backgroundColor: "#FACC15",
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "#111" },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#78350F" },
  emptyText: { color: "#777", marginTop: 10 },

  submissionCard: {
    marginTop: 12,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  subUser: { fontSize: 15, fontWeight: "700", color: "#444" },
  subDate: { fontSize: 12, color: "#777", marginBottom: 8 },
  linkText: {
    color: "#0284C7",
    fontSize: 14,
    marginBottom: 4,
  },
  deleteBtn: {
    marginTop: 8,
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteText: { color: "#B91C1C", fontWeight: "700" },

  aiCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  aiHint: { color: "#666", marginTop: 6 },
  aiBox: {
    marginTop: 12,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
  },
  aiScore: { fontWeight: "700", fontSize: 16, color: "#92400E" },
  aiFeedback: { marginTop: 6, color: "#444" },
  aiButton: {
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#22C55E",
    alignItems: "center",
  },
  aiButtonText: { fontSize: 16, fontWeight: "700", color: "white" },
});
