// File: components/RenderBlocksMobile.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CodePlaygroundMobile from "./CodePlaygroundMobile";

/**
 * حذف العلامات ```language من بداية النص
 */
const sanitizeFence = (code = "") =>
  code.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");

function renderString(text, key) {
  return (
    <Text
      key={key}
      style={styles.paragraph}
    >
      {text}
    </Text>
  );
}

/**
 * 🔍 فحص إن كان النص يحتوي block ```code```
 */
function renderWithCodeFence(text, secTitle, key) {
  const fenceRe = /```(\w+)?\n([\s\S]*?)```/m;
  const match = text.match(fenceRe);

  if (!match) {
    return renderString(text, key);
  }

  const lang = (match[1] || "html").toLowerCase();
  const code = sanitizeFence(match[2]);

  const before = text.slice(0, match.index).trim();
  const after = text.slice(match.index + match[0].length).trim();

  return (
    <View key={`block-${key}`} style={{ marginBottom: 14 }}>
      {before ? renderString(before, `${key}-before`) : null}

      <CodePlaygroundMobile
        lang={lang}
        rawCode={code}
        secTitle={secTitle}
        indexKey={key}
      />

      {after ? renderString(after, `${key}-after`) : null}
    </View>
  );
}

export default function RenderBlocksMobile({ blocks, secTitle }) {
  if (!Array.isArray(blocks)) return null;

  return (
    <View style={{ marginTop: 6 }}>
      {blocks.map((block, i) => {

        // نص عادي
        if (typeof block === "string") {
          return renderWithCodeFence(block, secTitle, i);
        }

        // بطاقات
        if (block.type === "cards" && Array.isArray(block.items)) {
          return (
            <View key={i} style={styles.cardsWrapper}>
              {block.items.map((item, j) => (
                <View key={j} style={styles.card}>
                  <View style={styles.cardNumber}>
                    <Text style={styles.cardNumberText}>{j + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.label}</Text>
                    <Text style={styles.cardDesc}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          );
        }

        // Code Playground
        if (block.type === "code-demo") {
          return (
            <View key={i} style={{ marginTop: 6, marginBottom: 18 }}>
              <Text style={styles.exampleTitle}>Example</Text>

              <CodePlaygroundMobile
                lang={(block.language || "html").toLowerCase()}
                rawCode={sanitizeFence(block.code)}
                secTitle={secTitle}
                indexKey={`${secTitle}-${i}`}
                htmlOverride={block.html}
              />

              {block.note ? (
                <Text style={styles.note}>
                  💡 {block.note}
                </Text>
              ) : null}
            </View>
          );
        }

        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  paragraph: {
    fontSize: 15,
    color: "#4E3A22",
    lineHeight: 22,
    marginBottom: 10,
  },

  cardsWrapper: {
    marginTop: 6,
    marginBottom: 12,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#FFF9E9",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F3D795",
    marginBottom: 10,
  },

  cardNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5B700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  cardNumberText: {
    color: "white",
    fontWeight: "700",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4E3A22",
    marginBottom: 4,
  },

  cardDesc: {
    fontSize: 14,
    color: "#6B5633",
    lineHeight: 20,
  },

  exampleTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#3E2D18",
  },

  note: {
    marginTop: 6,
    fontSize: 14,
    color: "#8A6B2A",
  },
});
