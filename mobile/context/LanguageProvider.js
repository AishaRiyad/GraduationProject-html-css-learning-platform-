import React, { createContext, useState, useEffect } from "react";
import * as Localization from "expo-localization";
import i18n from "../src/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("appLang");
      if (saved) {
        setLang(saved);
        i18n.locale = saved;
      } else {
        i18n.locale = Localization.locale.startsWith("ar") ? "ar" : "en";
      }
    })();
  }, []);

  const toggleLanguage = async () => {
    const newLang = lang === "ar" ? "en" : "ar";
    setLang(newLang);
    i18n.locale = newLang;
    await AsyncStorage.setItem("appLang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
