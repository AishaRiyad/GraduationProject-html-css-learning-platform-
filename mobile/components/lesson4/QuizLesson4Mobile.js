import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function QuizLesson4Mobile({ quizData, onPassed }) {
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  if (!quizData || !quizData.questions) {
    return (
      <Text style={{ textAlign: "center", color: "#999" }}>
        No quiz available.
      </Text>
    );
  }

  const total = quizData.questions.length;
  const q = quizData.questions[step];

  const handleAnswer = async (idx) => {
    const isCorrect = idx === q.correctIndex;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setFeedback(`✔ Correct! ${q.explain || ""}`);

      setTimeout(async () => {
        setFeedback("");

        // ✔ Next question
        if (step + 1 < total) {
          setStep(step + 1);
        } else {
          // 🎯 Final score
          const score = Math.round(((correct + 1) / total) * 100);
          const passed = score >= 60;

          const token = await AsyncStorage.getItem("token");
          const userId = await AsyncStorage.getItem("userId");

          try {
            await axios.post(
              "http://10.0.2.2:5000/api/lessons/complete",
              {
                userId: Number(userId),
                lessonId: 4,
                quiz_score: score,
                quiz_passed: passed ? 1 : 0,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (e) {
            console.log("❌ Error saving quiz result:", e);
          }

          if (passed) {
            setShowConfetti(true);
            setFeedback("🎉 Congratulations! You passed!");
            onPassed && onPassed();
            setTimeout(() => setShowConfetti(false), 5000);
          } else {
            setFeedback("✘ You did not pass. Try again!");
          }

          setStep(total);
        }
      }, 800);
    } else {
      setFeedback(`✘ Wrong! ${q.explain || ""}`);
    }
  };

  // 🟢 RESULT SCREEN
  if (step >= total) {
    const score = Math.round((correct / total) * 100);
    const passed = score >= 60;

    return (
      <View style={styles.resultBox}>
        {showConfetti && (
          <ConfettiCannon
            count={120}
            origin={{ x: Dimensions.get("window").width / 2, y: 0 }}
            fadeOut
          />
        )}

        <Text style={styles.resultTitle}>Quiz Result</Text>

        <Text style={styles.resultScore}>Score: {score}%</Text>

        <Text
          style={[
            styles.resultFeedback,
            passed ? styles.passText : styles.failText,
          ]}
        >
          {feedback}
        </Text>

        {passed && (
          <Text style={styles.unlockMsg}>
            🎉 Lesson 5 has been unlocked!
          </Text>
        )}
      </View>
    );
  }

  // 🟡 QUIZ QUESTIONS
  return (
    <View style={styles.quizBox}>
      <Text style={styles.qCounter}>
        Question {step + 1} of {total}
      </Text>

      <Text style={styles.question}>{q.question}</Text>

      {q.options.map((op, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => handleAnswer(i)}
          style={styles.option}
        >
          <Text style={styles.optionText}>{op}</Text>
        </TouchableOpacity>
      ))}

      {feedback !== "" && (
        <View style={styles.feedbackBox}>
          <Text
            style={[
              styles.feedbackText,
              feedback.startsWith("✔")
                ? styles.correctFeedback
                : styles.wrongFeedback,
            ]}
          >
            {feedback}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  quizBox: {
    backgroundColor: "#FAFAE6",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E3A8",
    marginBottom: 30,
  },

  qCounter: {
    fontSize: 16,
    fontWeight: "600",
    color: "#064F54",
    marginBottom: 10,
  },

  question: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },

  option: {
    padding: 14,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5B5",
  },

  optionText: {
    fontSize: 15,
    color: "#333",
  },

  feedbackBox: {
    marginTop: 10,
  },

  feedbackText: {
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    textAlign: "center",
  },

  correctFeedback: {
    backgroundColor: "#D1F5D1",
    color: "#0B7A0B",
  },

  wrongFeedback: {
    backgroundColor: "#FDDDDD",
    color: "#B30A0A",
  },

  resultBox: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7E3A8",
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#064F54",
    marginBottom: 10,
  },

  resultScore: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  resultFeedback: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },

  passText: {
    color: "#0B7A0B",
  },

  failText: {
    color: "#B30A0A",
  },

  unlockMsg: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#FFF7C2",
    color: "#775A05",
    fontWeight: "700",
    borderRadius: 12,
  },
});
