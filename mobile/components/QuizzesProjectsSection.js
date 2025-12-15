import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function QuizzesProjectsSection() {
  const items = [
    {
      id: 1,
      title: "Quizzes",
      icon: <Ionicons name="checkmark-done-circle" size={50} color="#facc15" />,
      description:
        "Test your knowledge with interactive quizzes and track your progress.",
      colors: ["#facc15", "#fb923c"],
      buttonText: "Start Quiz",
    },
    {
      id: 2,
      title: "Projects",
      icon: <Ionicons name="document-text" size={50} color="#c084fc" />,
      description: "Apply what you learned by completing real-life projects.",
      colors: ["#c084fc", "#ec4899"],
      buttonText: "Start Project",
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>🎯 Quizzes & Projects</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsRow}
      >
        {items.map((item) => (
          <View
            key={item.id}
            style={[styles.card, { backgroundColor: item.colors[0] }]}
          >
            <View style={styles.icon}>{item.icon}</View>

            <Text style={styles.title}>{item.title}</Text>

            <Text style={styles.description}>{item.description}</Text>

            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>{item.buttonText}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 30,
    backgroundColor: "#fffceb",
  },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  cardsRow: {
    paddingHorizontal: 20,
    gap: 20,
  },
  card: {
    width: 260,
    borderRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "#333",
  },
});
