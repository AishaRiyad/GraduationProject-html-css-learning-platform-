// File: components/CodePlaygroundMobile.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import Slider from "@react-native-community/slider";

export default function CodePlaygroundMobile({
  lang = "html",
  rawCode = "",
  secTitle = "",
  indexKey = "",
  htmlOverride = null,
}) {
  const iframeRef = useRef(null);

  const [tab, setTab] = useState("result"); // "code" | "result"
  const [height, setHeight] = useState(260);
  const [autoRun, setAutoRun] = useState(true);
  const [edited, setEdited] = useState(rawCode);

  // تنظيف الأكواد من ``` fences
  const sanitizeCode = (code = "") =>
    code.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");

  const cleaned = sanitizeCode(edited);

  // HTML افتراضي للمعاينة في حالة CSS
  const defaultNavbarHtml = `
<nav>
<ul>
<li><a href="#home">Home</a></li>
<li><a href="#about">About</a></li>
<li><a href="#services">Services</a></li>
<li><a href="#contact">Contact</a></li>
</ul>
</nav>`;

  // بناء صفحة HTML كاملة داخل WebView
  const buildDocument = () => {
    const hasFA =
      /fa[srlb]?\s|fa-\w+/i.test(cleaned) ||
      /fa[srlb]?\s|fa-\w+/i.test(htmlOverride || "");

    const FA_LINK = hasFA
      ? `<link rel="stylesheet"
           href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />`
      : "";

    if (lang === "css") {
      const html = htmlOverride || defaultNavbarHtml;
      return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
${FA_LINK}
<style>
${cleaned}
body { font-family: sans-serif; padding: 10px; margin: 0; }
</style>
</head>
<body>${html}</body>
</html>`;
    }

    if (lang === "html") {
      const needWrap = !/<!doctype|<html/i.test(cleaned);

      if (!needWrap) return cleaned;

      return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
${FA_LINK}
<style> body { font-family: sans-serif; padding: 10px; margin: 0; } </style>
</head>
<body>${cleaned}</body>
</html>`;
    }

    // لغات ثانية
    return cleaned;
  };

  const run = useCallback(() => {
    if (!iframeRef.current) return;

    const html = buildDocument();
    setWebviewContent(html);
  }, [edited, lang]);

  const [webviewContent, setWebviewContent] = useState(buildDocument());

  // أول مرة
  useEffect(() => {
    run();
  }, []);

  // Auto-run
  useEffect(() => {
    if (!autoRun) return;
    const t = setTimeout(() => run(), 300);
    return () => clearTimeout(t);
  }, [edited, autoRun, run]);

  return (
    <View style={styles.wrapper}>
      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab("code")}
          style={[styles.tabBtn, tab === "code" && styles.tabActive]}
        >
          <Text style={[styles.tabTxt, tab === "code" && styles.tabTxtActive]}>
            Code
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("result")}
          style={[styles.tabBtn, tab === "result" && styles.tabActive]}
        >
          <Text
            style={[styles.tabTxt, tab === "result" && styles.tabTxtActive]}
          >
            Result
          </Text>
        </TouchableOpacity>
      </View>

      {/* CODE PANEL */}
      {tab === "code" && (
        <TextInput
          multiline
          value={edited}
          onChangeText={setEdited}
          style={styles.codeArea}
        />
      )}

      {/* RESULT PANEL */}
      {tab === "result" && (
        <View>
          <Text style={styles.previewLabel}>Live Preview</Text>

          {/* Slider للتحكم بالارتفاع */}
          <View style={styles.sliderRow}>
            <Text style={styles.sliderText}>Height: {height}px</Text>
            <Slider
              minimumValue={180}
              maximumValue={480}
              value={height}
              onValueChange={(v) => setHeight(v)}
              style={styles.slider}
            />
          </View>

          {/* WebView */}
          <View style={[styles.previewBox, { height }]}>
            <WebView
              ref={iframeRef}
              originWhitelist={["*"]}
              source={{ html: webviewContent }}
              javaScriptEnabled
              domStorageEnabled
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#fff8e5",
    borderWidth: 1,
    borderColor: "#F5D46F",
  },

  tabs: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F5D46F",
    marginBottom: 10,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#FFF3CC",
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "white",
  },

  tabTxt: {
    color: "#7A633A",
    fontWeight: "600",
  },

  tabTxtActive: {
    color: "#3B2E19",
    fontWeight: "700",
  },

  codeArea: {
    minHeight: 180,
    fontFamily: "monospace",
    fontSize: 13,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F5D46F",
    textAlignVertical: "top",
  },

  previewLabel: {
    fontSize: 12,
    color: "#6B5B4E",
    marginBottom: 8,
  },

  previewBox: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F5D46F",
    overflow: "hidden",
  },

  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  slider: {
    flex: 1,
    marginLeft: 10,
  },

  sliderText: {
    fontSize: 12,
    color: "#6B5B4E",
  },
});
