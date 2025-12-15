// mobile/pages/SupervisorProfileMobile.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Feather } from "@expo/vector-icons";

const API = "http://10.0.2.2:5000";

export default function SupervisorProfileMobile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [storedUser, setStoredUser] = useState(null);
  const [skillsInput, setSkillsInput] = useState("");
  const [profileImageLocal, setProfileImageLocal] = useState(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    skills: [],
    github: "",
    linkedin: "",
    website: "",
    profile_image: "",
    password: "",
  });

  // ===================== تحميل بيانات المستخدم من AsyncStorage =====================
  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (!raw) {
          setLoading(false);
          return;
        }
        const u = JSON.parse(raw);

        setStoredUser(u);

        setForm({
          full_name: u.full_name || "",
          email: u.email || "",
          bio: u.bio || "",
          phone: u.phone || "",
          location: u.location || "",
          skills: u.skills || [],
          github: u.github || "",
          linkedin: u.linkedin || "",
          website: u.website || "",
          profile_image: u.profile_image || "",
          password: "",
        });
      } catch (e) {
        console.error("loadUser error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ===================== Skills =====================
  const addSkill = () => {
    if (!skillsInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, skillsInput.trim()],
    }));
    setSkillsInput("");
  };

  const removeSkill = (index) => {
    setForm((prev) => {
      const updated = [...prev.skills];
      updated.splice(index, 1);
      return { ...prev, skills: updated };
    });
  };

  // ===================== اختيار صورة بروفايل =====================
  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow gallery access to pick photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setProfileImageLocal({
        uri: asset.uri,
        type: asset.type || "image/jpeg",
        name: asset.fileName || "profile.jpg",
      });
    }
  };

  // ===================== حفظ التعديلات (نفس منطق الويب) =====================
  const handleSubmit = async () => {
    if (!storedUser) return;

    try {
      setSaving(true);

      const data = new FormData();
      data.append("full_name", form.full_name);
      data.append("email", form.email);
      data.append("bio", form.bio);
      data.append("phone", form.phone);
      data.append("location", form.location);
      data.append("skills", JSON.stringify(form.skills));
      data.append("github", form.github);
      data.append("linkedin", form.linkedin);
      data.append("website", form.website);

      if (form.password && form.password.trim()) {
        data.append("password", form.password.trim());
      }

      if (profileImageLocal) {
        data.append("profile_image", {
          uri: profileImageLocal.uri,
          type: profileImageLocal.type,
          name: profileImageLocal.name,
        });
      }

      const res = await axios.put(
        `${API}/api/users/update-profile/${storedUser.id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const p = res.data.profile;
      const meta = p.profile_meta ? JSON.parse(p.profile_meta) : {};

      const updatedUser = {
        id: storedUser.id,
        role: storedUser.role,
        email: form.email,
        full_name: form.full_name,
        profile_image: p.profile_image || "",
        bio: p.bio || "",
        phone: p.phone || "",
        location: p.location || "",
        skills: meta.skills || [],
        github: meta.social?.github || "",
        linkedin: meta.social?.linkedin || "",
        website: meta.social?.website || "",
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setStoredUser(updatedUser);
      setForm((prev) => ({
        ...prev,
        ...updatedUser,
        profile_image: updatedUser.profile_image,
        password: "",
      }));
      setProfileImageLocal(null);
      setEditMode(false);

      Alert.alert("Success", "Profile updated successfully.");
    } catch (err) {
      console.error("UPDATE_ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Update failed!");
    } finally {
      setSaving(false);
    }
  };

  // ===================== Export PDF (نفس المحتوى تقريبا) =====================
 const exportPDF = async () => {
  try {
    const profileImageUrl = form.profile_image
      ? `http://10.0.2.2:5000${form.profile_image}`
      : null;

    const skillsHtml =
      form.skills && form.skills.length
        ? form.skills.map((s) => `<li>${s}</li>`).join("")
        : "<li>No skills added.</li>";

    const html = `
      <html>
        <body style="font-family: Helvetica; padding: 20px;">
          <h1 style="text-align:center;">Supervisor Profile</h1>

          ${
            profileImageUrl
              ? `<div style="text-align:center;">
                  <img src="${profileImageUrl}" style="width:120px;height:120px;border-radius:60px;" />
                </div>`
              : ""
          }

          <h2 style="text-align:center;">${form.full_name}</h2>
          <p style="text-align:center;">${form.email}</p>

          <h3>Bio</h3>
          <p>${form.bio || "-"}</p>

          <h3>Contact Information</h3>
          <p>Phone: ${form.phone || "-"}</p>
          <p>Location: ${form.location || "-"}</p>

          <h3>Skills</h3>
          <ul>${skillsHtml}</ul>

          <h3>Social Links</h3>
          <p>GitHub: ${form.github || "-"}</p>
          <p>LinkedIn: ${form.linkedin || "-"}</p>
          <p>Website: ${form.website || "-"}</p>
        </body>
      </html>
    `;

    // تحويل HTML → PDF
    const { uri } = await Print.printToFileAsync({ html });

    // مشاركة أو حفظ PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      alert("PDF saved at: " + uri);
    }
  } catch (e) {
    console.error(e);
    alert("Error generating PDF");
  }
};

  // ===================== UI =====================
  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#FACC15" />
        <Text style={{ marginTop: 8, color: "#6B7280" }}>Loading profile...</Text>
      </View>
    );
  }

  const avatarSource =
    profileImageLocal?.uri
      ? { uri: profileImageLocal.uri }
      : form.profile_image
      ? { uri: `http://10.0.2.2:5000${form.profile_image}` }
      : require("../assets/user-avatar.jpg");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        {/* صورة البروفايل */}
        <View style={styles.avatarWrapper}>
          <Image source={avatarSource} style={styles.avatar} />
          {editMode && (
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={pickImage}
            >
              <Feather name="edit-2" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* وضع العرض */}
        {!editMode && (
          <View style={styles.viewSection}>
            <Text style={styles.nameText}>{form.full_name}</Text>

            <View style={styles.rowCenter}>
              <Feather name="mail" size={16} color="#FACC15" />
              <Text style={styles.emailText}>{form.email}</Text>
            </View>

            {form.bio ? (
              <Text style={styles.bioText}>{form.bio}</Text>
            ) : null}

            {/* Contact */}
            <View style={styles.contactBox}>
              {form.phone ? (
                <View style={styles.contactRow}>
                  <Feather name="phone" size={16} color="#FACC15" />
                  <Text style={styles.contactText}>{form.phone}</Text>
                </View>
              ) : null}

              {form.location ? (
                <View style={styles.contactRow}>
                  <Feather name="map-pin" size={16} color="#FACC15" />
                  <Text style={styles.contactText}>{form.location}</Text>
                </View>
              ) : null}
            </View>

            {/* Skills */}
            {form.skills && form.skills.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.sectionLabel}>Skills</Text>
                <View style={styles.skillsWrap}>
                  {form.skills.map((s, i) => (
                    <View key={`${s}-${i}`} style={styles.skillChip}>
                      <Text style={styles.skillText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Social links */}
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionLabel}>Social Links</Text>

              {form.github ? (
                <View style={styles.socialRow}>
                  <Feather name="github" size={16} color="#111827" />
                  <Text style={styles.socialText}>{form.github}</Text>
                </View>
              ) : null}

              {form.linkedin ? (
                <View style={styles.socialRow}>
                  <Feather name="linkedin" size={16} color="#0EA5E9" />
                  <Text style={styles.socialText}>{form.linkedin}</Text>
                </View>
              ) : null}

              {form.website ? (
                <View style={styles.socialRow}>
                  <Feather name="link" size={16} color="#16A34A" />
                  <Text style={styles.socialText}>{form.website}</Text>
                </View>
              ) : null}
            </View>

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setEditMode(true)}
              >
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pdfBtn}
                onPress={exportPDF}
              >
                <Text style={styles.pdfBtnText}>Export as PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* وضع التعديل */}
        {editMode && (
          <View style={styles.editSection}>
            <ProfileInput
              label="Full Name"
              value={form.full_name}
              onChangeText={(v) => handleChange("full_name", v)}
            />
            <ProfileInput
              label="Email"
              value={form.email}
              onChangeText={(v) => handleChange("email", v)}
              keyboardType="email-address"
            />
            <ProfileInput
              label="New Password"
              value={form.password}
              onChangeText={(v) => handleChange("password", v)}
              secureTextEntry
            />

            {/* Bio */}
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                value={form.bio}
                onChangeText={(v) => handleChange("bio", v)}
                multiline
              />
            </View>

            <ProfileInput
              label="Phone"
              value={form.phone}
              onChangeText={(v) => handleChange("phone", v)}
              keyboardType="phone-pad"
            />

            <ProfileInput
              label="Location"
              value={form.location}
              onChangeText={(v) => handleChange("location", v)}
            />

            {/* Skills */}
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.inputLabel}>Skills</Text>
              <View style={styles.skillsInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={skillsInput}
                  onChangeText={setSkillsInput}
                  placeholder="Add a skill"
                />
                <TouchableOpacity
                  style={styles.addSkillBtn}
                  onPress={addSkill}
                >
                  <Feather name="plus" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.skillsWrap}>
                {form.skills.map((s, i) => (
                  <View key={`${s}-${i}`} style={styles.skillChipRow}>
                    <Text style={styles.skillText}>{s}</Text>
                    <TouchableOpacity onPress={() => removeSkill(i)}>
                      <Feather name="x" size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Social Links */}
            <ProfileInput
              label="GitHub"
              value={form.github}
              onChangeText={(v) => handleChange("github", v)}
            />
            <ProfileInput
              label="LinkedIn"
              value={form.linkedin}
              onChangeText={(v) => handleChange("linkedin", v)}
            />
            <ProfileInput
              label="Website"
              value={form.website}
              onChangeText={(v) => handleChange("website", v)}
            />

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSubmit}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditMode(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/* ============ مكوّن إدخال صغير لإعادة الاستخدام ============ */

function ProfileInput({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
}

/* ============ STYLES ============ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFDF5",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE7A3",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarWrapper: {
    alignItems: "center",
    marginTop: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FACC15",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 4,
    right: (16 + 110) / 2 - 32,
    backgroundColor: "#FACC15",
    padding: 8,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  viewSection: {
    marginTop: 16,
    alignItems: "center",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  emailText: {
    fontSize: 13,
    color: "#4B5563",
    marginLeft: 6,
  },
  bioText: {
    marginTop: 10,
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
  },
  contactBox: {
    marginTop: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 10,
    width: "100%",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    color: "#374151",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 6,
  },
  skillChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  skillChipRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    gap: 4,
  },
  skillText: {
    fontSize: 12,
    color: "#92400E",
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  socialText: {
    fontSize: 13,
    color: "#2563EB",
  },
  buttonsRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#FACC15",
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  editBtnText: {
    fontWeight: "700",
    color: "#111827",
  },
  pdfBtn: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  pdfBtnText: {
    fontWeight: "700",
    color: "#F9FAFB",
  },
  editSection: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#111827",
  },
  skillsInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  addSkillBtn: {
    backgroundColor: "#FACC15",
    padding: 10,
    borderRadius: 12,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#FACC15",
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: {
    fontWeight: "700",
    color: "#111827",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelBtnText: {
    fontWeight: "600",
    color: "#374151",
  },
});
