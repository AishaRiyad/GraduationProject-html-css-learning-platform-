import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  listLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  validateLessonJSON,
} from "./AdminApi";

export default function AdminLessonsMobile() {
  const [rows, setRows] = useState([]);
  const [level, setLevel] = useState("basic");
  const [form, setForm] = useState({
    title: "",
    lesson_order: 1,
    level: "basic",
    content_file: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listLessons({ level });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to load lessons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [level]);

  const onSave = async () => {
    if (!form.title) return;

    try {
      setSaving(true);

      if (form.id) {
        await updateLesson(form.id, form);
      } else {
        await createLesson(form);
      }

      setForm({ title: "", lesson_order: 1, level, content_file: "" });
      await load();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => setForm({ title: "", lesson_order: 1, level, content_file: "" });

  const onEdit = (r) => setForm(r);

  const onValidate = async (id) => {
    try {
      await validateLessonJSON(id);
      Alert.alert("Success", "JSON OK");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Validate failed.");
    }
  };

  const onDelete = (id) => {
    Alert.alert("Delete", "Delete this lesson?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLesson(id);
            await load();
          } catch (e) {
            console.error(e);
            Alert.alert("Error", e.message || "Delete failed.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Lessons (HTML)</Text>

      <View style={styles.levelRow}>
        <Pressable
          style={[styles.levelBtn, level === "basic" && styles.levelBtnActive]}
          onPress={() => setLevel("basic")}
        >
          <Text style={[styles.levelText, level === "basic" && styles.levelTextActive]}>
            basic
          </Text>
        </Pressable>

        <Pressable
          style={[styles.levelBtn, level === "advanced" && styles.levelBtnActive]}
          onPress={() => setLevel("advanced")}
        >
          <Text
            style={[
              styles.levelText,
              level === "advanced" && styles.levelTextActive,
            ]}
          >
            advanced
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create / Update</Text>

          <View style={{ gap: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={form.title}
              onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Order"
              keyboardType="numeric"
              value={String(form.lesson_order ?? 1)}
              onChangeText={(v) =>
                setForm((p) => ({ ...p, lesson_order: Number(v || 0) }))
              }
            />

            <View style={styles.levelRowInner}>
              <Pressable
                style={[
                  styles.levelBtnSmall,
                  form.level === "basic" && styles.levelBtnSmallActive,
                ]}
                onPress={() => setForm((p) => ({ ...p, level: "basic" }))}
              >
                <Text
                  style={[
                    styles.levelTextSmall,
                    form.level === "basic" && styles.levelTextSmallActive,
                  ]}
                >
                  basic
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.levelBtnSmall,
                  form.level === "advanced" && styles.levelBtnSmallActive,
                ]}
                onPress={() => setForm((p) => ({ ...p, level: "advanced" }))}
              >
                <Text
                  style={[
                    styles.levelTextSmall,
                    form.level === "advanced" && styles.levelTextSmallActive,
                  ]}
                >
                  advanced
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="content_file (e.g. basic_1.json)"
              value={form.content_file}
              onChangeText={(v) => setForm((p) => ({ ...p, content_file: v }))}
            />

            <View style={styles.row}>
              <Pressable
                style={[styles.btn, styles.btnEmerald, saving && { opacity: 0.7 }]}
                onPress={onSave}
                disabled={saving}
              >
                <Text style={styles.btnText}>{saving ? "Saving..." : "Save"}</Text>
              </Pressable>

              {form.id ? (
                <Pressable style={[styles.btn, styles.btnGray]} onPress={onCancel}>
                  <Text style={styles.btnTextDark}>Cancel</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.btn, styles.btnGray]}
                  onPress={() =>
                    setForm({ title: "", lesson_order: 1, level, content_file: "" })
                  }
                >
                  <Text style={styles.btnTextDark}>Clear</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.listHeader}>
            <Text style={styles.cardTitle}>List</Text>
            <Pressable style={[styles.btnSmall, styles.btnYellow]} onPress={load}>
              <Text style={styles.btnTextDark}>Refresh</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.muted}>Loading...</Text>
            </View>
          ) : rows.length === 0 ? (
            <Text style={styles.muted}>No lessons.</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {rows.map((r) => (
                <View key={r.id} style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{r.title}</Text>
                    <Text style={styles.itemSub}>
                      order {r.lesson_order} • {r.level} • {r.content_file}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.btnSmall, styles.btnGray]}
                      onPress={() => onEdit(r)}
                    >
                      <Text style={styles.btnTextDark}>Edit</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.btnSmall, styles.btnBlue]}
                      onPress={() => onValidate(r.id)}
                    >
                      <Text style={styles.btnText}>Validate</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.btnSmall, styles.btnRed]}
                      onPress={() => onDelete(r.id)}
                    >
                      <Text style={styles.btnText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f9f9f9", padding: 12 },
  title: { fontSize: 22, fontWeight: "900", color: "#be185d", marginBottom: 10 },

  levelRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  levelBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#fde047",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  levelBtnActive: { backgroundColor: "#fef9c3" },
  levelText: { fontWeight: "900", color: "#0f172a" },
  levelTextActive: { color: "#be185d" },

  levelRowInner: { flexDirection: "row", gap: 10 },
  levelBtnSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  levelBtnSmallActive: { backgroundColor: "#fef9c3", borderColor: "#fde047" },
  levelTextSmall: { fontWeight: "900", color: "#0f172a", fontSize: 12 },
  levelTextSmallActive: { color: "#be185d" },

  card: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fde047",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: "900", color: "#0f172a", marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  row: { flexDirection: "row", gap: 10 },

  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  btnEmerald: { backgroundColor: "#10b981" },
  btnGray: { backgroundColor: "#e2e8f0" },
  btnYellow: { backgroundColor: "#fde047" },
  btnBlue: { backgroundColor: "#3b82f6" },
  btnRed: { backgroundColor: "#ef4444" },

  btnText: { color: "#fff", fontWeight: "900", fontSize: 12 },
  btnTextDark: { color: "#0f172a", fontWeight: "900", fontSize: 12 },

  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },

  center: { alignItems: "center", justifyContent: "center", paddingVertical: 20 },
  muted: { color: "#64748b" },

  item: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  itemTitle: { fontWeight: "900", color: "#0f172a" },
  itemSub: { fontSize: 12, color: "#64748b", marginTop: 2 },

  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
});
