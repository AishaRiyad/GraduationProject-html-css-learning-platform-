// components/ChallengeCardMobile.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const diffColors = (d) => {
  if (d === "easy")
    return { bg: "#ECFDF3", text: "#15803D" };
  if (d === "medium")
    return { bg: "#FEF9C3", text: "#CA8A04" };
  return { bg: "#FEF2F2", text: "#B91C1C" }; // hard
};

export default function ChallengeCardMobile({ challenge, onPressDetails }) {
  const diff = diffColors(challenge.difficulty);
  const deadlineDate = challenge.deadline ? new Date(challenge.deadline) : null;
  const now = new Date();
  const isExpired = deadlineDate && deadlineDate < now;

  const formattedDeadline =
    deadlineDate &&
    deadlineDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <View style={styles.card}>
      {/* عنوان + صعوبة */}
      <View style={styles.topRow}>
        <Text style={styles.title}>{challenge.title}</Text>
        <View
          style={[
            styles.diffBadge,
            { backgroundColor: diff.bg },
          ]}
        >
          <Text style={[styles.diffText, { color: diff.text }]}>
            {challenge.difficulty?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* الوصف */}
      <Text style={styles.description} numberOfLines={3}>
        {challenge.description}
      </Text>

      {/* Deadline */}
      {deadlineDate && (
        <View style={styles.deadlineRow}>
          <Text style={styles.deadlineLabel}>⏳ Deadline:</Text>
          <Text
            style={[
              styles.deadlineValue,
              isExpired ? styles.deadlineExpired : styles.deadlineActive,
            ]}
          >
            {formattedDeadline}
          </Text>
        </View>
      )}

      {/* الحالة + زر التفاصيل */}
      <View style={styles.bottomRow}>
        <View>
          <View style={styles.statusPill}>
            <Text style={isExpired ? styles.statusExpired : styles.statusActive}>
              {isExpired ? "⛔ Expired" : "✅ Active"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (isExpired) return;
            if (onPressDetails) onPressDetails();
          }}
          disabled={isExpired}
          style={[
            styles.detailsButton,
            isExpired && styles.detailsButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.detailsText,
              isExpired && styles.detailsTextDisabled,
            ]}
          >
            {isExpired ? "Closed" : "View Details"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFDF5",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginRight: 8,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  diffText: {
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 4,
    marginBottom: 8,
  },
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deadlineLabel: {
    fontSize: 12,
    color: "#4B5563",
    marginRight: 4,
  },
  deadlineValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  deadlineExpired: {
    color: "#B91C1C",
  },
  deadlineActive: {
    color: "#374151",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#ECFEFF",
  },
  statusActive: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },
  statusExpired: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B91C1C",
  },
  detailsButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FACC15",
  },
  detailsButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  detailsText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  detailsTextDisabled: {
    color: "#6B7280",
  },
});
