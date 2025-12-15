// pages/NotificationsScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function NotificationsScreen({ route, navigation }) {
  const { notifications } = route.params;

  // ✔ صيغة الوقت بشكل صحيح لضمان عدم ظهور Invalid Date
  const formatTime = (t) => {
    if (!t) return "";
    const date = new Date(t);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString(); // تاريخ + وقت بشكل واضح
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <ScrollView style={{ marginTop: 10 }}>
        {notifications.length === 0 ? (
          <Text style={styles.empty}>No notifications</Text>
        ) : (
          notifications.map((n, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.notifItem}
              onPress={() => {
                if (n.type === "message") {
                  navigation.navigate("Contact", { fromUserId: n.from });
                }
                if (n.type === "task") {
                  navigation.navigate("MyTasks"); // أو TasksTabMobile حسب متطلباتك
                }
                if (n.type === "submission") {
  navigation.navigate("SupervisorTasks", { highlightTaskId: n.taskId });
}

              }}
            >
              <Feather name="bell" size={20} color="#B45309" />

              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.notifMessage}>
                  {n.type === "message"
                    ? `New message from supervisor`
                    : n.message}
                </Text>

                {/* ✔ عرض الوقت بشكل صحيح */}
                <Text style={styles.notifTime}>{formatTime(n.time)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBEA",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#92400e",
  },
  empty: {
    marginTop: 20,
    textAlign: "center",
    color: "#777",
  },
  notifItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
  },
  notifMessage: {
    fontSize: 16,
    fontWeight: "500",
  },
  notifTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
