import React, { useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Video } from "expo-av";
import Slider from "@react-native-community/slider";

export default function LessonVideo() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [showIcon, setShowIcon] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={async () => {
          if (status.isPlaying) {
            await videoRef.current.pauseAsync();
          } else {
            await videoRef.current.playAsync();
          }
          setShowIcon(true);
          setTimeout(() => setShowIcon(false), 700);
        }}
        style={styles.videoWrapper}
      >
        <Video
          ref={videoRef}
          source={require("../assets/lesson1.mp4")}
          style={styles.video}
          resizeMode="contain"
          onPlaybackStatusUpdate={(s) => setStatus(s)}
        />

        {showIcon && (
          <View style={styles.iconOverlay}>
            <Text style={styles.icon}>{status.isPlaying ? "⏸" : "▶"}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Slider
        value={(status.positionMillis / status.durationMillis) || 0}
        onValueChange={(value) => {
          if (status.durationMillis)
            videoRef.current.setPositionAsync(value * status.durationMillis);
        }}
        minimumTrackTintColor="#facc15"
        maximumTrackTintColor="#ddd"
        style={styles.slider}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 20, alignItems: "center" },
  videoWrapper: {
    width: "90%",
    height: 250,
    backgroundColor: "black",
    borderRadius: 10,
    overflow: "hidden",
  },
  video: { width: "100%", height: "100%" },
  iconOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: 60, color: "white" },
  slider: { width: "90%", marginTop: 10 },
});
