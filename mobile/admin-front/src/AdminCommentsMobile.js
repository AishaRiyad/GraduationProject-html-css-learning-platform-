import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { listComments, replyToComment, deleteComment } from "./AdminApi";

export default function AdminCommentsMobile() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [sendingReply, setSendingReply] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await listComments({ limit: 200 });
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openReply(id) {
    setReplyId(id);
    setReplyText("");
    setReplyOpen(true);
  }

  function closeReply() {
    setReplyOpen(false);
    setReplyId(null);
    setReplyText("");
  }

  async function submitReply() {
    const text = replyText.trim();
    if (!text) return;

    try {
      setSendingReply(true);
      await replyToComment(replyId, text);
      closeReply();
      await load();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  }

  function handleDelete(id) {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(id);
              setComments((prev) => prev.filter((c) => c.id !== id));
            } catch (e) {
              Alert.alert("Error", e.message || "Failed to delete comment.");
            }
          },
        },
      ]
    );
  }

  const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "");

  return (
    <View style={styles.page}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Comments</Text>

        <Pressable onPress={load} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Loading comments...</Text>
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>No comments found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
          {comments.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Post</Text>
                <Text style={styles.value}>
                  {c.post_title || `Post #${c.post_id}`}
                </Text>
              </View>

              {!!c.reply_to && (
                <View style={styles.row}>
                  <Text style={styles.label}>Reply to</Text>
                  <Text style={styles.value}>#{c.reply_to}</Text>
                </View>
              )}

              <View style={styles.row}>
                <Text style={styles.label}>User</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.value}>
                    {c.user_name || `User #${c.user_id || "?"}`}
                  </Text>
                  {!!c.user_email && (
                    <Text style={styles.subValue}>{c.user_email}</Text>
                  )}
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Comment</Text>
                <Text style={styles.commentText}>{c.comment}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Created</Text>
                <Text style={styles.subValue}>{fmtDate(c.created_at)}</Text>
              </View>

              <View style={styles.actions}>
                {!c.reply_to && (
                  <Pressable onPress={() => openReply(c.id)} style={styles.replyBtn}>
                    <Text style={styles.replyText}>Reply</Text>
                  </Pressable>
                )}

                <Pressable onPress={() => handleDelete(c.id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={replyOpen}
        transparent
        animationType="fade"
        onRequestClose={closeReply}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeReply}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Reply</Text>

            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Enter your reply..."
              multiline
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <Pressable onPress={closeReply} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={submitReply}
                style={[styles.modalSend, sendingReply && { opacity: 0.7 }]}
                disabled={sendingReply}
              >
                <Text style={styles.modalSendText}>
                  {sendingReply ? "Sending..." : "Send"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f9f9f9", padding: 12 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "900", color: "#9d174d" },

  refreshBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fde047" },
  refreshText: { fontSize: 12, fontWeight: "900", color: "#0f172a" },

  errorBox: { backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#fecaca", padding: 10, borderRadius: 12, marginBottom: 10 },
  errorText: { color: "#b91c1c", fontWeight: "700" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: "#64748b", marginTop: 6 },

  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
  },

  row: { flexDirection: "row", gap: 10, marginBottom: 8 },
  label: { width: 70, fontSize: 12, color: "#64748b", fontWeight: "800" },
  value: { flex: 1, fontSize: 13, fontWeight: "800", color: "#9d174d" },
  subValue: { flex: 1, fontSize: 12, color: "#64748b", marginTop: 2 },

  commentText: { flex: 1, fontSize: 13, color: "#0f172a" },

  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  replyBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fde68a" },
  replyText: { fontSize: 12, fontWeight: "900", color: "#0f172a" },

  deleteBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: "#fee2e2" },
  deleteText: { fontSize: 12, fontWeight: "900", color: "#b91c1c" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#fde047",
    padding: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#9d174d", marginBottom: 10 },
  modalInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  modalCancel: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: "#e2e8f0" },
  modalCancelText: { fontWeight: "900", color: "#0f172a" },
  modalSend: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: "#ec4899" },
  modalSendText: { fontWeight: "900", color: "#fff" },
});
