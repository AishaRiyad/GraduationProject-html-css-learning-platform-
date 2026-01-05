import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { getMyProfile, updateMyProfile, changeMyPassword } from "./AdminApi";

export default function AdminSettingsScreen() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProfile();
        setProfile({ name: data?.name || "", email: data?.email || "" });
      } catch (e) {
        setProfileErr(e.message || "Failed to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  async function handleSaveProfile() {
    setProfileMsg("");
    setProfileErr("");

    if (!profile.name.trim() || !profile.email.trim()) {
      setProfileErr("Please fill name and email.");
      return;
    }

    try {
      setSavingProfile(true);
      await updateMyProfile({ name: profile.name.trim(), email: profile.email.trim() });
      setProfileMsg("Profile updated successfully.");
      Alert.alert("Success", "Profile updated successfully.");
    } catch (e) {
      setProfileErr(e.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    setPwMsg("");
    setPwErr("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwErr("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwErr("New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPw(true);
      await changeMyPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwMsg("Password changed successfully.");
      Alert.alert("Success", "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (e) {
      setPwErr(e.message || "Failed to change password.");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1}>Settings</Text>

      {/* Profile card */}
      <View style={styles.card}>
        <Text style={styles.h2}>Edit profile</Text>

        {loadingProfile ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Loading profile…</Text>
          </View>
        ) : (
          <>
            {!!profileErr && <Text style={styles.err}>{profileErr}</Text>}
            {!!profileMsg && <Text style={styles.ok}>{profileMsg}</Text>}

            <Text style={styles.label}>Name</Text>
            <TextInput
              value={profile.name}
              onChangeText={(v) => setProfile((p) => ({ ...p, name: v }))}
              style={styles.input}
              editable={!savingProfile}
              placeholder="Name"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={profile.email}
              onChangeText={(v) => setProfile((p) => ({ ...p, email: v }))}
              style={styles.input}
              editable={!savingProfile}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Pressable
              onPress={handleSaveProfile}
              disabled={savingProfile}
              style={[styles.btnYellow, savingProfile && { opacity: 0.7 }]}
            >
              <Text style={styles.btnYellowText}>
                {savingProfile ? "Saving..." : "Save changes"}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Password card */}
      <View style={[styles.card, { maxWidth: 520 }]}>
        <Text style={styles.h2}>Change password</Text>

        {!!pwErr && <Text style={styles.err}>{pwErr}</Text>}
        {!!pwMsg && <Text style={styles.ok}>{pwMsg}</Text>}

        <Text style={styles.label}>Current password</Text>
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          style={styles.input}
          secureTextEntry
          editable={!savingPw}
          placeholder="Current password"
        />

        <Text style={styles.label}>New password</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
          secureTextEntry
          editable={!savingPw}
          placeholder="New password"
        />

        <Text style={styles.label}>Confirm new password</Text>
        <TextInput
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          style={styles.input}
          secureTextEntry
          editable={!savingPw}
          placeholder="Confirm new password"
        />

        <Pressable
          onPress={handleChangePassword}
          disabled={savingPw}
          style={[styles.btnPink, savingPw && { opacity: 0.7 }]}
        >
          <Text style={styles.btnPinkText}>
            {savingPw ? "Updating..." : "Update password"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    paddingBottom: 30,
    backgroundColor: "#fff7ed",
  },
  h1: {
    fontSize: 22,
    fontWeight: "900",
    color: "#9d174d",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  h2: {
    fontSize: 16,
    fontWeight: "800",
    color: "#be185d",
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fde68a",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btnYellow: {
    marginTop: 12,
    backgroundColor: "#facc15",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  btnYellowText: {
    color: "#831843",
    fontWeight: "900",
  },
  btnPink: {
    marginTop: 12,
    backgroundColor: "#ec4899",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  btnPinkText: {
    color: "#fff",
    fontWeight: "900",
  },
  err: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 10,
    borderRadius: 12,
    fontSize: 12,
    marginBottom: 10,
  },
  ok: {
    color: "#166534",
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 10,
    borderRadius: 12,
    fontSize: 12,
    marginBottom: 10,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { color: "#64748b", fontSize: 12 },
});
