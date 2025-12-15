import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LearningPathSection() {
  const cards = [
    {
      id: 1,
      title: "HTML Basics",
      icon: <Ionicons name="star" size={40} color="#facc15" />,
      links: ["Introduction", "Tags & Elements", "Basic Structure"],
      colors: ["#fef08a", "#fcd34d"],
    },
    {
      id: 2,
      title: "Advanced HTML",
      icon: <Ionicons name="code-slash" size={40} color="#60a5fa" />,
      links: ["Forms", "Media & Semantic", "SEO Essentials"],
      colors: ["#93c5fd", "#6366f1"],
    },
    {
      id: 3,
      title: "Code Playground",
      icon: <Ionicons name="play-circle" size={40} color="#4ade80" />,
      links: ["Try Examples", "Interactive Editor", "Live Preview"],
      colors: ["#86efac", "#22c55e"],
    },
    {
      id: 4,
      title: "Certificate",
      icon: <Ionicons name="ribbon" size={40} color="#c084fc" />,
      links: ["🔒 Locked"],
      locked: true,
      colors: ["#c084fc", "#ec4899"],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Learning Journey</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {cards.map((card) => (
          <View
            key={card.id}
            style={[
              styles.card,
              { backgroundColor: card.colors[0] }
            ]}
          >
            <View style={styles.iconContainer}>{card.icon}</View>
            <Text style={styles.cardTitle}>{card.title}</Text>

            {card.links.map((link, i) => (
              <Text key={i} style={styles.linkText}>
                {link}
              </Text>
            ))}

            {card.locked && (
              <TouchableOpacity style={styles.lockBtn}>
                <Text style={styles.lockBtnText}>Try Now to Unlock 🔓</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    backgroundColor: "#fff7d6",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#444",
  },
  card: {
    width: 250,
    padding: 20,
    borderRadius: 20,
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  linkText: {
    marginBottom: 5,
    color: "#333",
  },
  lockBtn: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "white",
    borderRadius: 20,
  },
  lockBtnText: {
    textAlign: "center",
    color: "#9333ea",
    fontWeight: "bold",
  },
});
