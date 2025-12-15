// pages/SupervisorSubmissionsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const API = "http://10.0.2.2:5000";

export default function SupervisorSubmissionsScreen() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  function formatDate(dateString) {
    const d = new Date(dateString);

    const date = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const time = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${date} — ${time}`;
  }

  async function fetchSubmissions() {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API}/api/supervisor/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubmissions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading submissions", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={{ marginTop: 10, color: "#4b5563" }}>
          Loading submissions...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Student Submissions</Text>

      {submissions.length === 0 && (
        <Text style={styles.noData}>No submissions yet.</Text>
      )}

      {submissions.map((s) => (
        <View key={s.id} style={styles.card}>
          {/* Student Name */}
          <View style={styles.row}>
            <Icon name="user" size={18} color="#444" />
            <Text style={styles.valueText}>
              {s.student_name || "Unknown Student"}
            </Text>
          </View>

          {/* File Name */}
          <View style={styles.row}>
            <Icon name="file" size={18} color="#444" />
            <Text style={styles.valueText}>
              {s.original_name || "No file name"}
            </Text>
          </View>

          {/* Status */}
          <View style={styles.row}>
            <Icon name="info" size={18} color="#444" />
            <Text
              style={[
                styles.status,
                s.status === "submitted"
                  ? styles.submitted
                  : s.status === "replaced"
                  ? styles.replaced
                  : styles.deleted,
              ]}
            >
              {s.status}
            </Text>
          </View>

          {/* Size */}
          <View style={styles.row}>
            <Icon name="database" size={18} color="#444" />
            <Text style={styles.valueText}>
              {s.size ? (s.size / 1024).toFixed(1) + " KB" : "—"}
            </Text>
          </View>

          {/* Submitted At */}
          <View style={styles.row}>
            <Icon name="clock" size={18} color="#444" />
            <Text style={styles.valueText}>
              {s.created_at ? formatDate(s.created_at) : "—"}
            </Text>
          </View>

          {/* Action */}
          {s.file_url ? (
    <TouchableOpacity
        style={styles.viewBtn}
        onPress={() => {
  if (!s.file_url || s.file_url === "[]" ) {
    alert("This submission has no file to view.");
    return;
  }
  navigation.navigate("SubmissionDetails", { submissionId: s.id });
}}

    >
        <Text style={styles.viewBtnText}>View</Text>
    </TouchableOpacity>
) : (
    <Text style={styles.noData}>No file</Text>
)}

        </View>
      ))}
    </ScrollView>
  );
}

/* ============================
   STYLES
============================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
    paddingHorizontal: 16,
  },

  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 18,
    color: "#333",
  },

  noData: {
    textAlign: "center",
    color: "#999",
    marginTop: 10,
  },

  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  valueText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },

  status: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },

  submitted: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },

  replaced: {
    backgroundColor: "#DBEAFE",
    color: "#1E3A8A",
  },

  deleted: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
  },

  viewBtn: {
    marginTop: 10,
    backgroundColor: "#facc15",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },

  viewBtnText: {
    fontWeight: "700",
    color: "#333",
  },
});
