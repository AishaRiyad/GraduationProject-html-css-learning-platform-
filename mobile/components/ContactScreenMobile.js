import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Feather } from "@expo/vector-icons";

const ROOT = "http://10.0.2.2:5000";

export default function ContactScreenMobile({ route, navigation }) {
  const [me, setMe] = useState(null);
  const [supervisor, setSupervisor] = useState(null);
  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const messagesEndRef = useRef(null);

// جاي من NotificationsScreen لما يكبس على إشعار رسالة
const fromUserId = route?.params?.fromUserId || null;
const scrollToBottom = () => {
  try {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  } catch (e) {
    console.log("Scroll error:", e);
  }
};

// لو جاي من إشعار ومعي me، حمّل المحادثة
useEffect(() => {
  if (fromUserId && me) {
    loadSupervisorAndMessages(fromUserId);
  }
}, [fromUserId, me]);


  // ============================
  // LOAD USER WITH AUTO-FETCH
  // ============================
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return navigation.navigate("Login");

        let rawUser = await AsyncStorage.getItem("user");

        if (!rawUser) {
          const profile = await axios.get(`${ROOT}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await AsyncStorage.setItem(
            "user",
            JSON.stringify(profile.data.user)
          );
          rawUser = JSON.stringify(profile.data.user);
        }

        setMe(JSON.parse(rawUser));
      } catch (err) {
        navigation.navigate("Login");
      }
    })();
  }, []);

  /// ============================
// LOAD SUPERVISOR + MESSAGES
// ============================
useEffect(() => {
  if (!me) return;
  // لو ما في fromUserId (مش جاي من إشعار) استخدم 20 زي قبل
  const supId = fromUserId || 20;
  loadSupervisorAndMessages(supId);
}, [me, fromUserId]);

const loadSupervisorAndMessages = async (supervisorId) => {
  try {
    setLoadingMsgs(true);

    const supId = supervisorId || 20; // default

    const supRes = await axios.get(
      `${ROOT}/api/supervisor-chat/supervisor/${supId}`
    );
    setSupervisor(supRes.data.supervisor);

    const msgRes = await axios.get(
      `${ROOT}/api/supervisor-chat/messages/${supId}/${me.id}`
    );

    setMessages(msgRes.data.messages || []);
    scrollToBottom();
  } catch (e) {
    Alert.alert("Error", "Failed to load chat messages");
  } finally {
    setLoadingMsgs(false);
  }
};


  // ============================
  // SEND MESSAGE
  // ============================
  const sendMessage = async () => {
    if (!text.trim() || !supervisor) return;

    try {
      setLoadingMsgs(true);

      const res = await axios.post(`${ROOT}/api/supervisor-chat/send`, {
        sender_id: me.id,
        receiver_id: supervisor.id,
        content: text.trim(),
      });

      setMessages((prev) => [...prev, res.data.data]);
      setText("");

      setTimeout(scrollToBottom, 120);
    } catch (e) {
      Alert.alert("Error", "Message not sent");
    } finally {
      setLoadingMsgs(false);
    }
  };

  // ============================
  // EDIT + DELETE
  // ============================
  const saveEdit = async (id) => {
    try {
      await axios.put(`${ROOT}/api/supervisor-chat/message/${id}`, {
        content: editText,
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: editText } : m))
      );

      setEditingId(null);
      setEditText("");
    } catch {
      Alert.alert("Error", "Cannot update message");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`${ROOT}/api/supervisor-chat/message/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {
      Alert.alert("Error", "Delete failed");
    }
  };

  if (!me) return null;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ================= HEADER ================ */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Contact</Text>

        <View style={{ width: 30 }} /> 
      </View>

      {/* SUPERVISOR INFO */}
      <View style={styles.supervisorBox}>
        <Feather name="user" size={24} color="#b45309" />

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.supName}>
            {supervisor?.full_name || "Loading..."}
          </Text>
          <Text style={styles.supEmail}>{supervisor?.email}</Text>
        </View>
      </View>

      {/* CHAT AREA */}
      <View style={styles.chatContainer}>
        <ScrollView
          ref={messagesEndRef}
          style={styles.chatScroll}
          onContentSizeChange={scrollToBottom}
        >
          {loadingMsgs && (
            <ActivityIndicator color="#facc15" size="small" />
          )}

          {messages.map((m) => {
            const isMe = m.sender_id === me.id;
            const isEditing = editingId === m.id;

            return (
              <View
                key={m.id}
                style={[
                  styles.msgRow,
                  { justifyContent: isMe ? "flex-end" : "flex-start" },
                ]}
              >
                <View
                  style={[
                    styles.msgBubble,
                    isMe ? styles.msgMe : styles.msgThem,
                  ]}
                >
                  {isEditing ? (
                    <>
                      <TextInput
                        style={styles.editBox}
                        value={editText}
                        onChangeText={setEditText}
                        multiline
                      />

                      <View style={styles.editTools}>
                        <TouchableOpacity onPress={() => saveEdit(m.id)}>
                          <Text style={styles.btnSave}>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                        >
                          <Text style={styles.btnCancel}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.msgText}>{m.content}</Text>

                      {isMe && (
                        <View style={styles.actions}>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingId(m.id);
                              setEditText(m.content);
                            }}
                          >
                            <Text style={styles.actionBtn}>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => deleteMessage(m.id)}
                          >
                            <Text style={[styles.actionBtn, { color: "#d62828" }]}>
                              Delete
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* INPUT AREA */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Write a message..."
          value={text}
          onChangeText={setText}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            !text.trim() && { backgroundColor: "#ccc" },
          ]}
          disabled={!text.trim()}
          onPress={sendMessage}
        >
          <Feather name="send" size={20} color="#222" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fffdf3",
  },

  /* HEADER */
  header: {
    paddingTop: 55,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff8d6",
    borderBottomWidth: 1,
    borderColor: "#f5e6a7",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#b45309",
  },

  /* SUPERVISOR BOX */
  supervisorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    margin: 12,
    borderRadius: 14,
    backgroundColor: "#fff8dc",
    borderWidth: 1,
    borderColor: "#f2cf87",
  },

  supName: { fontWeight: "700", fontSize: 16, color: "#333" },
  supEmail: { fontSize: 12, color: "#666" },

  /* CHAT */
  chatContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },

  chatScroll: {
    marginTop: 10,
  },

  msgRow: {
    flexDirection: "row",
    marginVertical: 6,
  },

  msgBubble: {
    padding: 10,
    borderRadius: 14,
    maxWidth: "75%",
  },

  msgMe: {
    backgroundColor: "#ffe58f",
    borderWidth: 1,
    borderColor: "#f3d36c",
  },

  msgThem: {
    backgroundColor: "#f2f2f2",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  msgText: { color: "#333", fontSize: 14 },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 12,
  },

  actionBtn: { fontSize: 12, color: "#444" },

  editBox: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  editTools: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
    gap: 12,
  },

  btnSave: { color: "#b45309", fontWeight: "700" },
  btnCancel: { color: "#777" },

  /* INPUT AREA */
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#f5e6a7",
    backgroundColor: "#fffbed",
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "#facc15",
    padding: 12,
    borderRadius: 100,
    elevation: 2,
  },
});
