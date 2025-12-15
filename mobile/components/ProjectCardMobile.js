import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const API = "http://10.0.2.2:5000";

export default function ProjectCardMobile({ project, onLikeUpdate }) {
  const navigation = useNavigation();

  const [likes, setLikes] = useState(project.likes_count || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${API}/api/project-hub/${project.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);

      onLikeUpdate && onLikeUpdate();
    } catch (err) {
      console.log("❌ Like error:", err);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ProjectDetails", { id: project.id })}
    >
      <Image
        source={{ uri: `${API}${project.image_url}` }}
        style={styles.img}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{project.title}</Text>

        <Text style={styles.desc} numberOfLines={3}>
          {project.description}
        </Text>

        <View style={styles.stats}>
          <Text>❤️ {likes}</Text>
          <Text>💬 {project.comments_count}</Text>
        </View>

        <TouchableOpacity onPress={handleLike} style={styles.likeBtn}>
          <Text style={{ fontSize: 16 }}>
            {liked ? "💔 Unlike" : "❤️ Like"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  img: {
    width: "100%",
    height: 170,
  },
  content: { padding: 12 },
  title: { fontSize: 20, fontWeight: "bold", color: "#b45309" },
  desc: { color: "#555", marginVertical: 6 },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  likeBtn: { marginTop: 10 },
});
