import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import api from "../services/api";

export default function LessonListScreen({ route, navigation }) {
  const { selectedLevel, userId } = route.params;

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get(
          `/api/lessons/${userId}/${selectedLevel}`,
          {
            headers: {
              Authorization: `Bearer ${global.authToken}`,
            },
          }
        );

        setLessons(res.data);
      } catch (err) {
        console.log("❌ Error fetching lessons:", err);
        setError("Failed to load lessons.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [selectedLevel]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading lessons...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", fontSize: 18 }}>{error}</Text>
      </View>
    );

  // ⛔ مستوى advanced لا يعرض شيء
  if (selectedLevel === "advanced") return null;

  /*  
  ========================================================
  🟡 دالة اختيار صفحة الدرس حسب رقم الدرس
  ========================================================
  */
  const navigateToLesson = (lessonNumber, lessonId) => {
    switch (lessonNumber) {
      case 1:
        navigation.navigate("LessonViewer", { lessonId });
        break;
      case 2:
        navigation.navigate("LessonViewer2", { lessonId });
        break;

      // ⭐ بقية الدروس (معلّق عليها الآن حسب طلبك)
       case 3:
         navigation.navigate("LessonViewer3", { lessonId });
         break;
       case 4:
         navigation.navigate("LessonViewer4", { lessonId });
         break;
          case 5:
         navigation.navigate("LessonViewer5", { lessonId });
         break;
          case 6:
         navigation.navigate("LessonViewer6", { lessonId });
         break;
          case 7:
         navigation.navigate("LessonViewer7", { lessonId });
         break;
           case 8:
         navigation.navigate("LessonViewer8", { lessonId });
         break;
         case 9:
         navigation.navigate("LessonViewer9", { lessonId });
         break;
         case 10:
         navigation.navigate("LessonViewer10", { lessonId });
         break;
         case 11:
         navigation.navigate("LessonViewer11", { lessonId });
         break;
         case 12:
         navigation.navigate("LessonViewer12", { lessonId });
         break;
          case 13:
         navigation.navigate("LessonViewer13", { lessonId });
         break;
         case 14:
         navigation.navigate("LessonViewer14", { lessonId });
         break;
       case 15:
         navigation.navigate("LessonViewer15", { lessonId });
        break;

      default:
        console.log("⚠ Lesson screen not implemented yet");
    }
  };

  const renderLesson = ({ item, index }) => {
  const unlocked = Number(item.is_unlocked) === 1;

  return (
    <View style={[styles.lessonCard, unlocked ? styles.unlocked : styles.locked]}>
      <View style={styles.row}>
        <Text style={styles.title}>{item.title}</Text>

        {unlocked ? (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigateToLesson(index + 1, item.id)}
          >
            <Text style={styles.startText}>Start Lesson</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.lockText}>🔒 Locked</Text>
        )}
      </View>
    </View>
  );
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 Lessons</Text>

      <FlatList
  data={lessons}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item, index }) =>
    renderLesson({ item, index })
  }
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,
  },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#ca8a04",
  },

  lessonCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  unlocked: {
    backgroundColor: "white",
  },

  locked: {
    backgroundColor: "#e5e7eb",
    opacity: 0.7,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },

  startBtn: {
    backgroundColor: "#facc15",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  startText: {
    fontSize: 13,
    fontWeight: "700",
  },

  lockText: {
    color: "#777",
    fontSize: 14,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
