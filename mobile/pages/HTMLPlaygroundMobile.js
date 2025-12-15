// src/screens/HTMLPlaygroundMobile.js

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
  Switch,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import AIHelpDrawerMobile from "../components/AIHelpDrawerMobile";

const API_BASE = "http://10.0.2.2:5000";

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Document</title>
</head>
<body>

</body>
</html>`;

const DEFAULT_CSS = `/* Your CSS here */
body { font-family: system-ui, sans-serif; }
`;

// ============ خوارزمية الفحص البسيط للـ HTML (نفس تبع الويب تقريبًا) ============
function validateHtml(source) {
  const errs = [];
  const warns = [];
  if (!/<!DOCTYPE html>/i.test(source))
    warns.push("Consider adding <!DOCTYPE html> at the top.");
  if (!/<html[\s>]/i.test(source)) errs.push("Missing <html> root element.");
  if (!/<body[\s>]/i.test(source)) errs.push("Missing <body> element.");

  const openTagRe = /<([a-zA-Z][a-zA-Z0-9-]*)(?=[\s>\/])/g;
  const closeTagRe = /<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>/g;
  const voids = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);
  const opens = [];
  const closes = [];

  let m;
  while ((m = openTagRe.exec(source))) opens.push(m[1].toLowerCase());
  while ((m = closeTagRe.exec(source))) closes.push(m[1].toLowerCase());

  const count = (arr) =>
    arr.reduce((a, t) => {
      a[t] = (a[t] || 0) + 1;
      return a;
    }, {});

  const openCount = count(opens.filter((t) => !voids.has(t)));
  const closeCount = count(closes);

  Object.keys(openCount).forEach((tag) => {
    if ((closeCount[tag] || 0) < openCount[tag])
      errs.push(`Unclosed <${tag}> tag(s).`);
  });
  Object.keys(closeCount).forEach((tag) => {
    if ((openCount[tag] || 0) < closeCount[tag])
      errs.push(`Extra closing </${tag}> tag(s).`);
  });

  return { errs, warns };
}

// مساعد لتخزين/قراءة JSON من AsyncStorage
async function loadJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function saveJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function HTMLPlaygroundMobile() {
  const { width } = useWindowDimensions();

  const [editorLang, setEditorLang] = useState("html"); // "html" | "css"
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [previewHtml, setPreviewHtml] = useState(DEFAULT_HTML);

  const [autoRun, setAutoRun] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [fontSize, setFontSize] = useState(13);
  const [device, setDevice] = useState("desktop"); // mobile | tablet | desktop
  const [dark, setDark] = useState(false);

  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const [projects, setProjects] = useState([]);
  const [currentId, setCurrentId] = useState("");
  const [projectsVisible, setProjectsVisible] = useState(false);
  const [projectTitleDraft, setProjectTitleDraft] = useState("");
  const [renameTargetId, setRenameTargetId] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const [helpVisible, setHelpVisible] = useState(false);

  // ======= تحميل الإعدادات والكود المحفوظ =======
  useEffect(() => {
    (async () => {
      const savedHtml =
        (await AsyncStorage.getItem("tryit_html_mobile")) || DEFAULT_HTML;
      const savedCss =
        (await AsyncStorage.getItem("tryit_css_mobile")) || DEFAULT_CSS;
      const savedProjects = await loadJson("tryit_projects_mobile", []);
      const savedCurrentId =
        (await AsyncStorage.getItem("tryit_currentId_mobile")) || "";

      setHtml(savedHtml);
      setCss(savedCss);
      setPreviewHtml(savedHtml);
      setProjects(savedProjects);
      setCurrentId(savedCurrentId);
    })();
  }, []);

  // ======= حفظ الكود تلقائيًا =======
  useEffect(() => {
    AsyncStorage.setItem("tryit_html_mobile", html);
    AsyncStorage.setItem("tryit_css_mobile", css);
  }, [html, css]);

  // ======= دمج HTML + CSS للـ WebView =======
const srcDoc = useMemo(
  () =>
    `${previewHtml}
<style>
  body {
    font-size: 50px;
    line-height: 1.6;
  }
</style>
<style>${css || ""}</style>`,
  [previewHtml, css]
);



  // ======= فحص وتشغيل =======
  const runOnce = () => {
    const { errs, warns } = validateHtml(html);
    setErrors(errs);
    setWarnings(warns);
    if (errs.length === 0) {
      setPreviewHtml(html);
    }
  };

  // Auto-run بسيط لما تتغير HTML لو مفعّل
  useEffect(() => {
    if (!autoRun) return;
    runOnce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html]);

  // ======= حساب عرض الـ preview حسب الجهاز =======
  const previewWidth =
    device === "mobile"
      ? Math.min(380, width * 0.9)
      : device === "tablet"
      ? Math.min(768, width * 0.95)
      : width - 32;

  // ======= التعامل مع المشاريع =======
  const saveProject = async (forceNew = false) => {
    let id = currentId;
    let title = projectTitleDraft.trim();

    // لو مشروع جديد أو forceNew
    if (!id || forceNew) {
      if (!title) {
        // لو ما كتب اسم، نعطي اسم افتراضي
        title = `Project ${projects.length + 1}`;
      }
      id = String(Date.now());
      const proj = {
        id,
        title,
        html,
        css,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const next = [proj, ...projects].slice(0, 200);
      setProjects(next);
      await saveJson("tryit_projects_mobile", next);
      setCurrentId(id);
      await AsyncStorage.setItem("tryit_currentId_mobile", id);
      setProjectTitleDraft("");
      return;
    }

    // تحديث مشروع موجود
    const next = projects.map((p) =>
      p.id === id ? { ...p, html, css, updatedAt: Date.now() } : p
    );
    setProjects(next);
    await saveJson("tryit_projects_mobile", next);
  };

  const openProject = (proj) => {
    setHtml(proj.html);
    setCss(proj.css || DEFAULT_CSS);
    setPreviewHtml(proj.html);
    setCurrentId(proj.id);
    AsyncStorage.setItem("tryit_currentId_mobile", proj.id);
    setProjectsVisible(false);
  };

  const deleteProject = async (id) => {
    const next = projects.filter((p) => p.id !== id);
    setProjects(next);
    await saveJson("tryit_projects_mobile", next);
    if (currentId === id) {
      setCurrentId("");
      await AsyncStorage.removeItem("tryit_currentId_mobile");
    }
  };

  const renameProject = async (id, newTitle) => {
    const t = newTitle.trim();
    if (!t) return;
    const next = projects.map((p) =>
      p.id === id ? { ...p, title: t, updatedAt: Date.now() } : p
    );
    setProjects(next);
    await saveJson("tryit_projects_mobile", next);
    setRenameTargetId(null);
  };

  const newBlank = async () => {
    setHtml(DEFAULT_HTML);
    setCss(DEFAULT_CSS);
    setPreviewHtml(DEFAULT_HTML);
    setCurrentId("");
    await AsyncStorage.removeItem("tryit_currentId_mobile");
  };

  // ======= AI Suggestions =======
  const handleAISuggest = async () => {
    try {
      setAiLoading(true);
      setAiMessage("");
      const res = await fetch(
        `${API_BASE}/api/ai-local/ai-code-suggestions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ htmlCode: html, cssCode: css }),
        }
      );
      const data = await res.json();

      if (data.error) {
        setAiMessage("AI error: " + data.error);
        return;
      }

      const strengths =
        Array.isArray(data.strengths) && data.strengths.length > 0
          ? data.strengths.map((s) => `• ${s}`).join("\n")
          : "None";

      const issues =
        Array.isArray(data.issues) && data.issues.length > 0
          ? data.issues.map((s) => `• ${s}`).join("\n")
          : "None";

      const suggestions =
        Array.isArray(data.suggestions) && data.suggestions.length > 0
          ? data.suggestions
              .map((s) =>
                typeof s === "string" ? `• ${s}` : `• ${JSON.stringify(s)}`
              )
              .join("\n")
          : "None";

      const msg = `🟢 Strengths:\n${strengths}\n\n⚠️ Issues:\n${issues}\n\n💡 Suggestions:\n${suggestions}`;
      setAiMessage(msg);
    } catch (err) {
      setAiMessage("Error talking to AI: " + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // ======= Theme styles ديناميكي =======
  const theme = dark ? darkTheme : lightTheme;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* ======= Top Bar ======= */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Text style={[styles.logo, { color: theme.accent }]}>HTML Tryit</Text>

        <View style={styles.topRightRow}>
          {/* AI Suggest */}
          <TouchableOpacity
            style={[styles.chipBtn, { backgroundColor: theme.accent }]}
            onPress={handleAISuggest}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.chipText}>🤖 AI Suggest</Text>
            )}
          </TouchableOpacity>

          {/* AI Help Drawer */}
          <TouchableOpacity
            style={[styles.iconBtn, { borderColor: theme.border }]}
            onPress={() => setHelpVisible(true)}
          >
            <Text style={{ fontSize: 18 }}>💬</Text>
          </TouchableOpacity>

          {/* Theme */}
          <TouchableOpacity
            style={[styles.iconBtn, { borderColor: theme.border }]}
            onPress={() => setDark((d) => !d)}
          >
            <Text style={{ fontSize: 18 }}>{dark ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ======= AI Message (صندوق أصفر صغير تحت الهيدر) ======= */}
      {aiMessage ? (
        <View
          style={[
            styles.aiBox,
            { backgroundColor: theme.aiBg, borderColor: theme.border },
          ]}
        >
          <ScrollView>
            <Text style={{ color: theme.text, fontSize: 12 }}>
              {aiMessage}
            </Text>
          </ScrollView>
        </View>
      ) : null}

      {/* ======= Controls Row (HTML/CSS + Run + AutoRun + Device + FontSize + Wrap + Save/Projects/New) ======= */}
    {/* ======= NEW MOBILE TOP CONTROLS ======= */}
<View
  style={[
    styles.controlsContainer,
    {
      backgroundColor: theme.editorBg,
      borderColor: theme.border,
    },
  ]}
>
  {/* --- Row 1: HTML / CSS + Run + Auto --- */}
  <View style={styles.row}>
    {/* Tabs */}
    <View
      style={[
        styles.tabGroup,
        { borderColor: theme.border },
      ]}
    >
      {["html", "css"].map((lang) => {
        const active = editorLang === lang;
        return (
          <TouchableOpacity
            key={lang}
            style={[
              styles.tabBtn,
              active && {
                backgroundColor: theme.accentSoft,
                borderColor: theme.accent,
              },
            ]}
            onPress={() => setEditorLang(lang)}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: active ? theme.accentStrong : theme.textMuted },
              ]}
            >
              {lang.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

    {/* Run */}
    <TouchableOpacity
      style={[
        styles.runBtn,
        { backgroundColor: theme.runBg },
      ]}
      onPress={runOnce}
    >
      <Text style={styles.runText}>Run ▶</Text>
    </TouchableOpacity>

    {/* Auto */}
    <View style={styles.inlineRow}>
      <Text style={[styles.smallLabel, { color: theme.textMuted }]}>
        Auto
      </Text>
      <Switch value={autoRun} onValueChange={setAutoRun} />
    </View>
  </View>

  {/* --- Row 2: Device + FontSize + Wrap + Save / Projects / New --- */}
  <View style={[styles.row, { marginTop: 6 }]}>
    {/* Device */}
    <View style={styles.deviceContainer}>
      {["mobile", "tablet", "desktop"].map((d) => {
        const active = device === d;
        return (
          <TouchableOpacity
            key={d}
            style={[
              styles.deviceBtn,
              active && { backgroundColor: theme.accentSoft },
            ]}
            onPress={() => setDevice(d)}
          >
            <Text
              style={{
                fontSize: 11,
                color: active ? theme.accentStrong : theme.textMuted,
              }}
            >
              {d[0].toUpperCase() + d.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

    {/* Font Size */}
    <View style={[styles.fontSizeBox, { borderColor: theme.border }]}>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => setFontSize((f) => Math.max(11, f - 1))}
      >
        <Text>-</Text>
      </TouchableOpacity>
      <Text style={styles.fontValue}>{fontSize}</Text>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => setFontSize((f) => Math.min(20, f + 1))}
      >
        <Text>+</Text>
      </TouchableOpacity>
    </View>

    {/* Wrap */}
    <View style={styles.inlineRow}>
      <Text style={[styles.smallLabel, { color: theme.textMuted }]}>
        Wrap
      </Text>
      <Switch value={wrap} onValueChange={setWrap} />
    </View>

    {/* Save */}
    <TouchableOpacity
      style={[
        styles.smallBtn,
        { backgroundColor: theme.accentSoft },
      ]}
      onPress={() => saveProject(false)}
    >
      <Text style={[styles.smallBtnText, { color: theme.accentStrong }]}>
        Save
      </Text>
    </TouchableOpacity>

    {/* Projects */}
    <TouchableOpacity
      style={[
        styles.smallBtn,
        { backgroundColor: theme.accentSoft },
      ]}
      onPress={() => {
        setProjectTitleDraft("");
        setProjectsVisible(true);
      }}
    >
      <Text style={[styles.smallBtnText, { color: theme.accentStrong }]}>
        Projects
      </Text>
    </TouchableOpacity>

    {/* New */}
    <TouchableOpacity
      style={[
        styles.smallBtn,
        { backgroundColor: theme.accentSoft },
      ]}
      onPress={newBlank}
    >
      <Text style={[styles.smallBtnText, { color: theme.accentStrong }]}>
        New
      </Text>
    </TouchableOpacity>
  </View>
</View>


      {/* ======= Editor ======= */}
      <View
        style={[
          styles.editorContainer,
          { backgroundColor: theme.editorBg, borderColor: theme.border },
        ]}
      >
        <ScrollView style={{ flex: 1 }}>
          <TextInput
            multiline
            value={editorLang === "html" ? html : css}
            onChangeText={(txt) =>
              editorLang === "html" ? setHtml(txt) : setCss(txt)
            }
            style={[
              styles.editorInput,
              {
                color: theme.text,
                fontSize,
                textAlignVertical: "top",
              },
              wrap ? {} : { flexWrap: "nowrap" },
            ]}
            placeholder={
              editorLang === "html"
                ? "Write your HTML here..."
                : "Write your CSS here..."
            }
            placeholderTextColor={theme.textMuted}
          />
        </ScrollView>
      </View>

      {/* ======= Errors / Warnings ======= */}
      {errors.length > 0 && (
        <View
          style={[
            styles.msgBox,
            { borderColor: "#fca5a5", backgroundColor: "#fee2e2" },
          ]}
        >
          <Text style={{ fontWeight: "700", marginBottom: 4 }}>HTML Errors</Text>
          {errors.map((e, i) => (
            <Text key={i} style={{ fontSize: 12 }}>
              • {e}
            </Text>
          ))}
        </View>
      )}
      {warnings.length > 0 && errors.length === 0 && (
        <View
          style={[
            styles.msgBox,
            { borderColor: "#facc15", backgroundColor: "#fef9c3" },
          ]}
        >
          <Text style={{ fontWeight: "700", marginBottom: 4 }}>Tips</Text>
          {warnings.map((w, i) => (
            <Text key={i} style={{ fontSize: 12 }}>
              • {w}
            </Text>
          ))}
        </View>
      )}

      {/* ======= Preview ======= */}
      <View style={styles.previewWrapper}>
        <View style={styles.previewHeader}>
          <Text style={[styles.smallLabel, { color: theme.textMuted }]}>
            Result ({device})
          </Text>
        </View>

        <View
          style={[
            styles.previewFrame,
            { width: previewWidth, borderColor: theme.border },
          ]}
        >
          <WebView originWhitelist={["*"]} source={{ html: srcDoc }} />
        </View>
      </View>

      {/* ======= Projects Modal ======= */}
      <Modal
        visible={projectsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProjectsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.bg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                My Projects
              </Text>
              <TouchableOpacity onPress={() => setProjectsVisible(false)}>
                <Text style={{ fontSize: 18, color: theme.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* إدخال اسم مشروع جديد */}
            <View style={{ marginBottom: 10 }}>
              <Text style={[styles.smallLabel, { color: theme.textMuted }]}>
                New project title (optional)
              </Text>
              <TextInput
                value={projectTitleDraft}
                onChangeText={setProjectTitleDraft}
                style={[
                  styles.projectInput,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.editorBg,
                  },
                ]}
                placeholder="My HTML Project"
                placeholderTextColor={theme.textMuted}
              />
              <TouchableOpacity
                style={[
                  styles.chipBtn,
                  {
                    backgroundColor: theme.accent,
                    alignSelf: "flex-start",
                    marginTop: 6,
                  },
                ]}
                onPress={() => saveProject(true)}
              >
                <Text style={[styles.chipText, { color: "#fff" }]}>
                  Save As New
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {projects.length === 0 ? (
                <Text style={{ color: theme.textMuted, marginTop: 10 }}>
                  No projects yet. Use "Save" or "Save As New".
                </Text>
              ) : (
                projects.map((p) => (
                  <View
                    key={p.id}
                    style={[
                      styles.projectItem,
                      {
                        borderColor:
                          p.id === currentId ? theme.accent : theme.border,
                        backgroundColor:
                          p.id === currentId ? theme.accentSoft : theme.editorBg,
                      },
                    ]}
                  >
                    {renameTargetId === p.id ? (
                      <TextInput
                        value={p.title}
                        onChangeText={(txt) =>
                          setProjects((prev) =>
                            prev.map((x) =>
                              x.id === p.id ? { ...x, title: txt } : x
                            )
                          )
                        }
                        onBlur={() => renameProject(p.id, p.title)}
                        style={[
                          styles.projectInput,
                          {
                            borderColor: theme.border,
                            color: theme.text,
                            backgroundColor: "#fff",
                          },
                        ]}
                      />
                    ) : (
                      <Text style={{ fontWeight: "600", color: theme.text }}>
                        {p.title}
                      </Text>
                    )}

                    <View style={styles.projectButtonsRow}>
                      <TouchableOpacity onPress={() => openProject(p)}>
                        <Text style={styles.projectBtnText}>Open</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          setRenameTargetId(
                            renameTargetId === p.id ? null : p.id
                          )
                        }
                      >
                        <Text style={styles.projectBtnText}>Rename</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteProject(p.id)}>
                        <Text style={[styles.projectBtnText, { color: "red" }]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======= AI Help Drawer ======= */}
      <AIHelpDrawerMobile
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
      />
    </View>
  );
}

/* ======= Theme Objects ======= */
const lightTheme = {
  bg: "#fffef7",
  editorBg: "#fffbe8",
  border: "#f2e5a7",
  accent: "#f59e0b",
  accentSoft: "#fef3c7",
  accentStrong: "#d97706",
  text: "#1f2933",
  textMuted: "#6b7280",
  aiBg: "#fef3c7",
  runBg: "#ec4899",
};

const darkTheme = {
  bg: "#0f172a",
  editorBg: "#020617",
  border: "#1e293b",
  accent: "#facc15",
  accentSoft: "#473b1f",
  accentStrong: "#fde047",
  text: "#e5e7eb",
  textMuted: "#9ca3af",
  aiBg: "#1e293b",
  runBg: "#db2777",
};

/* ======= Styles ثابتة ======= */
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 18,
    fontWeight: "700",
  },
  topRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
 chipBtn: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  marginHorizontal: 4,
  flexShrink: 0,    // ❗ يمنع تمدّد العنصر
},

  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  aiBox: {
    marginHorizontal: 10,
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    maxHeight: 90,
  },
controlsRow: {
  flexDirection: "row",
  flexWrap: "nowrap",
  alignItems: "center",
  paddingHorizontal: 8,
  paddingBottom: 6,
}
,
 tabGroup: {
  flexDirection: "row",
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "#f4d28a",
  overflow: "hidden",
},

  tabBtn: {
  paddingVertical: 6,
  paddingHorizontal: 12, // أصغر لأجل الموبايل
},

  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
 inlineRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  marginLeft: 6,
},

  smallLabel: {
    fontSize: 11,
  },
  stepBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
deviceBtn: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#f4d28a",
  minWidth: 72,
  alignItems: "center",
},

  editorContainer: {
    marginTop: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 160,
    maxHeight: 250,
  },
  editorInput: {
    fontFamily: "monospace",
    minHeight: 140,
  },
  msgBox: {
    marginTop: 6,
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  previewWrapper: {
    flex: 1,
    alignItems: "center",
    marginTop: 8,
  },
  previewHeader: {
    marginBottom: 4,
  },
  previewFrame: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
    flex: 1,
    maxHeight: 340,
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    height: "65%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  projectInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  projectItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  projectButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 6,
  },
  projectBtnText: {
    fontSize: 12,
    color: "#2563eb",
  },
  controlsContainer: {
  marginHorizontal: 10,
  marginTop: 10,
  backgroundColor: "#fff",
  padding: 10,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#f3e8a8",
},

row: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  flexWrap: "wrap",          // ⬅⬅ المهم
  gap: 8,                    // ⬅⬅ مسافات خفيفة
},


runBtn: {
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 14,
  marginLeft: 6,
},


runText: {
  color: "white",
  fontWeight: "700",
  fontSize: 12,
},

deviceContainer: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,        // كان 6
  flexWrap: "wrap",
  marginVertical: 4,
},


fontSizeBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  paddingHorizontal: 6,
  paddingVertical: 3,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#ddd",
  marginLeft: 4,
},


fontValue: {
  marginHorizontal: 6,
  fontWeight: "600",
  fontSize: 12,
  color: "#444",
},

smallBtn: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  marginLeft: 4,
},


smallBtnText: {
  fontSize: 11,
  fontWeight: "600",
},

});
