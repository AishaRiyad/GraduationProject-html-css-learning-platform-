// components/Student/ProfilePageMobile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AboutMeMobile from "../components//AboutMeMobile";
import LessonProgressMobile from "../components//LessonProgressMobile";
import TasksTabMobile from "../components//TasksTabMobile";
import CertificatesTabMobile from "../components//CertificatesTabMobile";
const API = "http://10.0.2.2:5000";

export default function ProfilePageMobile({ navigation }) {
  const [token, setToken] = useState("");

  const [activeTab, setActiveTab] = useState("About Me");
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    city: "",
    address: "",
    about_me: "",
    password: "",
  });

  // Fetch profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
  try {
    const savedToken = await AsyncStorage.getItem("token");
    setToken(savedToken);

    if (!savedToken) {
      Alert.alert("Error", "Please login again");
      navigation.navigate("Login");
      return;
    }

    const res = await axios.get(`${API}/api/profile`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    });

    const u = res.data.user;

    setUser({
      id: u.id,
      name: u.full_name || u.name,
      email: u.email,
      last_login: u.last_login,
    });

    setProfileImage(
      u.profile_image ? `${API}${u.profile_image}` : `${API}/user-avatar.jpg`
    );

    setFormData({
      full_name: u.full_name,
      email: u.email,
      phone_number: u.phone_number || "",
      city: u.city || "",
      address: u.address || "",
      about_me: u.about_me || "",
      password: u.passwordLength ? "•".repeat(u.passwordLength) : "",
    });

    setLoading(false);
  } catch (err) {
    console.log(err);
    Alert.alert("Error", "Failed to load profile.");
  }
};


  // Upload profile image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    const formDataImg = new FormData();

    formDataImg.append("profile_image", {
      uri,
      type: "image/jpeg",
      name: "photo.jpg",
    });

    try {
      const upload = await axios.post(`${API}/api/profile/upload`, formDataImg, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newImage = upload.data.profile_image;
      setProfileImage(`${API}${newImage}`);
      Alert.alert("Success", "Image uploaded successfully!");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Upload failed");
    }
  };

  // Save profile
  const handleSave = async () => {
    try {
      const { password, ...rest } = formData;

      await axios.put(`${API}/api/profile/update`, rest, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditMode(false);
      Alert.alert("Success", "Profile updated!");
      loadProfile();
    } catch (err) {
      Alert.alert("Error", "Failed to update profile");
    }
  };

  // Save password
  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Error", "Fill all fields");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }

    try {
      await axios.put(
        `${API}/api/profile/password`,
        { oldPassword: currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Success", "Password updated!");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed");
    }
  };

  if (loading || !user) return <Text style={{ margin: 30 }}>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.headerTitle}>Welcome, {user.name} 👋</Text>
      <Text style={styles.headerSubtitle}>
        You can update your information below ✨
      </Text>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Text style={styles.lastLogin}>Last login: {user.last_login}</Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {["About Me", "Lessons", "Tasks", "Certificates"].map((tab) => (

          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabItem,
              activeTab === tab && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabItemText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TAB CONTENT */}
      <View style={{ marginTop: 15 }}>
        {activeTab === "About Me" && (
          <AboutMeMobile
            formData={formData}
            setFormData={setFormData}
            editMode={editMode}
            setEditMode={setEditMode}
            handleSave={handleSave}
            changingPassword={changingPassword}
            setChangingPassword={setChangingPassword}
            handleSavePassword={handleSavePassword}
            handleToggleChangePassword={() =>
              setChangingPassword((prev) => !prev)
            }
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
          />
        )}

        {activeTab === "Lessons" && (
          <LessonProgressMobile userId={user.id} token={token} />
        )}

        {activeTab === "Tasks" && (
  <TasksTabMobile userId={user.id} token={token} />
)}

{activeTab === "Certificates" && (
  <CertificatesTabMobile userId={user.id} token={token} />
)}


      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },

  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#eab308",
  },

  headerSubtitle: {
    color: "#444",
    marginTop: 4,
    marginBottom: 20,
  },

  profileCard: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fef9c3",
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
  },

  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginRight: 15,
  },

  profileName: { fontSize: 18, fontWeight: "bold" },
  profileEmail: { color: "#555" },
  lastLogin: { color: "#777", marginTop: 4, fontSize: 12 },

  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    justifyContent: "space-around",
  },

  tabItem: { paddingVertical: 10 },
  tabItemText: { color: "#555" },

  activeTab: { borderBottomWidth: 2, borderColor: "#eab308" },
  activeTabText: { color: "#eab308", fontWeight: "bold" },
});
