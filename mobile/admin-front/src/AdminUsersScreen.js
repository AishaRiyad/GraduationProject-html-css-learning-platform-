import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  patchUserRole,
  patchUserStatus,
  resetUserPassword,
} from "./AdminApi";

const empty = { id: null, name: "", email: "", role: "student", level: "basic", active: 1 };

const ROLES = ["student", "supervisor", "admin", "teacher"];
const LEVELS = ["basic", "advanced"];

export default function AdminUsersScreen() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");

  const [details, setDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await listUsers({ search: q, role, level });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      const msg = e.message || "Failed to load users";
      setErr(msg);
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm({ ...empty });
    setModal(true);
  }

  function openEdit(u) {
    setForm({
      id: u.id,
      name: u.name || "",
      email: u.email || "",
      role: u.role || "student",
      level: u.level || "basic",
      active: Number(u.active) ? 1 : 0,
    });
    setModal(true);
  }

  async function save() {
    setErr("");
    try {
      if (!form.name?.trim() || !form.email?.trim()) {
        Alert.alert("Validation", "Name and Email are required.");
        return;
      }

      if (form.id) {
        await updateUser(form.id, form);
      } else {
        await createUser({ ...form, password: "admin123" });
      }
      setModal(false);
      await load();
    } catch (e) {
      console.error(e);
      const msg = e.message || "Save failed";
      setErr(msg);
      Alert.alert("Error", msg);
    }
  }

  function remove(id) {
    Alert.alert("Delete user?", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(id);
            await load();
          } catch (e) {
            console.error(e);
            Alert.alert("Error", e.message || "Delete failed");
          }
        },
      },
    ]);
  }

  async function toggleRole(u) {
    const newRole = u.role === "student" ? "supervisor" : "student";
    try {
      await patchUserRole(u.id, newRole);
      await load();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Role update failed");
    }
  }

  async function deactivate(u) {
    try {
      await patchUserStatus(u.id, 0);
      await load();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Status update failed");
    }
  }

  async function doReset(u) {
    try {
      const x = await resetUserPassword(u.id);
      const val = x?.new_password || x?.token || "(server returned no value)";
      Alert.alert("Temporary Password", `${u.email}\n\n${val}`);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Reset failed");
    }
  }

  async function openDetails(userId) {
    try {
      const d = await getUser(userId);
      setDetails(d);
      setDetailsOpen(true);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Failed to load details");
    }
  }

  const fmt = (d) => (d ? String(d).replace("T", " ").slice(0, 19) : "-");

  const filteredCount = useMemo(() => rows.length, [rows]);

  return (
    <View style={styles.page}>
      <Text style={styles.h1}>Users</Text>

      {err ? <Text style={styles.errBox}>{err}</Text> : null}

      {/* Filters */}
      <View style={styles.filtersCard}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search name/email"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <View style={styles.row}>
          <PickerLike
            label={role ? `Role: ${role}` : "All roles"}
            options={["", ...ROLES]}
            value={role}
            onChange={setRole}
          />
          <PickerLike
            label={level ? `Level: ${level}` : "All levels"}
            options={["", ...LEVELS]}
            value={level}
            onChange={setLevel}
          />
        </View>

        <View style={styles.row}>
          <Pressable style={[styles.btn, styles.btnEmerald]} onPress={load}>
            <Text style={styles.btnText}>Filter</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={openCreate}>
            <Text style={styles.btnText}>+ New</Text>
          </Pressable>
        </View>

        <Text style={styles.countText}>Results: {filteredCount}</Text>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ paddingTop: 10 }}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8, color: "#64748b" }}>Loading…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {rows.map((r) => (
            <View key={r.id} style={styles.userCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{r.name || "(no name)"}</Text>
                <Text style={styles.sub}>{r.email}</Text>

                <View style={styles.badgesRow}>
                  <Badge text={r.role || "-"} />
                  <Badge text={r.level || "-"} tone="blue" />
                  <Badge text={Number(r.active) ? "active" : "inactive"} tone={Number(r.active) ? "green" : "gray"} />
                </View>

                <Text style={styles.meta}>
                  Last login: {r.last_login ? fmt(r.last_login) : "-"}
                </Text>
              </View>

              <View style={styles.actions}>
                <ActionBtn label="Details" onPress={() => openDetails(r.id)} />
                <ActionBtn label="Toggle Role" onPress={() => toggleRole(r)} />
                <ActionBtn label="Deactivate" onPress={() => deactivate(r)} />
                <ActionBtn label="Reset PW" onPress={() => doReset(r)} />
                <ActionBtn label="Edit" onPress={() => openEdit(r)} />
                <ActionBtn label="Delete" danger onPress={() => remove(r.id)} />
              </View>
            </View>
          ))}

          {!rows.length && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No users found.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Create/Edit Modal */}
      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{form.id ? "Edit user" : "Create user"}</Text>

            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder="Name"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
            <TextInput
              value={form.email}
              onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <PickerLike
                label={`Role: ${form.role}`}
                options={ROLES}
                value={form.role}
                onChange={(v) => setForm((p) => ({ ...p, role: v }))}
              />
              <PickerLike
                label={`Level: ${form.level}`}
                options={LEVELS}
                value={form.level}
                onChange={(v) => setForm((p) => ({ ...p, level: v }))}
              />
            </View>

            <Pressable
              onPress={() => setForm((p) => ({ ...p, active: p.active ? 0 : 1 }))}
              style={[styles.checkRow, form.active ? styles.checkOn : styles.checkOff]}
            >
              <Text style={styles.checkText}>{form.active ? "✓ Active" : "○ Active"}</Text>
            </Pressable>

            <View style={styles.row}>
              <Pressable style={[styles.btn, styles.btnEmerald]} onPress={save}>
                <Text style={styles.btnText}>Save</Text>
              </Pressable>
              <Pressable style={styles.btn} onPress={() => setModal(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
            </View>

            {!form.id ? (
              <Text style={styles.hint}>
                New user default password: <Text style={{ fontWeight: "900" }}>admin123</Text>
              </Text>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Details Modal */}
      <Modal visible={detailsOpen} transparent animationType="fade" onRequestClose={() => setDetailsOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setDetailsOpen(false)}>
          <Pressable style={styles.modalCardLarge} onPress={() => {}}>
            <Text style={styles.modalTitle}>User Details</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              <Text style={styles.jsonText}>
                {JSON.stringify(details, null, 2)}
              </Text>
            </ScrollView>
            <Pressable style={[styles.btn, { alignSelf: "flex-end" }]} onPress={() => setDetailsOpen(false)}>
              <Text style={styles.btnText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ActionBtn({ label, onPress, danger }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionBtn, danger ? styles.actionDanger : null]}>
      <Text style={[styles.actionText, danger ? styles.actionTextDanger : null]}>{label}</Text>
    </Pressable>
  );
}

function Badge({ text, tone = "pink" }) {
  const s =
    tone === "green"
      ? styles.badgeGreen
      : tone === "blue"
      ? styles.badgeBlue
      : tone === "gray"
      ? styles.badgeGray
      : styles.badgePink;

  return (
    <View style={[styles.badge, s]}>
      <Text style={styles.badgeText}>{String(text)}</Text>
    </View>
  );
}

/**
 * Simple "picker-like" control without external libs:
 * press cycles options (good enough and keeps dependencies zero).
 * If you want real Picker dropdown, tell me and I switch it to @react-native-picker/picker.
 */
function PickerLike({ label, options, value, onChange }) {
  function next() {
    const i = options.findIndex((x) => String(x) === String(value));
    const nxt = options[(i + 1) % options.length];
    onChange(nxt);
  }

  return (
    <Pressable onPress={next} style={styles.pickerLike}>
      <Text style={styles.pickerText}>{label}</Text>
      <Text style={styles.pickerHint}>tap</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff7ed", padding: 14 },
  h1: { fontSize: 20, fontWeight: "900", color: "#be185d", marginBottom: 10 },

  errBox: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
  },

  filtersCard: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fde047",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
  },

  row: { flexDirection: "row", gap: 10 },

  btn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  btnEmerald: {
    backgroundColor: "#d1fae5",
    borderColor: "#6ee7b7",
  },
  btnText: { fontWeight: "800", color: "#0f172a" },

  countText: { fontSize: 12, color: "#64748b" },

  userCard: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fde047",
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: "row",
    gap: 10,
  },

  name: { fontSize: 15, fontWeight: "900", color: "#9d174d" },
  sub: { fontSize: 12, color: "#334155", marginTop: 2 },
  meta: { marginTop: 6, fontSize: 11, color: "#64748b" },

  badgesRow: { flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "800", color: "#0f172a" },
  badgePink: { backgroundColor: "#fce7f3", borderColor: "#f9a8d4" },
  badgeGreen: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  badgeBlue: { backgroundColor: "#dbeafe", borderColor: "#93c5fd" },
  badgeGray: { backgroundColor: "#f1f5f9", borderColor: "#cbd5e1" },

  actions: { width: 110, gap: 6, alignSelf: "flex-start" },
  actionBtn: {
    backgroundColor: "#fef9c3",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  actionText: { fontSize: 11, fontWeight: "900", color: "#0f172a" },
  actionDanger: { backgroundColor: "#fee2e2", borderColor: "#fecaca" },
  actionTextDanger: { color: "#b91c1c" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    padding: 14,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fde047",
    padding: 12,
    gap: 10,
  },
  modalCardLarge: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fde047",
    padding: 12,
    gap: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: "900", color: "#9d174d" },

  pickerLike: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  pickerText: { fontSize: 12, fontWeight: "800", color: "#0f172a" },
  pickerHint: { fontSize: 10, color: "#94a3b8", marginTop: 2 },

  checkRow: {
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  checkOn: { backgroundColor: "#dcfce7", borderColor: "#86efac" },
  checkOff: { backgroundColor: "#f1f5f9", borderColor: "#cbd5e1" },
  checkText: { fontWeight: "900", color: "#0f172a" },

  hint: { fontSize: 11, color: "#64748b" },
  jsonText: { fontFamily: "monospace", fontSize: 12, color: "#0f172a" },

  emptyBox: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fde047",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  emptyText: { color: "#64748b", fontWeight: "800" },
});
