import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";

import {
  adminListQuizLevels as listLevels,
  adminCreateQuizLevel as createLevel,
  adminUpdateQuizLevel as updateLevel,
  adminDeleteQuizLevel as deleteLevel,
  adminListQuestions as listQuestions,
  adminCreateQuestion as createQuestion,
  adminUpdateQuestion as updateQuestion,
  adminDeleteQuestion as deleteQuestion,
} from "./AdminQuizzesApi";

const emptyLevel = { id: null, level_number: 1, title: "", description: "", pass_threshold: 6 };

const emptyQ = {
  id: null,
  q_type: "MC",
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "a",
  tf_answer: 1,
  explanation: "",
};

function SegBtn({ active, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segBtn,
        active ? styles.segBtnActive : null,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.segText, active ? styles.segTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function RowBtn({ variant = "default", label, onPress, disabled }) {
  const v =
    variant === "danger"
      ? [styles.btn, styles.btnDanger]
      : variant === "primary"
      ? [styles.btn, styles.btnPrimary]
      : [styles.btn, styles.btnDefault];

  const t =
    variant === "danger"
      ? styles.btnDangerText
      : variant === "primary"
      ? styles.btnPrimaryText
      : styles.btnDefaultText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        ...v,
        disabled ? { opacity: 0.6 } : null,
        pressed && !disabled ? { opacity: 0.8 } : null,
      ]}
    >
      <Text style={t}>{label}</Text>
    </Pressable>
  );
}

export default function AdminQuizzesMobile() {
  const [topic, setTopic] = useState("html");
  const [levels, setLevels] = useState([]);
  const [selected, setSelected] = useState(null);

  const [levelForm, setLevelForm] = useState({ ...emptyLevel });
  const [qs, setQs] = useState([]);
  const [qForm, setQForm] = useState({ ...emptyQ });

  const [saving, setSaving] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingQs, setLoadingQs] = useState(false);
  const [err, setErr] = useState("");

  async function loadLevels() {
    setErr("");
    setLoadingLevels(true);
    try {
      const data = await listLevels(topic);
      const arr = Array.isArray(data) ? data : [];
      setLevels(arr);

      if (selected) {
        const f = arr.find((l) => l.id === selected.id);
        if (!f) {
          setSelected(null);
          setQs([]);
        }
      }
    } catch (e) {
      setErr(e?.message || "Failed to load levels");
    } finally {
      setLoadingLevels(false);
    }
  }

  async function loadQs(lid) {
    setErr("");
    setLoadingQs(true);
    try {
      const data = await listQuestions(lid);

      const mapped = (data || []).map((row) => {
        if (row.q_type === "TF") {
          return {
            id: row.id,
            q_type: "TF",
            question_text: row.text || "",
            option_a: "",
            option_b: "",
            option_c: "",
            option_d: "",
            correct_option: "a",
            tf_answer: row.tf_answer ? 1 : 0,
            explanation: "",
          };
        } else {
          const opts = Array.isArray(row.options_json)
            ? row.options_json
            : JSON.parse(row.options_json || "[]");
          const a = opts[0] || "",
            b = opts[1] || "",
            c = opts[2] || "",
            d = opts[3] || "";
          const idx = typeof row.correct_index === "number" ? row.correct_index : 0;
          const idx2opt = ["a", "b", "c", "d"][idx] || "a";
          return {
            id: row.id,
            q_type: "MC",
            question_text: row.text || "",
            option_a: a,
            option_b: b,
            option_c: c,
            option_d: d,
            correct_option: idx2opt,
            tf_answer: 1,
            explanation: "",
          };
        }
      });

      setQs(mapped);
    } catch (e) {
      setErr(e?.message || "Failed to load questions");
    } finally {
      setLoadingQs(false);
    }
  }

  useEffect(() => {
    setSelected(null);
    setQs([]);
    setLevelForm({ ...emptyLevel });
    setQForm({ ...emptyQ });
    loadLevels();
  }, [topic]);

  function openEditLevel(l) {
    setLevelForm({
      id: l.id,
      level_number: l.level_number,
      title: l.title,
      description: l.description || "",
      pass_threshold: l.pass_threshold,
    });
  }

  async function onSaveLevel() {
    setSaving(true);
    setErr("");
    try {
      if (levelForm.id) {
        await updateLevel(topic, levelForm.id, levelForm);
      } else {
        await createLevel(topic, levelForm);
      }
      setLevelForm({ ...emptyLevel });
      await loadLevels();
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save level");
    } finally {
      setSaving(false);
    }
  }

  function onDeleteLevel(id) {
    Alert.alert("Confirm", "Delete this level?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLevel(topic, id);
            if (selected?.id === id) {
              setSelected(null);
              setQs([]);
            }
            await loadLevels();
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to delete level");
          }
        },
      },
    ]);
  }

  function openLevel(l) {
    setSelected(l);
    setQForm({ ...emptyQ });
    loadQs(l.id);
  }

  function editQ(q) {
    setQForm({ ...q });
  }

  function newQ() {
    setQForm({ ...emptyQ });
  }

  function buildQuestionPayload(form) {
    if (form.q_type === "TF") {
      return {
        text: form.question_text,
        q_type: "TF",
        tf_answer: form.tf_answer ? 1 : 0,
        options_json: [],
        correct_index: 0,
      };
    }
    const opts = [form.option_a, form.option_b, form.option_c, form.option_d];
    const map = { a: 0, b: 1, c: 2, d: 3 };
    return {
      text: form.question_text,
      q_type: "MC",
      tf_answer: 0,
      options_json: opts,
      correct_index: map[form.correct_option] ?? 0,
    };
  }

  async function saveQ() {
    if (!selected?.id) {
      Alert.alert("Info", "Select a level first.");
      return;
    }
    const payload = buildQuestionPayload(qForm);
    setSaving(true);
    setErr("");
    try {
      if (qForm.id) {
        await updateQuestion(qForm.id, payload);
      } else {
        await createQuestion(selected.id, payload);
      }
      setQForm({ ...emptyQ });
      await loadQs(selected.id);
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  }

  function deleteQ(id) {
    Alert.alert("Confirm", "Delete this question?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteQuestion(id);
            await loadQs(selected.id);
          } catch (e) {
            Alert.alert("Error", e?.message || "Failed to delete question");
          }
        },
      },
    ]);
  }

  const selectedId = selected?.id;

  const levelsCount = levels.length;
  const qsCount = qs.length;

  const canSaveLevel = useMemo(() => !!levelForm.title?.trim(), [levelForm.title]);
  const canSaveQ = useMemo(() => !!qForm.question_text?.trim(), [qForm.question_text]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Quizzes</Text>

      <View style={styles.segment}>
        <SegBtn active={topic === "html"} label="HTML" onPress={() => setTopic("html")} />
        <SegBtn active={topic === "css"} label="CSS" onPress={() => setTopic("css")} />
        <RowBtn label="Reload" onPress={loadLevels} disabled={loadingLevels || saving} />
      </View>

      {!!err && (
        <View style={styles.errBox}>
          <Text style={styles.errText}>{err}</Text>
        </View>
      )}

      {/* ===== Levels ===== */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Levels</Text>
          <Text style={styles.cardSub}>{loadingLevels ? "Loading…" : `${levelsCount} level(s)`}</Text>
        </View>

        <View style={styles.formBox}>
          <Text style={styles.formTitle}>{levelForm.id ? "Edit level" : "Create level"}</Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Level number"
            value={String(levelForm.level_number ?? 1)}
            onChangeText={(v) =>
              setLevelForm((p) => ({ ...p, level_number: Number(v || 1) }))
            }
          />

          <TextInput
            style={styles.input}
            placeholder="Title"
            value={levelForm.title}
            onChangeText={(v) => setLevelForm((p) => ({ ...p, title: v }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={levelForm.description}
            multiline
            onChangeText={(v) => setLevelForm((p) => ({ ...p, description: v }))}
          />

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Pass threshold"
            value={String(levelForm.pass_threshold ?? 6)}
            onChangeText={(v) =>
              setLevelForm((p) => ({ ...p, pass_threshold: Number(v || 1) }))
            }
          />

          <View style={styles.formActions}>
            <RowBtn
              variant="primary"
              label={saving ? "Saving..." : "Save"}
              onPress={onSaveLevel}
              disabled={saving || !canSaveLevel}
            />
            <RowBtn
              label="Clear"
              onPress={() => setLevelForm({ ...emptyLevel })}
              disabled={saving}
            />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {levels.map((l) => {
            const isSel = selectedId === l.id;
            return (
              <View key={String(l.id)} style={[styles.row, isSel ? styles.rowSel : null]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    #{l.level_number || l.id} — {l.title}
                  </Text>
                  <Text style={styles.rowMeta}>pass ≥ {l.pass_threshold}</Text>
                </View>

                <View style={styles.rowBtns}>
                  <RowBtn label="Open" onPress={() => openLevel(l)} disabled={saving} />
                  <RowBtn label="Edit" onPress={() => openEditLevel(l)} disabled={saving} />
                  <RowBtn
                    variant="danger"
                    label="Delete"
                    onPress={() => onDeleteLevel(l.id)}
                    disabled={saving}
                  />
                </View>
              </View>
            );
          })}

          {levels.length === 0 && !loadingLevels && (
            <Text style={styles.emptyText}>No levels for this topic yet.</Text>
          )}
        </View>
      </View>

      {/* ===== Questions ===== */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Questions</Text>
          <Text style={styles.cardSub}>
            {!selected ? "Pick a level" : loadingQs ? "Loading…" : `${qsCount} question(s)`}
          </Text>
        </View>

        {!selected && <Text style={styles.emptyText}>Select a level from above to show its questions.</Text>}

        {selected && (
          <>
            <View style={styles.formBox}>
              <Text style={styles.formTitle}>{qForm.id ? "Edit question" : "Create question"}</Text>

              <View style={styles.segmentSmall}>
                <SegBtn
                  active={qForm.q_type === "MC"}
                  label="MC"
                  onPress={() => setQForm((p) => ({ ...p, q_type: "MC" }))}
                />
                <SegBtn
                  active={qForm.q_type === "TF"}
                  label="T/F"
                  onPress={() => setQForm((p) => ({ ...p, q_type: "TF" }))}
                />
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Question text"
                value={qForm.question_text}
                multiline
                onChangeText={(v) => setQForm((p) => ({ ...p, question_text: v }))}
              />

              {qForm.q_type === "MC" ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Option A"
                    value={qForm.option_a}
                    onChangeText={(v) => setQForm((p) => ({ ...p, option_a: v }))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Option B"
                    value={qForm.option_b}
                    onChangeText={(v) => setQForm((p) => ({ ...p, option_b: v }))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Option C"
                    value={qForm.option_c}
                    onChangeText={(v) => setQForm((p) => ({ ...p, option_c: v }))}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Option D"
                    value={qForm.option_d}
                    onChangeText={(v) => setQForm((p) => ({ ...p, option_d: v }))}
                  />

                  <View style={styles.segmentSmall}>
                    <SegBtn
                      active={qForm.correct_option === "a"}
                      label="Correct A"
                      onPress={() => setQForm((p) => ({ ...p, correct_option: "a" }))}
                    />
                    <SegBtn
                      active={qForm.correct_option === "b"}
                      label="Correct B"
                      onPress={() => setQForm((p) => ({ ...p, correct_option: "b" }))}
                    />
                    <SegBtn
                      active={qForm.correct_option === "c"}
                      label="Correct C"
                      onPress={() => setQForm((p) => ({ ...p, correct_option: "c" }))}
                    />
                    <SegBtn
                      active={qForm.correct_option === "d"}
                      label="Correct D"
                      onPress={() => setQForm((p) => ({ ...p, correct_option: "d" }))}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.segmentSmall}>
                  <SegBtn
                    active={Number(qForm.tf_answer) === 1}
                    label="True"
                    onPress={() => setQForm((p) => ({ ...p, tf_answer: 1 }))}
                  />
                  <SegBtn
                    active={Number(qForm.tf_answer) === 0}
                    label="False"
                    onPress={() => setQForm((p) => ({ ...p, tf_answer: 0 }))}
                  />
                </View>
              )}

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Explanation (optional)"
                value={qForm.explanation}
                multiline
                onChangeText={(v) => setQForm((p) => ({ ...p, explanation: v }))}
              />

              <View style={styles.formActions}>
                <RowBtn
                  variant="primary"
                  label={saving ? "Saving..." : "Save"}
                  onPress={saveQ}
                  disabled={saving || !canSaveQ}
                />
                <RowBtn label="Clear" onPress={newQ} disabled={saving} />
              </View>
            </View>

            <View style={{ gap: 10 }}>
              {qs.map((q) => (
                <View key={String(q.id)} style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{q.question_text}</Text>

                    {q.q_type === "TF" ? (
                      <Text style={styles.rowMeta}>
                        Type: True/False — Answer:{" "}
                        <Text style={{ fontWeight: "900" }}>
                          {q.tf_answer ? "True" : "False"}
                        </Text>
                      </Text>
                    ) : (
                      <Text style={styles.rowMeta}>
                        A) {q.option_a} • B) {q.option_b} • C) {q.option_c} • D){" "}
                        {q.option_d} — Correct:{" "}
                        <Text style={{ fontWeight: "900" }}>
                          {(q.correct_option || "").toUpperCase()}
                        </Text>
                      </Text>
                    )}
                  </View>

                  <View style={styles.rowBtns}>
                    <RowBtn label="Edit" onPress={() => editQ(q)} disabled={saving} />
                    <RowBtn
                      variant="danger"
                      label="Delete"
                      onPress={() => deleteQ(q.id)}
                      disabled={saving}
                    />
                  </View>
                </View>
              ))}

              {qs.length === 0 && !loadingQs && (
                <Text style={styles.emptyText}>No questions for this level yet.</Text>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 12, backgroundColor: "#f9f9f9", paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: "900", color: "#be185d", marginBottom: 10 },

  segment: { flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" },
  segmentSmall: { flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" },

  segBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fde047",
    backgroundColor: "#fff",
  },
  segBtnActive: { backgroundColor: "#fef9c3", borderColor: "#facc15" },
  segText: { fontWeight: "800", color: "#9d174d", fontSize: 12 },
  segTextActive: { color: "#be185d" },

  errBox: { backgroundColor: "#fee2e2", borderColor: "#fecaca", borderWidth: 1, borderRadius: 14, padding: 10, marginBottom: 10 },
  errText: { color: "#b91c1c", fontWeight: "800" },

  card: {
    borderWidth: 2,
    borderColor: "#fde047",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#9d174d" },
  cardSub: { fontSize: 12, color: "#64748b", fontWeight: "700" },

  formBox: { borderWidth: 1, borderColor: "#fde68a", backgroundColor: "#fefce8", borderRadius: 16, padding: 10, marginBottom: 10 },
  formTitle: { fontWeight: "900", color: "#9d174d", marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  textArea: { minHeight: 70, textAlignVertical: "top" },

  formActions: { flexDirection: "row", gap: 8, marginTop: 2, flexWrap: "wrap" },

  row: {
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  rowSel: { backgroundColor: "#fef9c3" },
  rowTitle: { fontWeight: "900", color: "#0f172a" },
  rowMeta: { marginTop: 4, fontSize: 12, color: "#64748b" },

  rowBtns: { flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" },

  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  btnDefault: { backgroundColor: "#f1f5f9" },
  btnDefaultText: { fontSize: 12, fontWeight: "800", color: "#0f172a" },
  btnPrimary: { backgroundColor: "#34d399" },
  btnPrimaryText: { fontSize: 12, fontWeight: "900", color: "#064e3b" },
  btnDanger: { backgroundColor: "#fee2e2" },
  btnDangerText: { fontSize: 12, fontWeight: "900", color: "#b91c1c" },

  emptyText: { color: "#64748b", fontWeight: "700" },
});
