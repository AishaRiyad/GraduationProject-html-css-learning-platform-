// 📁 components/LiveCodeEditorMobile.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { WebView } from "react-native-webview";

export default function LiveCodeEditorMobile({ initialCode = "" }) {
  const [code, setCode] = useState(formatCode(initialCode));
  const [output, setOutput] = useState("");

  // تنظيف الكود (استبدال \n بأسطر حقيقة)
  function formatCode(str) {
    return str?.replace(/\\n/g, "\n").trim();
  }

  // تشغيل الكود داخل WebView
  const runCode = () => {
    const fullHtml = `
      <html>
        <head>
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
              background: #fffef6;
            }
            form {
              display: flex;
              flex-direction: column;
              gap: 10px;
              max-width: 250px;
            }
            label {
              font-weight: bold;
            }
            input, button {
              padding: 8px;
              border: 1px solid #ccc;
              border-radius: 6px;
            }
            button {
              background: #ffcc00;
              border: none;
              font-weight: 600;
              cursor: pointer;
              transition: 0.3s;
            }
            #message {
              margin-top: 20px;
              padding: 10px;
              border-radius: 8px;
              background: #e8f5e9;
              color: #2e7d32;
              font-weight: bold;
              display: none;
            }
          </style>
        </head>
        <body>
          ${code}

          <div id="message"></div>

          <script>
            const form = document.querySelector("form");
            const messageBox = document.getElementById("message");

            if (form) {
              form.addEventListener("submit", (e) => {
                e.preventDefault();
                const nameInput = form.querySelector("input[type='text']");
                const name = nameInput ? nameInput.value.trim() : "";

                messageBox.style.display = "block";
                messageBox.textContent = name
                  ? "✅ Form submitted! Welcome, " + name + " 🎉"
                  : "✅ Form submitted successfully!";

                form.reset();
              });
            }
          </script>
        </body>
      </html>
    `;

    setOutput(fullHtml);
  };

  return (
    <View style={{ marginTop: 20 }}>
      {/* محرر الكود */}
      <TextInput
        multiline
        value={code}
        onChangeText={setCode}
        style={styles.editor}
        placeholder="Write your HTML here..."
      />

      {/* زر التشغيل */}
      <TouchableOpacity onPress={runCode} style={styles.runBtn}>
        <Text style={styles.runBtnText}>▶ Run Code</Text>
      </TouchableOpacity>

      {/* WebView Output */}
      <View style={styles.outputContainer}>
        <Text style={styles.outputLabel}>🔹 Output:</Text>

        <WebView
          source={{ html: output }}
          style={styles.webview}
          originWhitelist={["*"]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editor: {
    height: 180,
    borderWidth: 1,
    borderColor: "#e5c100",
    backgroundColor: "#fff9c4",
    borderRadius: 10,
    padding: 10,
    fontFamily: "monospace",
    fontSize: 14,
    textAlignVertical: "top",
  },
  runBtn: {
    backgroundColor: "#facc15",
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  runBtnText: {
    color: "#4a3c0a",
    fontWeight: "700",
    fontSize: 16,
  },
  outputContainer: {
    marginTop: 15,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  outputLabel: {
    fontWeight: "bold",
    color: "#444",
    marginBottom: 8,
  },
  webview: {
    height: 250,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
