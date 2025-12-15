// pages/SignupScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { signup } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import AuthCard from "../components/AuthCard";

export default function SignupScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSignup() {
    if (!form.name || !form.email || !form.password || !form.confirm) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
    if (form.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const data = await signup(form.name, form.email, form.password);
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthCard
  title="Sign Up"
  altLinkText="Sign In"
  onAltLinkPress={() => navigation.navigate("Login")}
  imageSrc={require("../assets/flowers.png")}
>
  {/* children → الصفحة كاملة داخل AuthCard */}
  
  

  <View style={styles.inputGroup}>
    <Text style={styles.label}>Name</Text>
    <TextInput
      value={form.name}
      onChangeText={(v) => handleChange("name", v)}
      placeholder="Your Name"
      style={styles.input}
    />
  </View>

  <View style={styles.inputGroup}>
    <Text style={styles.label}>Email</Text>
    <TextInput
      value={form.email}
      onChangeText={(v) => handleChange("email", v)}
      placeholder="you@example.com"
      keyboardType="email-address"
      style={styles.input}
    />
  </View>

  <View style={styles.row}>
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>Password</Text>
      <TextInput
        value={form.password}
        onChangeText={(v) => handleChange("password", v)}
        placeholder="********"
        secureTextEntry
        style={[styles.input, { marginRight: 6 }]}
      />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        value={form.confirm}
        onChangeText={(v) => handleChange("confirm", v)}
        placeholder="********"
        secureTextEntry
        style={[styles.input, { marginLeft: 6 }]}
      />
    </View>
  </View>

 

  <Text style={styles.altLink}>
    Already have an account?{" "}
    <Text
      style={styles.altLink2}
      onPress={() => navigation.navigate("Login")}
    >
      Sign In
    </Text>
  </Text>

</AuthCard>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
    textTransform: "uppercase",
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
  row: {
    flexDirection: "row",
    marginBottom: 15,
  },
  btn: {
    backgroundColor: "#facc15",
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  altLink: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
    fontSize: 13,
  },
  altLink2: {
    color: "#facc15",
    fontWeight: "bold",
  },
});
