// 📁 components/QuizLesson5Mobile.js

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QuizLesson5Mobile({
  lessonId = 5,
  quizData,
  onPassed,
  isFinal = false,
}) {
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <Text style={{ textAlign: "center", color: "#777", marginVertical: 10 }}>
        No quiz available.
      </Text>
    );
  }

  const q = quizData.questions[step];
  const total = quizData.questions.length;

  const handleAnswer = async (idx) => {
    const isCorrect = idx === q.correctIndex;

    if (isCorrect) {
      setCorrect((prev) => prev + 1);
      setFeedback("✅ Correct!");
      setAnswered(true);
    } else {
      setFeedback("❌ Wrong! Try again.");
      return;
    }

    setTimeout(async () => {
      setFeedback("");

      // لو في سؤال تاني بنفس الكويز
      if (step + 1 < total) {
        setStep(step + 1);
        setAnswered(false);
        return;
      }

      // نهاية الكويز
      const score = Math.round(
        ((isCorrect ? correct + 1 : correct) / total) * 100
      );
      const passed = score >= 60;

      try {
        const token = await AsyncStorage.getItem("token");
const userId = await AsyncStorage.getItem("userId");


        await axios.post(
           "http://10.0.2.2:5000/api/lessons/complete",
          {
            userId: Number(userId),
            lessonId: Number(lessonId),
            quiz_score: score,
            quiz_passed: passed ? 1 : 0,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (e) {
        console.log("❌ Failed to submit quiz progress", e);
      }

      if (passed && onPassed) onPassed();

      if (passed && isFinal) {
        setFinished(true);
      } else {
        setAnswered(true);
        setFeedback("✅ Correct!");
      }
    }, 600);
  };

  // شاشة النهاية — فقط لو هذا آخر كويز
  if (finished) {
    const score = Math.round((correct / total) * 100);
    return (
      <View style={styles.finishBox}>
        <Text style={styles.finishTitle}>Quiz Completed!</Text>
        <Text style={styles.finishScore}>Your Score: {score}%</Text>
        <Text style={styles.finishPassed}>✅ You passed! The next lesson is unlocked.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{q.question}</Text>

      <View style={styles.optionsGrid}>
        {q.options.map((op, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleAnswer(i)}
            disabled={answered}
            style={[
              styles.optionBtn,
              answered && { backgroundColor: "#e9fbe9", borderColor: "#4caf50" },
            ]}
          >
            <Text style={styles.optionText}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {feedback !== "" && (
        <Text
          style={[
            styles.feedback,
            feedback.startsWith("✅")
              ? { color: "#2e7d32" }
              : { color: "#c62828" },
          ]}
        >
          {feedback}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f1d17a",
    marginTop: 15,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  question: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5D4037",
    marginBottom: 15,
    textAlign: "center",
  },

  optionsGrid: {
    flexDirection: "column",
    gap: 10,
  },

  optionBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  optionText: {
    textAlign: "center",
    color: "#333",
    fontWeight: "600",
  },

  feedback: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  finishBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1d17a",
    alignItems: "center",
    marginTop: 15,
  },

  finishTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5D4037",
    marginBottom: 5,
  },

  finishScore: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
  },

  finishPassed: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2e7d32",
  },
});
