// src/configs/i18n.ts (hoặc một đường dẫn tương tự)

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useGlobalStore } from "@stores/global/global.config";
import en from "./en.json";
import vi from "./vi.json";

export const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

// Get initial language from store
const getInitialLanguage = () => {
  try {
    // Try to get language from global store

    const language = useGlobalStore.getState().language;
    return language || "en";
  } catch {
    // Fallback to 'en' if store is not available
    return "en";
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18n;
