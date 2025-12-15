import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function InlineQuizMobile({ data, onCorrect }) {
  const { question, options, answer, points } = data;
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");

  const submit = () => {
    if (selected === null) return;

    if (options[selected] === answer) {
      setFeedback("✅ Correct!");
      onCorrect(points);
    } else {
      setFeedback("❌ Try again!");
    }
  };

  return (
    <View style={styles.container}>
      {/* السؤال */}
      <Text style={styles.question}>{question}</Text>

      {/* الخيارات */}
      <View style={styles.optionsContainer}>
        {options.map((opt, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelected(index)}
            style={[
              styles.optionBtn,
              selected === index && styles.selectedOption,
            ]}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* زر الإجابة */}
      <TouchableOpacity onPress={submit} style={styles.submitBtn}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      {/* النتيجة */}
      {feedback !== "" && <Text style={styles.feedback}>{feedback}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#FFF9E6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F4D06F",
  },

  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#064F54",
    marginBottom: 12,
  },

  optionsContainer: {
    gap: 10,
  },

  optionBtn: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 10,
  },

  selectedOption: {
    borderColor: "#064F54",
    backgroundColor: "#E8F6F3",
  },

  optionText: {
    fontSize: 15,
    color: "#333",
  },

  submitBtn: {
    marginTop: 12,
    backgroundColor: "#F4C430",
    paddingVertical: 10,
    borderRadius: 10,
  },

  submitText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#064F54",
  },

  feedback: {
    marginTop: 10,
    fontWeight: "700",
    color: "#064F54",
  },
});
