// pages/ChallengesListScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import ChallengeCardMobile from "../components/ChallengeCardMobile";

const API = "http://10.0.2.2:5000";

export default function ChallengesListScreen({ navigation }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState(""); // "", "easy", "medium", "hard"

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = difficulty
        ? `${API}/api/challenges?difficulty=${difficulty}`
        : `${API}/api/challenges`;

      const { data } = await axios.get(url);
      setChallenges(data || []);
    } catch (e) {
      console.error("❌ Error fetching challenges:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [difficulty]);

  const filterOptions = [
    { label: "🎯 All", value: "" },
    { label: "🟢 Easy", value: "easy" },
    { label: "🟡 Medium", value: "medium" },
    { label: "🔴 Hard", value: "hard" },
  ];

  return (
    <View style={styles.screen}>
      {/* هيدر بسيط */}
      <View style={styles.header}>
        <Text style={styles.title}>Challenges</Text>

        {/* فلاتر الصعوبة (بدل select في الويب) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {filterOptions.map((opt) => {
            const isActive = difficulty === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setDifficulty(opt.value)}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* المحتوى */}
      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loaderText}>Loading challenges...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {challenges.length === 0 ? (
            <Text style={styles.emptyText}>No challenges found.</Text>
          ) : (
            challenges.map((ch) => (
              <ChallengeCardMobile
                key={ch.id}
                challenge={ch}
                onPressDetails={() => {
                  // 👇 لاحقًا لما نعمل ChallengeDetailsScreen
                  // navigation.navigate("ChallengeDetails", { id: ch.id });

                  // مؤقتاً ممكن بس نعرض تنبيه:
                  // alert("Details screen will be added soon 🙂");

                  navigation.navigate("ChallengeDetails", {
                    challengeId: ch.id,
                  });
                }}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF9C3", // خلفية صفراء ناعمة مثل الويب
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  filtersRow: {
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FFFDF5",
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#FACC15",
    borderColor: "#F59E0B",
  },
  filterText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#1F2937",
  },
  loaderBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#6B7280",
    fontSize: 14,
  },
});
