import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "expo-localization";


import en from "../locales/en.json";
import ar from "../locales/ar.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    resources,
    lng: RNLocalize.getLocales()[0].languageCode.startsWith("ar") ? "ar" : "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
