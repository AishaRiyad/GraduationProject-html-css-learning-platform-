// pages/StudentSubmissionsMobile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import axios from "axios";
import { Feather as Icon } from "@expo/vector-icons";
import ViewSubmissionMobile from "./ViewSubmissionMobile";

const API = "http://10.0.2.2:5000";

export default function StudentSubmissionsMobile({ studentId, onBack }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

if (selectedSubmissionId) {
  return (
    <ViewSubmissionMobile
      submissionId={selectedSubmissionId}
      onBack={() => setSelectedSubmissionId(null)}
    />
  );
}

  useEffect(() => {
    async function fetchSubs() {
      try {
        const res = await axios.get(
          `${API}/api/supervisor/students/${studentId}/submissions`
        );
        setSubmissions(res.data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubs();
  }, [studentId]);

  const downloadFile = (url) => {
    Linking.openURL(`${API}${url}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading submissions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Icon name="arrow-left" size={20} color="#555" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Project Submissions</Text>

      {submissions.length === 0 && (
        <Text style={styles.noData}>No submissions found.</Text>
      )}

      {submissions.map((sub) => (
        <View key={sub.id} style={styles.card}>
          <Text style={styles.fileName}>{sub.original_name}</Text>

          <Text style={styles.meta}>Status: {sub.status}</Text>
          <Text style={styles.meta}>
            Size: {(sub.size / 1024 / 1024).toFixed(2)} MB
          </Text>

          <Text style={styles.meta}>
            Uploaded:{" "}
            {new Date(sub.created_at).toLocaleString()}
          </Text>

         <TouchableOpacity
  style={styles.downloadBtn}
  onPress={() => setSelectedSubmissionId(sub.id)}
>
  <Text style={styles.downloadText}>View</Text>
</TouchableOpacity>

        </View>
      ))}
    </ScrollView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFDF5", padding: 16 },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#444", marginTop: 8 },

  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  backBtnText: { marginLeft: 6, color: "#555", fontSize: 14 },

  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },

  noData: { color: "#777", textAlign: "center", marginTop: 20 },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 14,
  },

  fileName: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  meta: { fontSize: 12, color: "#555", marginTop: 2 },

  downloadBtn: {
    backgroundColor: "#facc15",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  downloadText: { fontWeight: "700", color: "#333" },
});
