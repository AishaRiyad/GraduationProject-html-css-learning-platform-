import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import axios from "axios";
import { io } from "socket.io-client";

const API = "http://10.0.2.2:5000";
const socket = io(API);

export default function SupervisorMessagesMobile({ supervisorId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [showStudentList, setShowStudentList] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollToEnd({ animated: true });
  };

  // ---------------- Fetch Students ----------------
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(
        `${API}/api/supervisor-chat/students?supervisorId=${supervisorId}`
      );
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("fetchStudents error:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ---------------- Fetch Messages ----------------
  const fetchMessages = async (studentId) => {
    try {
      setLoadingMessages(true);
      const res = await axios.get(
        `${API}/api/supervisor-chat/messages/${supervisorId}/${studentId}`
      );
      setMessages(res.data.messages || []);

      await axios.post(`${API}/api/supervisor-chat/read`, {
        supervisorId,
        studentId,
      });
    } catch (err) {
      console.error("fetchMessages error:", err);
    } finally {
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 200);
    }
  };

  // ---------------- Select Student ----------------
  const openChat = (student) => {
    setSelectedStudent(student);
    setShowStudentList(false);
    fetchMessages(student.id);
    setText("");
  };

  // ---------------- Socket Listener ----------------
  useEffect(() => {
    socket.emit("register", supervisorId);

    const receiveMessage = (msg) => {
      if (
        selectedStudent &&
        ((msg.sender_id === selectedStudent.id &&
          msg.receiver_id === supervisorId) ||
          (msg.sender_id === supervisorId &&
            msg.receiver_id === selectedStudent.id))
      ) {
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToBottom, 200);
      }
    };

    socket.on("receive_message", receiveMessage);

    return () => {
      socket.off("receive_message", receiveMessage);
    };
  }, [selectedStudent]);

  // ---------------- Send Message ----------------
  const sendMessage = async () => {
    if (!text.trim() || !selectedStudent) return;

    const payload = {
      sender_id: supervisorId,
      receiver_id: selectedStudent.id,
      content: text.trim(),
    };

    setMessages((prev) => [...prev, payload]);
    scrollToBottom();
    setText("");

    try {
      const res = await axios.post(`${API}/api/supervisor-chat/send`, payload);
      socket.emit("send_message", res.data.data);
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  };

  return (
    <View style={styles.wrapper}>

      {/* TOP HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>

        <TouchableOpacity onPress={() => setShowStudentList(true)}>
          <Text style={styles.headerBtn}>Students ▾</Text>
        </TouchableOpacity>
      </View>

      {/* MAIN CHAT AREA */}
      <View style={styles.chatBox}>
        {!selectedStudent ? (
          <View style={styles.center}>
            <Text style={{ color: "#999" }}>Select a student to chat.</Text>
          </View>
        ) : (
          <>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <Image
                source={
                  selectedStudent.photo_url
                    ? { uri: `http://10.0.2.2:5000${selectedStudent.photo_url}` }
                    : require("../assets/user-avatar.jpg")
                }
                style={styles.avatar}
              />
              <View>
                <Text style={styles.studentName}>{selectedStudent.full_name}</Text>
                <Text style={styles.studentEmail}>{selectedStudent.email}</Text>
              </View>
            </View>

            {/* Messages */}
            <ScrollView ref={messagesEndRef} style={styles.messagesBox}>
              {loadingMessages ? (
                <ActivityIndicator size="large" color="#facc15" />
              ) : (
                messages.map((m, i) => {
                  const isMe = m.sender_id === supervisorId;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.msgBubble,
                        isMe ? styles.msgRight : styles.msgLeft,
                      ]}
                    >
                      <Text>{m.content}</Text>
                    </View>
                  );
                })
              )}

              {typing && (
                <Text style={styles.typingText}>
                  {selectedStudent.full_name} is typing...
                </Text>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Type a message..."
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* MODAL: STUDENT LIST */}
      <Modal visible={showStudentList} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Students</Text>

            {loadingStudents ? (
              <ActivityIndicator size="large" color="#facc15" />
            ) : (
              <ScrollView style={{ maxHeight: "85%" }}>
                {students.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.modalRow}
                    onPress={() => openChat(s)}
                  >
                    <Image
                      source={
                        s.photo_url
                          ? { uri: `http://10.0.2.2:5000${s.photo_url}` }
                          : require("../assets/user-avatar.jpg")
                      }
                      style={styles.avatar}
                    />
                    <View>
                      <Text style={styles.studentName}>{s.full_name}</Text>
                      <Text style={styles.studentEmail}>{s.email}</Text>
                    </View>

                    {s.unread_count > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{s.unread_count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowStudentList(false)}
            >
              <Text style={{ fontWeight: "700", color: "#333" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------------------- STYLES ------------------------------ */

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFFDF5",
  },

  header: {
    padding: 15,
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerBtn: { fontSize: 16, color: "#FACC15", fontWeight: "700" },

  chatBox: {
    flex: 1,
    padding: 12,
    backgroundColor: "white",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },

  messagesBox: { flex: 1 },

  msgBubble: {
    padding: 10,
    borderRadius: 16,
    marginVertical: 6,
    maxWidth: "75%",
  },
  msgLeft: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
  },
  msgRight: {
    backgroundColor: "#FDE047",
    alignSelf: "flex-end",
  },

  typingText: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#EEE",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#FACC15",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
  },
  sendText: { fontWeight: "700" },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  badge: {
    backgroundColor: "red",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: "auto",
  },
  badgeText: { color: "white", fontSize: 11 },

  closeBtn: {
    marginTop: 12,
    alignSelf: "center",
    padding: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 50,
    marginRight: 10,
  },
  studentName: { fontWeight: "700", fontSize: 14 },
  studentEmail: { fontSize: 11, color: "#777" },
});
