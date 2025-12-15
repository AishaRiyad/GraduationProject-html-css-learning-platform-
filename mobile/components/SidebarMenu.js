// SidebarMenu.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import i18n from "../src/i18n";

export default function SidebarMenu({ visible, onClose, navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  const { t } = useTranslation();

  // تحميل اللغة المحفوظة عند فتح التطبيق
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("appLanguage");
      if (saved) {
        setLanguage(saved);
        i18n.changeLanguage(saved);
      }
    })();
  }, []);

  const toggleLanguage = async () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);

    i18n.changeLanguage(newLang);

    await AsyncStorage.setItem("appLanguage", newLang);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      {/* خلفية شفافة */}
      <TouchableOpacity style={styles.overlay} onPress={onClose} />

      {/* القائمة */}
      <View style={styles.menu}>
        <Text style={styles.title}>{t("menu") || "Menu"}</Text>

        {/* ---------------- HOME ---------------- */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            onClose();
            navigation.navigate("Dashboard");
          }}
        >
          <Feather name="home" size={20} color="#444" />
          <Text style={styles.linkText}>{t("menu_home")}</Text>
        </TouchableOpacity>

        {/* ---------------- PROFILE ---------------- */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            onClose();
            navigation.navigate("ProfileMobile");
          }}
        >
          <Feather name="user" size={20} color="#444" />
          <Text style={styles.linkText}>{t("menu_profile")}</Text>
        </TouchableOpacity>

        {/* ---------------- LESSONS ---------------- */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            onClose();
            navigation.navigate("LevelSelector");
          }}
        >
          <Feather name="book-open" size={20} color="#444" />
          <Text style={styles.linkText}>{t("menu_lessons")}</Text>
        </TouchableOpacity>

        {/* ---------------- PROJECT HUB ---------------- */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            onClose();
            navigation.navigate("ProjectHub");
          }}
        >
          <Feather name="folder" size={20} color="#444" />
          <Text style={styles.linkText}>{t("menu_projects")}</Text>
        </TouchableOpacity>

        {/* ---------------- CHALLENGES ---------------- */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            onClose();
            navigation.navigate("ChallengesList");
          }}
        >
          <Feather name="activity" size={20} color="#444" />
          <Text style={styles.linkText}>{t("menu_challenges")}</Text>
        </TouchableOpacity>

        {/* ---------------- CODE EDITOR ---------------- */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            onClose();
            navigation.navigate("HTMLPlayground");
          }}
        >
          <Feather name="code" size={20} color="#444" />
          <Text style={styles.linkText}>{t("menu_editor")}</Text>
        </TouchableOpacity>

        {/* ---------------- MY TASKS ---------------- */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            onClose();
            navigation.navigate("MyTasks");
          }}
        >
          <Feather name="check-circle" size={20} color="#444" />
          <Text style={styles.linkText}>{t("menu_tasks")}</Text>
        </TouchableOpacity>

        {/* ---------------- CONTACT ---------------- */}
        <TouchableOpacity
          style={styles.link}
          onPress={() => {
            onClose();
            navigation.navigate("Contact");
          }}
        >
          <Feather name="message-square" size={20} color="#444" />
          <Text style={styles.linkText}>{t("menu_contact")}</Text>
        </TouchableOpacity>

        {/* ---------------- LANGUAGE ---------------- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("language")}</Text>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
          >
            <MaterialIcons
              name="language"
              size={20}
              color="#444"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.linkText}>
              {language === "en" ? "English" : "العربية"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---------------- DARK MODE ---------------- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("dark_mode")}</Text>
          <Switch
            value={darkMode}
            onValueChange={(v) => setDarkMode(v)}
            thumbColor={darkMode ? "#FACC15" : "#ccc"}
          />
        </View>

        {/* ---------------- LOGOUT ---------------- */}
        <TouchableOpacity
          style={styles.logout}
          onPress={async () => {
            await AsyncStorage.removeItem("token");
            onClose();
            navigation.reset({
              index: 0,
              routes: [{ name: "Signup" }],
            });
          }}
        >
          <Feather name="log-out" size={20} color="red" />
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ======================= STYLES =======================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  menu: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "72%",
    height: "100%",
    backgroundColor: "#fffced",
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  linkText: {
    fontSize: 17,
    marginLeft: 12,
    color: "#333",
    fontWeight: "600",
  },
  section: {
    marginTop: 25,
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    color: "#444",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    marginTop: 30,
    borderTopWidth: 1,
    borderColor: "#aaa",
  },
  logoutText: {
    fontSize: 17,
    color: "red",
    marginLeft: 12,
    fontWeight: "700",
  },
});
