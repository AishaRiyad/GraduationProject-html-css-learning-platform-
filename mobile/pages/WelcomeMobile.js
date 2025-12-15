import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function WelcomeMobile() {
  const navigation = useNavigation();
  const [activePopup, setActivePopup] = useState(null);

  return (
    <LinearGradient colors={["#0a0e17", "#0b0f1f"]} style={styles.container}>
      {/* Glow Background */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      {/* Hero Image */}
      <View style={styles.heroWrapper}>
        <Image
          source={require("../assets/welcome-hero.png")}
          style={styles.hero}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Master Front-End</Text>
      <Text style={styles.subtitle}>From Zero To Hero</Text>

      {/* Description */}
      <Text style={styles.description}>
        Learn HTML & CSS with interactive lessons, real challenges,  
        instant code execution and real-world projects — all optimized  
        perfectly for mobile learners.
      </Text>

      {/* Navigation Links */}
      <View style={styles.linksRow}>
        <NavLink label="Learn" onPress={() => setActivePopup("learn")} />
        <NavLink label="Challenges" onPress={() => setActivePopup("challenges")} />
        <NavLink label="Projects" onPress={() => setActivePopup("projects")} />
        <NavLink label="Contact" onPress={() => setActivePopup("contact")} />
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.btn, styles.loginBtn]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.signupBtn]}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* POPUP */}
      <Modal visible={activePopup !== null} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <PopupContent active={activePopup} />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setActivePopup(null)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

/* NAV LINK COMPONENT */
function NavLink({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Text style={styles.navText}>{label}</Text>
    </TouchableOpacity>
  );
}

/* POPUP CONTENT */
function PopupContent({ active }) {
  const content = {
    learn: {
      title: "Learn",
      text: "Structured HTML & CSS lessons designed for all levels.",
    },
    challenges: {
      title: "Challenges",
      text: "Fun real-world challenges to test your skills.",
    },
    projects: {
      title: "Projects",
      text: "Build practical projects that strengthen your portfolio.",
    },
    contact: {
      title: "Contact",
      text: "Need help? We're here for you anytime.",
    },
  };

  if (!active) return null;

  return (
    <>
      <Text style={styles.popupTitle}>{content[active].title}</Text>
      <Text style={styles.popupText}>{content[active].text}</Text>
    </>
  );
}

/* ---------------------- STYLES ----------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 60,
  },

  glowTop: {
    position: "absolute",
    top: -100,
    left: -80,
    width: 260,
    height: 260,
    backgroundColor: "rgba(250,204,21,0.15)",
    borderRadius: 200,
  },
  glowBottom: {
    position: "absolute",
    bottom: -120,
    right: -70,
    width: 300,
    height: 300,
    backgroundColor: "rgba(59,130,246,0.15)",
    borderRadius: 200,
  },

  heroWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },

  hero: {
    width: width * 0.75,
    height: width * 0.5,
  },

  title: {
    fontSize: 33,
    fontWeight: "900",
    textAlign: "center",
    color: "#fff",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    color: "#facc15",
  },

  description: {
    fontSize: 16,
    color: "#d1d5db",
    textAlign: "center",
    marginTop: 18,
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  /* LINKS */
  linksRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,  // ← مسافة أكبر لتكون مرتبة
    gap: 28,
  },

  navItem: {
    paddingVertical: 6,
  },

  navText: {
    color: "#facc15",
    fontSize: 17,
    fontWeight: "700",
  },

  /* BOTTOM BUTTONS */
  bottomButtons: {
    marginTop: 55, // ← مسافة أكبر لراحة العين
    flexDirection: "row",
    gap: 12,
  },

  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  loginBtn: {
    backgroundColor: "#facc15",
  },
  signupBtn: {
    backgroundColor: "#000",
  },

  loginText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 16,
  },

  signupText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  /* POPUP */
  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  popupCard: {
    backgroundColor: "#fff",
    marginHorizontal: 30,
    padding: 22,
    borderRadius: 18,
  },

  popupTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
    color: "#111",
  },

  popupText: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
  },

  closeBtn: {
    backgroundColor: "#facc15",
    padding: 12,
    borderRadius: 12,
    marginTop: 18,
  },

  closeText: {
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },
});
