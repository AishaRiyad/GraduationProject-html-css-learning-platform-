// pages/LoginScreen.js
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { login } from "../services/api";
import AuthCard from "../components/AuthCard";

// ===============================
// 🔥 نفس دالة decodeJwt المستخدمة في الويب
// ===============================
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export default function LoginScreen() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleLogin() {
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ استدعاء API
      const data = await login(form.email, form.password);
      const token = data.token;

      // ===============================
      // 2️⃣ تخزين التوكن واليوزر
      // ===============================
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userId", String(data.user.id));

      // 🆕 تخزين الدور مثل الويب
      await AsyncStorage.setItem("role", data.user.role);

      // 🆕 تخزين بيانات المستخدم
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("userName", data.user.full_name || data.user.name);
      await AsyncStorage.setItem("userEmail", data.user.email);
      await AsyncStorage.setItem(
        "userPhoto",
        data.user.profile_image || "/user-avatar.jpg"
      );

      // ===============================
      // 3️⃣ استخراج userId من JWT مثل الويب
      // ===============================
      const payload = decodeJwt(token);
      const userId =
        payload?.id ||
        payload?.user_id ||
        payload?.sub ||
        data.user.id;

      // 🆕 نفس tryit_ns من الويب
      await AsyncStorage.setItem("tryit_ns", userId ? `u_${userId}` : "guest");

      // ===============================
      // 4️⃣ تجهيز التوكن للاستعمال العام
      // ===============================
      global.authToken = token;

      Alert.alert("Success", "Login successful!");

      // ===============================
      // 5️⃣ التوجيه حسب الدور (نفس الويب)
      // ===============================
      const role = data.user.role;

      if (role === "supervisor") {
        navigation.replace("SupervisorDashboard", { currentUser: data.user });
        return;
      }

      if (role === "admin") {
        navigation.replace("AdminDashboard", { currentUser: data.user });
        return;
      }

      // ⭐ الطالب
      navigation.replace("Dashboard", { currentUser: data.user });

    } catch (err) {
      console.log("LOGIN ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Wrong email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthCard
        title="SIGN IN"
        altLinkText="Sign Up"
        onAltLinkPress={() => navigation.navigate("Signup")}
        imageSrc={require("../assets/flowers.png")}
      >
        {!!error && <Text style={styles.error}>{error}</Text>}

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
            placeholder="you@example.com"
            keyboardType="email-address"
            style={styles.input}
            editable={!loading}
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={form.password}
            onChangeText={(v) => handleChange("password", v)}
            placeholder="********"
            secureTextEntry
            style={styles.input}
            editable={!loading}
          />

          <TouchableOpacity
            style={{ alignSelf: "flex-end", marginTop: 4 }}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>
      </AuthCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    backgroundColor: "#f9f9f9",
  },

  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 13,
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },

  forgotText: {
    fontSize: 12,
    color: "#6b7280",
  },

  btn: {
    backgroundColor: "#facc15",
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  btnText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
