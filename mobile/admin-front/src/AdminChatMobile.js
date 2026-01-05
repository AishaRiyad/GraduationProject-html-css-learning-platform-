import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { getSocket } from "./socket";

const ROOT = "http://10.0.2.2:5000";
const API = `${ROOT}/api/chat`;

function pickExtFromMime(mime) {
  const m = String(mime || "").toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("mp4")) return "mp4";
  if (m.includes("wav")) return "wav";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  if (m.includes("aac")) return "aac";
  if (m.includes("m4a")) return "m4a";
  return "m4a";
}

async function authHeaders(extra) {
  const t = await AsyncStorage.getItem("token");
  const token = t ? (t.startsWith("Bearer ") ? t : `Bearer ${t}`) : null;
  return { ...(extra || {}), ...(token ? { Authorization: token } : {}) };
}

function mimeFromName(name) {
  const n = String(name || "").toLowerCase();
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".gif")) return "image/gif";
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".mp3")) return "audio/mpeg";
  if (n.endsWith(".wav")) return "audio/wav";
  if (n.endsWith(".m4a")) return "audio/m4a";
  if (n.endsWith(".aac")) return "audio/aac";
  return "application/octet-stream";
}

export default function AdminChatMobile({ navigation, route }) {
  const [partners, setPartners] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [onlineMap, setOnlineMap] = useState({});
  const [file, setFile] = useState(null);

  const activePartnerRef = useRef(null);
  const scrollRef = useRef(null);

  const partnerFromNotif = route?.params?.partner
    ? Number(route.params.partner)
    : null;

  const canEditMsg = (m) =>
    !m?.file_url && String(m?.message_type || "text") === "text";

  useEffect(() => {
    activePartnerRef.current = activePartner;
  }, [activePartner]);

  useEffect(() => {
    loadPartners();
  }, []);

  useEffect(() => {
    if (!partnerFromNotif) return;
    if (!partners || partners.length === 0) return;
    openThread(partnerFromNotif);
  }, [partners, partnerFromNotif]);

 
  useEffect(() => {
    let s = null;

    (async () => {
      s = await getSocket();
      if (!s) return;

      const onNewMessage = (msg) => {
        const partner = activePartnerRef.current;
        if (!partner) return;

        const isWithActive =
          msg.sender_id === partner.id || msg.receiver_id === partner.id;
        if (!isWithActive) return;

        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      };

      const onBulk = ({ onlineUserIds }) => {
        setOnlineMap(() => {
          const map = {};
          (onlineUserIds || []).forEach((id) => {
            map[id] = true;
          });
          return map;
        });
      };

      const onUpdate = ({ userId, online }) => {
        setOnlineMap((prev) => ({ ...prev, [userId]: online }));
      };

      const onMsgDeleted = ({ id }) => {
        if (!id) return;
        setMessages((prev) => prev.filter((m) => Number(m.id) !== Number(id)));
        if (Number(editingId) === Number(id)) {
          setEditingId(null);
          setText("");
          setFile(null);
        }
      };

      try {
        s.off("chat:newMessage");
        s.off("presence:bulk");
        s.off("presence:update");
        s.off("chat:messageDeleted");
      } catch {}

      s.on("chat:newMessage", onNewMessage);
      s.on("presence:bulk", onBulk);
      s.on("presence:update", onUpdate);
      s.on("chat:messageDeleted", onMsgDeleted);

      s.__adminChatHandlers = { onNewMessage, onBulk, onUpdate, onMsgDeleted };
    })();

    return () => {
      try {
        if (!s) return;
        const h = s.__adminChatHandlers;
        if (!h) return;

        s.off("chat:newMessage", h.onNewMessage);
        s.off("presence:bulk", h.onBulk);
        s.off("presence:update", h.onUpdate);
        s.off("chat:messageDeleted", h.onMsgDeleted);

        s.__adminChatHandlers = null;
      } catch {}
    };
  }, [editingId]);

  async function loadPartners() {
    try {
      const r = await fetch(`${API}/partners`, { headers: await authHeaders() });
      if (!r.ok) throw new Error(`partners HTTP ${r.status}`);
      const data = await r.json();
      setPartners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load users for chat.");
    }
  }

  async function openThread(userId) {
    setLoadingMsgs(true);
    setEditingId(null);
    setText("");
    setFile(null);

    try {
      const r = await fetch(`${API}/thread/${userId}`, {
        headers: await authHeaders(),
      });
      if (!r.ok) throw new Error(`thread HTTP ${r.status}`);
      const data = await r.json();
      const arr = Array.isArray(data) ? data : [];

      const seen = new Set();
      const unique = [];
      for (const m of arr) {
        if (!m || seen.has(m.id)) continue;
        seen.add(m.id);
        unique.push(m);
      }
      setMessages(unique);

      const p = partners.find((x) => x.id === userId) || null;
      setActivePartner(p);

      fetch(`${API}/thread/${userId}/read`, {
        method: "POST",
        headers: await authHeaders({ "Content-Type": "application/json" }),
      }).catch(() => {});
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to load messages.");
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 50);
    }
  }

  function startEdit(msg) {
    if (!canEditMsg(msg)) return;
    setEditingId(msg.id);
    setText(msg.body || "");
    setFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setText("");
    setFile(null);
  }

  async function handleDelete(messageId) {
    Alert.alert("Delete", "Delete this message?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const r = await fetch(`${API}/messages/${messageId}`, {
              method: "DELETE",
              headers: await authHeaders(),
            });
            if (!r.ok) throw new Error(`delete HTTP ${r.status}`);
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            if (editingId === messageId) {
              setEditingId(null);
              setText("");
              setFile(null);
            }
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to delete message.");
          }
        },
      },
    ]);
  }

  async function pickFile() {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ["*/*"],
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      const name = asset.name || `file_${Date.now()}`;
      const type = asset.mimeType || mimeFromName(name);

      setFile({ uri: asset.uri, name, type });
    } catch (e) {
      console.error(e);
    }
  }

  async function removeFile() {
    setFile(null);
  }

  const [recording, setRecording] = useState(null);

  async function startRecord() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission", "Mic permission required.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Mic permission required.");
    }
  }

  async function stopRecord() {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const mime = "audio/m4a";
      const ext = pickExtFromMime(mime);
      const name = `voice_${Date.now()}.${ext}`;

      if (uri) setFile({ uri, name, type: mime });
    } catch (e) {
      console.error(e);
    } finally {
      setRecording(null);
    }
  }

  async function handleSubmit() {
    if (!activePartner) return;

    const bodyText = text.trim();
    if (!bodyText && !file) return;

    if (editingId) {
      try {
        const r = await fetch(`${API}/messages/${editingId}`, {
          method: "PUT",
          headers: await authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ body: bodyText }),
        });
        if (!r.ok) throw new Error(`update HTTP ${r.status}`);
        const updated = await r.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
        setEditingId(null);
        setText("");
        setFile(null);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to update message.");
      }
      return;
    }

    try {
      let r;

      if (file) {
        const fd = new FormData();
        fd.append("body", bodyText);
        fd.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.type || "application/octet-stream",
        });

        r = await fetch(`${API}/thread/${activePartner.id}`, {
          method: "POST",
          headers: await authHeaders(),
          body: fd,
        });
      } else {
        r = await fetch(`${API}/thread/${activePartner.id}`, {
          method: "POST",
          headers: await authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ body: bodyText }),
        });
      }

      if (!r.ok) throw new Error(`send HTTP ${r.status}`);
      const msg = await r.json();

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      setText("");
      setFile(null);

      setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 50);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to send message.");
    }
  }

  const students = partners.filter((p) => p.role === "student");
  const supervisors = partners.filter((p) => p.role === "supervisor");

  function PartnerRow({ p }) {
    const isActive = activePartner?.id === p.id;
    const isOnline = onlineMap[p.id];

    return (
      <Pressable
        onPress={() => openThread(p.id)}
        style={[styles.partnerBtn, isActive && styles.partnerBtnActive]}
      >
        <View style={{ flex: 1 }}>
          <View style={styles.partnerTop}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isOnline ? "#22c55e" : "#cbd5e1" },
              ]}
            />
            <Text
              style={[styles.partnerName, isActive && { color: "#831843" }]}
              numberOfLines={1}
            >
              {p.name}
            </Text>
          </View>
          <Text style={styles.partnerEmail} numberOfLines={1}>
            {p.email}
          </Text>
        </View>

        <Text
          style={[
            styles.partnerStatus,
            { color: isOnline ? "#16a34a" : "#94a3b8" },
          ]}
        >
          {isOnline ? "Active now" : "Offline"}
        </Text>
      </Pressable>
    );
  }

  function renderMessageContent(msg) {
    const fileSrc = msg.file_url ? `${ROOT}${msg.file_url}` : null;

    if (msg.message_type === "image" && fileSrc) {
      return <Image source={{ uri: fileSrc }} style={styles.msgImage} />;
    }

    if (msg.message_type === "audio" && fileSrc) {
      return <AudioPlayer uri={fileSrc} />;
    }

    if (msg.message_type === "file" && fileSrc) {
      return (
        <Pressable
          onPress={() => Linking.openURL(fileSrc)}
          style={styles.fileLink}
        >
          <Text style={styles.fileLinkText}>
            {msg.file_name || "Download file"}
          </Text>
        </Pressable>
      );
    }

    return <Text style={styles.msgText}>{msg.body}</Text>;
  }

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Chat</Text>

      <View style={styles.layout}>
        <View style={styles.sidebar}>
          <Text style={styles.sectionLabel}>Students</Text>
          <ScrollView style={styles.partnerList}>
            {students.map((p) => (
              <PartnerRow key={p.id} p={p} />
            ))}
            {students.length === 0 && (
              <Text style={styles.emptySmall}>No students available.</Text>
            )}
          </ScrollView>

          <Text style={[styles.sectionLabel, { marginTop: 10 }]}>
            Supervisors
          </Text>
          <ScrollView style={styles.partnerList}>
            {supervisors.map((p) => (
              <PartnerRow key={p.id} p={p} />
            ))}
            {supervisors.length === 0 && (
              <Text style={styles.emptySmall}>No supervisors available.</Text>
            )}
          </ScrollView>
        </View>

        <View style={styles.chatPane}>
          {activePartner ? (
            <>
              <View style={styles.threadHeader}>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text style={styles.threadName}>{activePartner.name}</Text>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: onlineMap[activePartner.id]
                            ? "#22c55e"
                            : "#cbd5e1",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.threadEmail}>{activePartner.email}</Text>
                  <Text style={styles.threadStatus}>
                    {onlineMap[activePartner.id]
                      ? "Active now"
                      : "Last seen earlier"}
                  </Text>
                </View>
              </View>

              <ScrollView
                ref={scrollRef}
                style={styles.messages}
                contentContainerStyle={{ paddingBottom: 10 }}
                onContentSizeChange={() =>
                  scrollRef.current?.scrollToEnd?.({ animated: true })
                }
              >
                {loadingMsgs && (
                  <View style={{ paddingVertical: 10 }}>
                    <ActivityIndicator />
                    <Text style={styles.loadingText}>Loading messages…</Text>
                  </View>
                )}

                {messages.map((msg) => {
                  const isPartner = msg.sender_id === activePartner.id;
                  const isMine = !isPartner;
                  const showEdit = isMine && canEditMsg(msg);

                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.msgRow,
                        {
                          justifyContent: isPartner
                            ? "flex-start"
                            : "flex-end",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.bubble,
                          isPartner
                            ? styles.bubblePartner
                            : styles.bubbleMine,
                        ]}
                      >
                        {renderMessageContent(msg)}

                        <Text style={styles.msgTime}>
                          {msg.created_at
                            ? new Date(msg.created_at).toLocaleString()
                            : ""}
                        </Text>

                        {isMine && (
                          <View style={styles.msgActions}>
                            {showEdit && (
                              <Pressable onPress={() => startEdit(msg)}>
                                <Text style={styles.actionLink}>Edit</Text>
                              </Pressable>
                            )}
                            <Pressable onPress={() => handleDelete(msg.id)}>
                              <Text
                                style={[
                                  styles.actionLink,
                                  { color: "#ef4444" },
                                ]}
                              >
                                Delete
                              </Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}

                {messages.length === 0 && !loadingMsgs && (
                  <Text style={styles.emptyBig}>
                    No messages yet. Start the conversation 👋
                  </Text>
                )}
              </ScrollView>

              <View style={styles.composer}>
                <View style={styles.inputRow}>
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder={editingId ? "Edit your message…" : "Type a message…"}
                    style={styles.input}
                  />

                  <Pressable onPress={pickFile} style={styles.smallBtn}>
                    <Text style={styles.smallBtnText}>File</Text>
                  </Pressable>

                  <Pressable
                    onPress={recording ? stopRecord : startRecord}
                    style={styles.smallBtn}
                  >
                    <Text style={styles.smallBtnText}>
                      {recording ? "Stop" : "Record"}
                    </Text>
                  </Pressable>

                  {!!file && (
                    <Pressable
                      onPress={removeFile}
                      style={[styles.smallBtn, styles.removeBtn]}
                    >
                      <Text style={[styles.smallBtnText, { color: "#ef4444" }]}>
                        Remove
                      </Text>
                    </Pressable>
                  )}
                </View>

                {!!file && (
                  <Text style={styles.fileInfo} numberOfLines={1}>
                    Selected: <Text style={{ fontWeight: "800" }}>{file.name}</Text>
                  </Text>
                )}

                <View style={styles.sendRow}>
                  {editingId && (
                    <Pressable onPress={cancelEdit} style={styles.cancelBtn}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                  )}

                  <Pressable onPress={handleSubmit} style={styles.sendBtn}>
                    <Text style={styles.sendText}>
                      {editingId ? "Save" : "Send"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyPane}>
              <Text style={styles.emptyBig}>
                Select a student or supervisor on the left to start chatting.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function AudioPlayer({ uri }) {
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      try {
        sound?.unloadAsync?.();
      } catch {}
    };
  }, [sound]);

  async function toggle() {
    try {
      if (!sound) {
        const { sound: s } = await Audio.Sound.createAsync({ uri });
        setSound(s);
        await s.playAsync();
        setPlaying(true);

        s.setOnPlaybackStatusUpdate((st) => {
          if (!st?.isLoaded) return;
          if (st.didJustFinish) setPlaying(false);
        });
        return;
      }

      const st = await sound.getStatusAsync();
      if (st.isPlaying) {
        await sound.pauseAsync();
        setPlaying(false);
      } else {
        await sound.playAsync();
        setPlaying(true);
      }
    } catch {}
  }

  return (
    <Pressable onPress={toggle} style={styles.audioBtn}>
      <Text style={styles.audioText}>{playing ? "Pause ▶" : "Play ▶"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f9f9f9", padding: 12 },
  title: { fontSize: 22, fontWeight: "900", color: "#be185d", marginBottom: 10 },

  layout: { flex: 1, flexDirection: "row", gap: 10 },
  sidebar: {
    width: 160,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#be185d",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  partnerList: { maxHeight: "42%" },

  partnerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 6,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  partnerBtnActive: {
    backgroundColor: "#fce7f3",
    borderColor: "#fbcfe8",
  },
  partnerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  dot: { width: 8, height: 8, borderRadius: 999 },
  partnerName: { fontSize: 12, fontWeight: "700", color: "#0f172a", flexShrink: 1 },
  partnerEmail: { fontSize: 10, color: "#64748b" },
  partnerStatus: { fontSize: 10, fontWeight: "700" },
  emptySmall: { fontSize: 11, color: "#64748b", marginTop: 6 },

  chatPane: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 10,
  },

  threadHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
    marginBottom: 8,
  },
  threadName: { fontSize: 14, fontWeight: "900", color: "#be185d" },
  threadEmail: { fontSize: 11, color: "#64748b", marginTop: 2 },
  threadStatus: { fontSize: 11, marginTop: 4, color: "#64748b" },

  messages: { flex: 1, marginBottom: 10 },
  loadingText: { textAlign: "center", color: "#64748b", marginTop: 6 },

  msgRow: { flexDirection: "row", marginBottom: 8 },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubblePartner: { backgroundColor: "#f1f5f9" },
  bubbleMine: { backgroundColor: "#fbcfe8" },
  msgText: { color: "#0f172a" },
  msgTime: { marginTop: 6, fontSize: 10, color: "#64748b" },
  msgActions: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  actionLink: { fontSize: 11, color: "#475569", textDecorationLine: "underline" },

  msgImage: { width: 220, height: 160, borderRadius: 12, backgroundColor: "#fff" },
  fileLink: { paddingVertical: 6 },
  fileLinkText: { textDecorationLine: "underline", color: "#0f172a" },

  audioBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#e2e8f0",
    alignSelf: "flex-start",
  },
  audioText: { fontSize: 12, fontWeight: "800", color: "#0f172a" },

  emptyBig: { textAlign: "center", marginTop: 20, color: "#64748b" },
  emptyPane: { flex: 1, alignItems: "center", justifyContent: "center" },

  composer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
  },
  smallBtnText: { fontSize: 11, fontWeight: "800", color: "#0f172a" },
  removeBtn: { backgroundColor: "#fee2e2" },

  fileInfo: {
    marginTop: 6,
    fontSize: 11,
    color: "#475569",
    paddingHorizontal: 4,
  },

  sendRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
  },
  cancelText: { fontSize: 12, fontWeight: "800", color: "#0f172a" },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ec4899",
  },
  sendText: { fontSize: 12, fontWeight: "900", color: "#fff" },
});
