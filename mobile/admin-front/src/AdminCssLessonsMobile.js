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
  listCssLessons,
  createCssLesson,
  deleteCssLesson,
  validateCssJSON,
} from "./AdminApi";

export default function AdminCssLessonsMobile() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    title: "",
    order_index: 1,
    json_path: "css_1.json",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await listCssLessons();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to load CSS lessons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async () => {
    if (!form.title) return;

    try {
      setSaving(true);
      await createCssLesson(form);
      setForm({ title: "", order_index: 1, json_path: "css_1.json" });
      await load();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (r) => setForm(r);

  const onValidate = async (id) => {
    try {
      await validateCssJSON(id);
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
            await deleteCssLesson(id);
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
      <Text style={styles.title}>CSS Lessons</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create / Update</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={form.title}
              onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Order index"
              keyboardType="numeric"
              value={String(form.order_index ?? 1)}
              onChangeText={(v) =>
                setForm((p) => ({
                  ...p,
                  order_index: Number(v || 0),
                }))
              }
            />

            <TextInput
              style={styles.input}
              placeholder="json_path (e.g. css_1.json)"
              value={form.json_path}
              onChangeText={(v) => setForm((p) => ({ ...p, json_path: v }))}
            />

            <View style={styles.row}>
              <Pressable
                style={[styles.btn, styles.btnEmerald, saving && { opacity: 0.7 }]}
                onPress={onSave}
                disabled={saving}
              >
                <Text style={styles.btnText}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.btn, styles.btnGray]}
                onPress={() =>
                  setForm({ title: "", order_index: 1, json_path: "css_1.json" })
                }
              >
                <Text style={styles.btnTextDark}>Clear</Text>
              </Pressable>
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
            <Text style={styles.muted}>No CSS lessons.</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {rows.map((r) => (
                <View key={r.id} style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{r.title}</Text>
                    <Text style={styles.itemSub}>
                      order {r.order_index} • {r.json_path}
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

  card: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fde047",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: "900", color: "#0f172a", marginBottom: 10 },

  form: { gap: 10 },
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
