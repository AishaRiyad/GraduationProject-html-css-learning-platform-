// mobile/components/AddProjectModal.js

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";


const API = "http://10.0.2.2:5000";

export default function AddProjectModal({ visible, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    github_link: "",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    setImage({
      uri: result.assets[0].uri,
      name: "image.jpg",
      type: "image/jpeg",
    });
  }
};


  const submit = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("github_link", form.github_link);

      if (image) {
        fd.append("image", {
          uri: image.uri,
          type: image.type,
          name: image.fileName,
        });
      }

      await axios.post(`${API}/api/project-hub/create`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      onSuccess();
    } catch (err) {
      console.log("❌ Create project error:", err);
      alert("Failed to add project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay} />

      <View style={styles.modal}>
        <Text style={styles.heading}>Add Project</Text>

        <TextInput
          style={styles.input}
          placeholder="Project title"
          value={form.title}
          onChangeText={(text) => setForm({ ...form, title: text })}
        />

        <TextInput
          style={[styles.input, { height: 90 }]}
          placeholder="Project description"
          multiline
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="GitHub link"
          value={form.github_link}
          onChangeText={(text) => setForm({ ...form, github_link: text })}
        />

        <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
          <Text style={{ color: "#fff" }}>Select Image</Text>
        </TouchableOpacity>

        {image && (
          <Image
            source={{ uri: image.uri }}
            style={{ width: "100%", height: 140, borderRadius: 10 }}
          />
        )}

        <TouchableOpacity
          style={styles.submit}
          onPress={submit}
          disabled={loading}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            {loading ? "Uploading..." : "Add Project"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.close} onPress={onClose}>
          <Text style={{ color: "#444" }}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  heading: {
    fontSize: 22,
    marginBottom: 12,
    fontWeight: "bold",
    color: "#b45309",
  },

  input: {
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },

  imgBtn: {
    backgroundColor: "#f59e0b",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  submit: {
    backgroundColor: "#ea580c",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  close: {
    marginTop: 14,
    alignItems: "center",
  },
});
