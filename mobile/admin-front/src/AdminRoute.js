import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";

export default function AdminGuard({ navigation, children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          navigation.replace("Login");
          return;
        }

        const payload = jwtDecode(token);
        if (payload.role !== "admin") {
          navigation.replace("Login");
          return;
        }

        setAllowed(true);
      } catch (e) {
        navigation.replace("Login");
      }
    })();
  }, []);

  if (allowed === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}
