// components/Student/AboutMeMobile.js

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function AboutMeMobile({
  formData,
  setFormData,
  editMode,
  setEditMode,
  handleSave,
  changingPassword,
  setChangingPassword,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  handleSavePassword,
}) {
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>About Me</Text>

        {!editMode ? (
          <TouchableOpacity
            onPress={() => setEditMode(true)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit ✏️</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.saveCancelRow}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save ✔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setEditMode(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel ✖</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* FIELDS */}
      <View style={styles.fieldsGrid}>
        <InputField
          label="Full Name"
          value={formData.full_name}
          readOnly={!editMode}
          onChange={(v) => handleInputChange("full_name", v)}
        />

        <InputField
          label="Email"
          value={formData.email}
          readOnly={!editMode}
          onChange={(v) => handleInputChange("email", v)}
        />

        <InputField
          label="Phone Number"
          value={formData.phone_number}
          readOnly={!editMode}
          onChange={(v) => handleInputChange("phone_number", v)}
        />

        <InputField
          label="City"
          value={formData.city}
          readOnly={!editMode}
          onChange={(v) => handleInputChange("city", v)}
        />

        <InputField
          label="Address"
          value={formData.address}
          readOnly={!editMode}
          onChange={(v) => handleInputChange("address", v)}
        />

        <InputField
          label="About Me"
          value={formData.about_me}
          readOnly={!editMode}
          textarea
          onChange={(v) => handleInputChange("about_me", v)}
        />
      </View>

      {/* PASSWORD SECTION */}
      <View style={styles.passwordBox}>
        <Text style={styles.passwordLabel}>Password</Text>

        {/* Masked Password */}
        {!changingPassword && (
          <>
            <TextInput
              style={[styles.passwordInput, styles.readOnly]}
              secureTextEntry
              editable={false}
              value={formData.password}
            />

            {editMode && (
              <TouchableOpacity
                onPress={() => setChangingPassword(true)}
                style={styles.changePasswordButton}
              >
                <Text style={styles.changePasswordText}>Change Password</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Change Password Inputs */}
        {changingPassword && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.smallLabel}>Current Password</Text>
            <TextInput
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              style={styles.input}
            />

            <Text style={styles.smallLabel}>New Password (min 8 chars)</Text>
            <TextInput
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
            />

            {/* Save + Cancel */}
            <View style={styles.saveCancelRow}>
              <TouchableOpacity
                onPress={handleSavePassword}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setChangingPassword(false);
                  setCurrentPassword("");
                  setNewPassword("");
                }}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/* INPUT COMPONENT */
function InputField({ label, value, readOnly, onChange, textarea }) {
  return (
    <View style={styles.fieldBox}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          textarea && styles.textarea,
          readOnly && styles.readOnly,
        ]}
        value={value}
        editable={!readOnly}
        multiline={textarea}
        onChangeText={onChange}
      />
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    alignItems: "center",
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#eab308",
  },

  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#eab308",
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  saveCancelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  saveButton: {
    backgroundColor: "green",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  cancelButton: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 5,
  },

  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  fieldsGrid: {
    marginBottom: 20,
  },

  fieldBox: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#444",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },

  textarea: {
    height: 100,
    textAlignVertical: "top",
  },

  readOnly: {
    backgroundColor: "#f3f4f6",
  },

  passwordBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },

  passwordLabel: {
    fontWeight: "700",
    color: "#444",
    marginBottom: 8,
  },

  passwordInput: {
    padding: 12,
    borderRadius: 8,
  },

  changePasswordButton: {
    marginTop: 10,
  },

  changePasswordText: {
    color: "#eab308",
    fontWeight: "600",
  },

  smallLabel: {
    marginTop: 10,
    marginBottom: 5,
    color: "#555",
    fontWeight: "500",
  },
});
