import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from "react-native";
import { Video } from "expo-av";


const { width } = Dimensions.get("window");

export default function CarouselHero() {
  const videoRef = useRef(null);

  const slides = [
    {
      id: 1,
      image: require("../assets/html_card1.png"),
      title: "Learn HTML from Scratch",
      description:
        "Start your web development journey by learning the basics of HTML.",
      buttonText: "Start Learning",
      buttonAction: () => alert("Navigate to HTML Basics!"),
    },
    {
      id: 2,
      image: require("../assets/html_card2.png"),
      title: "Where HTML is Used",
      description:
        "Discover how HTML powers every website and web application you see online.",
      buttonText: "Explore Examples",
      buttonAction: () => alert("Navigate to HTML Use Cases!"),
    },
    {
      id: 3,
      video: require("../assets/html_card3.mp4"),
      title: "Try a Code Editor",
      description:
        "Experiment with your first HTML code using our interactive code editor.",
      buttonText: "Open Editor",
      buttonAction: () => alert("Navigate to Code Editor!"),
    },
    {
      id: 4,
      image: require("../assets/html_card4.png"),
      title: "Build Your First Project",
      description:
        "Apply your HTML skills in real projects and see the results instantly.",
      buttonText: "Start Project",
      buttonAction: () => alert("Navigate to Projects!"),
    },
    {
      id: 5,
      image: require("../assets/html_card5.png"),
      title: "Earn a Certificate",
      description:
        "Complete all lessons and projects to get your HTML certificate.",
      buttonText: "View Certificate",
      buttonAction: () => alert("Navigate to Certificate!"),
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background: Image or Video */}
      {slides[currentIndex].video ? (
  <Video
    ref={videoRef}
    source={slides[currentIndex].video}
    style={styles.media}
    resizeMode="cover"
    shouldPlay
    isLooping
  />
) : (
  <Image source={slides[currentIndex].image} style={styles.media} />
)}


      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.title}>{slides[currentIndex].title}</Text>
        <Text style={styles.description}>
          {slides[currentIndex].description}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={slides[currentIndex].buttonAction}
        >
          <Text style={styles.buttonText}>
            {slides[currentIndex].buttonText}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Indicators */}
      <View style={styles.indicators}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
  },
  media: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
    maxWidth: "90%",
  },
  button: {
    backgroundColor: "#facc15",
    paddingVertical: 10,
    paddingHorizontal: 25,
    alignSelf: "flex-start",
    borderRadius: 10,
  },
  buttonText: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 16,
  },
  indicators: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 50,
  },
  activeDot: {
    backgroundColor: "white",
  },
});
