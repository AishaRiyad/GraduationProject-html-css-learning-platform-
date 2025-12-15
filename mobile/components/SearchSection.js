import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchSection({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (onSearch) onSearch(query);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>🔍 Search Lessons</Text>

      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#facc15"
            style={styles.icon}
          />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Type to search..."
            style={styles.input}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSearch}>
          <Text style={styles.btnText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff9c4",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  inputContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingLeft: 45,
    paddingVertical: 10,
    elevation: 3,
    position: "relative",
  },
  icon: {
    position: "absolute",
    left: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  input: {
    fontSize: 16,
    color: "#333",
  },
  btn: {
    backgroundColor: "#facc15",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
