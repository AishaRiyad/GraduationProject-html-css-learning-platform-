// File: pages/BuildProjectScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API = "http://10.0.2.2:5000";

export default function BuildProjectScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [files, setFiles] = useState([]); // الملفات الجديدة اللي لسا ما اترفعت
  const [busy, setBusy] = useState(false);

  const fileRef = useRef(null); // بس حفاظًا على نفس المنطق، مش ضروري للموبايل

  // ✅ جلب السابميشن الحالية
  useEffect(() => {
  const fetchSubmission = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");
      console.log("🔑 Using token:", token);

      if (!token || token.length < 10) {
        console.log("❌ No token found");
        return;
      }

      const res = await axios.get(
        `${API}/api/submit-projects/submission/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("📩 Response:", res.data);

      if (res.data?.submission) {
        let fileUrl = res.data.submission.file_url;

        if (typeof fileUrl === "string") {
          try {
            fileUrl = JSON.parse(fileUrl || "[]");
          } catch {
            fileUrl = [];
          }
        }

        if (!Array.isArray(fileUrl)) {
          fileUrl = [];
        }

        setSubmission({ ...res.data.submission, file_url: fileUrl });
      } else {
        setSubmission(null);
      }
    } catch (err) {
      console.log("❌ Error loading submission:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  fetchSubmission();
}, []);


  // ✅ اختيار ملفات (HTML / CSS / ZIP)
  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/zip",
          "application/x-zip-compressed",
          "text/html",
          "text/css",
          "application/octet-stream",
        ],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const picked = result.assets || [result];

      setFiles((prev) => [
        ...prev,
        ...picked.map((f) => ({
          uri: f.uri,
          name: f.name || "file",
          size: f.size || 0,
          mimeType: f.mimeType || "application/octet-stream",
        })),
      ]);
    } catch (err) {
      console.log("❌ Error picking files:", err);
      Alert.alert("Error", "Failed to pick files.");
    }
  };

  // ✅ رفع ملفات جديدة (تُضاف أسفل القديمة)
  const submitFile = async () => {
    if (!files.length) return;
    setBusy(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const fd = new FormData();

      files.forEach((f) => {
        fd.append("files", {
          uri: f.uri,
          name: f.name,
          type: f.mimeType || "application/octet-stream",
        });
      });

      const res = await axios.post(
        `${API}/api/submit-projects/submission`,
        fd,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data?.submission) {
        let fileUrl = res.data.submission.file_url;
        if (typeof fileUrl === "string") {
          try {
            fileUrl = JSON.parse(fileUrl || "[]");
          } catch {
            fileUrl = [];
          }
        }
        if (!Array.isArray(fileUrl)) fileUrl = [];
        setSubmission({ ...res.data.submission, file_url: fileUrl });
      }

      setFiles([]);
    } catch (e) {
      console.log("❌ Upload failed:", e);
      Alert.alert("Error", "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  // ✅ حذف ملف واحد
  const deleteSingleFile = async (fileName) => {
    Alert.alert(
      "Delete File",
      `Delete ${fileName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              const token = await AsyncStorage.getItem("token");

              const res = await axios.delete(
                `${API}/api/submit-projects/submission/single`,
                {
                  headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    "Content-Type": "application/json",
                  },
                  data: { fileName },
                }
              );

              if (res.data?.submission) {
                let fileUrl = res.data.submission.file_url;
                if (typeof fileUrl === "string") {
                  try {
                    fileUrl = JSON.parse(fileUrl || "[]");
                  } catch {
                    fileUrl = [];
                  }
                }
                if (!Array.isArray(fileUrl)) fileUrl = [];
                setSubmission({ ...res.data.submission, file_url: fileUrl });
              }
            } catch (e) {
              console.log("❌ Delete single failed:", e);
              Alert.alert("Error", "Delete failed");
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  // ✅ حذف جميع الملفات
  const deleteSubmission = async () => {
    Alert.alert(
      "Delete All",
      "Are you sure you want to delete all your submissions?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              const token = await AsyncStorage.getItem("token");
              await axios.delete(`${API}/api/submit-projects/submission`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              setSubmission(null);
            } catch (e) {
              console.log("❌ Delete all failed:", e);
              Alert.alert("Error", "Delete failed");
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d97706" />
        <Text style={{ marginTop: 8, color: "#92400e" }}>Loading…</Text>
      </View>
    );
  }

  const fileList = Array.isArray(submission?.file_url)
    ? submission.file_url
    : [];

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚀 Advanced Project</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔹 Project Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Advanced HTML + CSS Project</Text>

          <Text style={styles.sectionTitle}>📜 Project Description</Text>

          <Text style={styles.paragraph}>
            In this <Text style={styles.bold}>Advanced HTML + CSS Project</Text>,
            you are required to build a fully responsive and visually appealing{" "}
            <Text style={styles.bold}>Landing Page</Text> that demonstrates your
            understanding of modern web structure and styling.
          </Text>

          <Text style={styles.paragraph}>
            Your project must include:
          </Text>

          <View style={styles.list}>
            <Text style={styles.listItem}>
              • Semantic HTML structure (header, main, footer, etc.)
            </Text>
            <Text style={styles.listItem}>
              • External CSS file with custom styling and layout
            </Text>
            <Text style={styles.listItem}>
              • Responsive design that adapts to mobile and desktop
            </Text>
            <Text style={styles.listItem}>
              • At least one animation or hover effect
            </Text>
          </View>

          <Text style={styles.paragraph}>
            💡 You can upload your files below (.html, .css, or .zip) — each
            upload will appear dynamically under the submission list.
          </Text>

          <Text style={styles.note}>
            Note: Make sure your uploaded files are correctly named and tested
            locally before submission.
          </Text>

          {/* زر الذهاب لمحرر (لو عندك شاشة Editor لاحقًا) */}
          <View style={{ marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => {
                // عدلي الاسم حسب شاشة المحرر لو أنشأتيها
                // navigation.navigate("ProjectEditor");
                Alert.alert(
                  "Editor",
                  "Connect this button to your editor screen when it's ready."
                );
              }}
              style={styles.editorBtn}
            >
              <Text style={styles.editorBtnText}>✏️ Go to Editor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔹 Submission Section */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.cardSubtitle}>📦 Submission</Text>

          {fileList.length > 0 ? (
            <View style={styles.submissionBox}>
              <Text style={styles.statusText}>
                Status:{" "}
                <Text style={{ color: "#047857", fontWeight: "700" }}>
                  Submitted
                </Text>
              </Text>

              {fileList.map((f, i) => {
                const fullUrl = f.url?.startsWith("http")
                  ? f.url
                  : `${API}${f.url || ""}`;

                return (
                  <View key={i} style={styles.fileRow}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("FilePreview", {
                          url: fullUrl,
                          name: f.name || `File ${i + 1}`,
                        })
                      }
                      style={{ flex: 1 }}
                    >
                      <Text style={styles.fileName}>
                        {f.name || `File ${i + 1}`}
                      </Text>
                      <Text style={styles.fileSize}>
                        {(f.size / 1024).toFixed(1)} KB
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => deleteSingleFile(f.name)}
                      disabled={busy}
                    >
                      <Text style={styles.deleteOne}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              {submission?.updated_at && (
                <Text style={styles.lastUpdated}>
                  Last updated:{" "}
                  <Text style={{ fontWeight: "600" }}>
                    {new Date(submission.updated_at).toLocaleString()}
                  </Text>
                </Text>
              )}

              <View style={styles.submissionActions}>
                <TouchableOpacity
                  style={styles.addMoreBtn}
                  onPress={pickFiles}
                  disabled={busy}
                >
                  <Text style={styles.addMoreText}>Add More</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteAllBtn}
                  onPress={deleteSubmission}
                  disabled={busy}
                >
                  <Text style={styles.deleteAllText}>Delete All</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No files uploaded yet.</Text>
              <Text style={styles.emptyText}>
                Upload one or more files (.zip, .html, .css).
              </Text>
            </View>
          )}

          {/* ✅ اختيار ملفات + زر submit */}
          <View style={styles.uploadRow}>
            <TouchableOpacity
              style={styles.chooseBtn}
              onPress={pickFiles}
              disabled={busy}
            >
              <Text style={styles.chooseText}>اختر الملفات</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (busy || files.length === 0) && { opacity: 0.6 },
              ]}
              onPress={submitFile}
              disabled={busy || files.length === 0}
            >
              {busy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          {files.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {files.map((f, i) => (
                <Text key={i} style={styles.selectedFile}>
                  • {f.name}{" "}
                  <Text style={styles.fileSizeText}>
                    ({(f.size / 1024).toFixed(1)} KB)
                  </Text>
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.hint}>
            Max file size: 100MB • Accepted: .zip, .html, .css
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fffbeb", // amber-50
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffbeb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fef3c7", // amber-100
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#fde68a",
  },
  backText: {
    color: "#92400e",
    fontWeight: "600",
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "800",
    color: "#78350f",
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fbbf24",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#92400e",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: "#451a03",
    lineHeight: 20,
    marginBottom: 6,
  },
  bold: {
    fontWeight: "700",
  },
  list: {
    marginTop: 4,
    marginBottom: 6,
  },
  listItem: {
    fontSize: 14,
    color: "#451a03",
    lineHeight: 20,
  },
  note: {
    marginTop: 6,
    fontSize: 13,
    color: "#b45309",
    fontStyle: "italic",
  },
  editorBtn: {
    backgroundColor: "#fbbf24",
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
  },
  editorBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  cardSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 8,
  },
  submissionBox: {
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#78350f",
  },
  fileRow: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#fcd34d",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1d4ed8",
    textDecorationLine: "underline",
  },
  fileSize: {
    fontSize: 11,
    color: "#b45309",
  },
  deleteOne: {
    fontSize: 13,
    color: "#b91c1c",
    fontWeight: "600",
  },
  lastUpdated: {
    marginTop: 6,
    fontSize: 12,
    color: "#92400e",
  },
  submissionActions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  addMoreBtn: {
    flex: 1,
    backgroundColor: "#fde68a",
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
  },
  addMoreText: {
    color: "#92400e",
    fontWeight: "600",
    fontSize: 13,
  },
  deleteAllBtn: {
    flex: 1,
    backgroundColor: "#fee2e2",
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
  },
  deleteAllText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyBox: {
    backgroundColor: "#fffbeb",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
  emptyText: {
    fontSize: 13,
    color: "#b45309",
  },
  uploadRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  chooseBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fbbf24",
    backgroundColor: "#fef3c7",
    paddingVertical: 8,
    alignItems: "center",
  },
  chooseText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e",
  },
  submitBtn: {
    width: 110,
    borderRadius: 999,
    backgroundColor: "#fbbf24",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  submitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  selectedFile: {
    fontSize: 13,
    color: "#78350f",
  },
  fileSizeText: {
    fontSize: 11,
    color: "#b45309",
  },
  hint: {
    marginTop: 6,
    fontSize: 11,
    color: "#b45309",
  },
});
