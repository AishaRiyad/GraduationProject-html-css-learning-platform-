// pages/ViewSubmissionMobile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  TextInput,
} from "react-native";
import axios from "axios";
import { Feather as Icon } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

const API = "http://10.0.2.2:5000";

export default function ViewSubmissionMobile() {

  // 🔥 احصلي على params بشكل صحيح
  const route = useRoute();
  const navigation = useNavigation();
  const { submissionId } = route.params;

  console.log("📌 RECEIVED submissionId:", submissionId);

  const [submission, setSubmission] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState("");
  const [feedback, setFeedback] = useState("");
  const [existingReview, setExistingReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    loadSubmission();
  }, []);

  async function loadSubmission() {
    try {
      const res = await axios.get(`${API}/api/supervisor/submission/${submissionId}`);
      setSubmission(res.data);

      let parsed = [];
      try {
        parsed = JSON.parse(res.data.file_url || "[]");
      } catch {
        parsed = [];
      }
      setFiles(parsed);

      loadReview(res.data.id);
    } catch (err) {
      console.error("❌ Error loading submission:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadReview(id) {
    try {
      const res = await axios.get(`${API}/api/supervisor/review/${id}`);
      setExistingReview(res.data);
      setRating(res.data.rating);
      setFeedback(res.data.feedback);
    } catch {}
  }

  const openFile = (url) => Linking.openURL(`${API}${url}`);

  async function submitReview() {
    try {
      await axios.post(`${API}/api/supervisor/review`, {
        submission_id: submission.id,
        supervisor_id: submission.supervisor_id || 1,
        rating,
        feedback,
      });

      alert(existingReview ? "Review updated!" : "Review submitted!");
      setIsEditingReview(false);
      loadReview(submission.id);

    } catch (err) {
      console.error(err);
    }
  }

  if (loading || !submission) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading submission...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* BACK BUTTON */}
      <TouchableOpacity 
        style={styles.backBtn} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={20} color="#333" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>View Submission</Text>

      {/* Student Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Student: </Text>
          {submission.student_name}
        </Text>

        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Status: </Text>
          {submission.status}
        </Text>

        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Date: </Text>
          {new Date(submission.created_at).toLocaleString()}
        </Text>
      </View>

      {/* Files */}
      <Text style={styles.sectionTitle}>Submitted Files</Text>

      {files.length === 0 && <Text style={styles.noData}>No files found.</Text>}

      {files.map((f, i) => (
        <View key={i} style={styles.fileRow}>
          <Text style={styles.fileName}>{f.url.split("/").pop()}</Text>

          <TouchableOpacity onPress={() => openFile(f.url)}>
            <Text style={styles.openBtn}>Open</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* REVIEW SECTION */}
      <View style={styles.reviewWrapper}>
        <Text style={styles.sectionTitle}>Supervisor Evaluation</Text>

        {existingReview && !isEditingReview && (
          <View style={styles.reviewBox}>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Rating:</Text> {existingReview.rating}/10
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Feedback:</Text>{" "}
              {existingReview.feedback || "No feedback"}
            </Text>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setIsEditingReview(true)}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {(!existingReview || isEditingReview) && (
          <View>
            <Text style={styles.label}>Rating (1–10):</Text>
            <TextInput
              value={rating}
              onChangeText={setRating}
              keyboardType="numeric"
              style={styles.input}
            />

            <Text style={styles.label}>Feedback:</Text>
            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              style={[styles.input, { height: 90 }]}
              multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
              <Text style={styles.submitText}>
                {existingReview ? "Save Changes" : "Submit Review"}
              </Text>
            </TouchableOpacity>

            {existingReview && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditingReview(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
  backgroundColor: "#FFFDF5",
  padding: 16,
  paddingTop: 40,   // ← أضفنا مسافة من فوق
},

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#444" },

  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backText: { marginLeft: 6, fontSize: 14, color: "#333" },

  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },

  infoBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 20,
  },
  infoText: { marginBottom: 6, color: "#444" },
  infoLabel: { fontWeight: "700" },

  noData: { textAlign: "center", color: "#777", marginTop: 10 },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginVertical: 10 },

  fileRow: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  fileName: { fontWeight: "600", color: "#444" },
  openBtn: { color: "#d97706", fontWeight: "700" },

  /* Review */
  reviewWrapper: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  reviewBox: {
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#86efac",
    marginBottom: 12,
  },

  editBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
    backgroundColor: "#facc15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editText: { fontWeight: "700", color: "#333" },

  label: { marginTop: 10, marginBottom: 4, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
  },

  submitBtn: {
    marginTop: 14,
    backgroundColor: "#facc15",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { fontWeight: "700", color: "#333" },

  cancelBtn: {
    marginTop: 8,
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: { fontWeight: "600", color: "#333" },
});
