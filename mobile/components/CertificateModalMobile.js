import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

export default function CertificateModalMobile({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>🎓 Congratulations!</Text>

          <Text style={styles.msg}>
            You’ve successfully completed the Basic Level and unlocked the Advanced Level!
          </Text>

          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#d97706",
    marginBottom: 10,
  },
  msg: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#fbbf24",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
