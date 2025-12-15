import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import axios from "axios";


export default function Quiz({ lessonId, questions, totalQuestions, onPassed }) {
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState("");

  const q = questions[step];

  const submitAnswer = async (idx) => {
  const isCorrect = idx === q.answer;

  if (isCorrect) {
    setCorrect((c) => c + 1);
    setFeedback(`✅ Correct! ${q.explain ? q.explain : ""}`);

    setTimeout(async () => {
      setFeedback("");

      if (step + 1 < totalQuestions) {
        setStep(step + 1);
      } else {

        // 👉 اجلب البيانات الصحيحة من AsyncStorage
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");

        const uid = Number(userId);

        const score = Math.round(((correct + 1) / totalQuestions) * 100);
        const passed = score >= 60;

        try {
          await axios.post(
            "http://10.0.2.2:5000/api/lessons/complete",
            {
              userId: uid,     // ← المهم هذا
              lessonId: Number(lessonId),
              quiz_score: score,
              quiz_passed: passed ? 1 : 0,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (e) {
          console.error("❌ error submitting:", e);
        }


          // 🔥 unlock next lesson
          if (passed && onPassed) onPassed();

          setFeedback(passed ? "🎉 You passed!" : "❌ You failed.");
          setStep(totalQuestions); // Finish screen
        }
      }, 400);
    } else {
      setFeedback("Wrong answer, try again.");
    }
  };

  // finished quiz
  if (step >= totalQuestions) {
    const score = Math.round((correct / totalQuestions) * 100);
    const passed = score >= 60;

    return (
      <View style={styles.resultBox}>
        <Text style={styles.resultTitle}>Quiz Result</Text>
        <Text style={styles.resultScore}>Score: {score}%</Text>

        <Text style={passed ? styles.passText : styles.failText}>
          {feedback}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <Text style={styles.question}>{q.question}</Text>

      {q.options.map((op, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => submitAnswer(i)}
          style={styles.option}
        >
          <Text>{op}</Text>
        </TouchableOpacity>
      ))}

      {feedback !== "" && (
        <Text style={styles.feedback}>{feedback}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  option: {
    padding: 12,
    marginVertical: 5,
    backgroundColor: "#fefce8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  feedback: {
    marginTop: 10,
    fontWeight: "600",
    color: "#b45309",
  },
  resultBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    alignItems: "center",
  },
  resultTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  resultScore: { fontSize: 16, marginBottom: 10 },
  passText: { color: "green", fontSize: 16, fontWeight: "700" },
  failText: { color: "red", fontSize: 16, fontWeight: "700" },
});
