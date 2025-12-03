// src/configs/i18n.ts (hoặc một đường dẫn tương tự)

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@i18n/en.json";
import ja from "@i18n/ja.json";
import vi from "@i18n/vi.json";

export const resources = {
  en: { translation: en },
  vi: { translation: vi },
  ja: { translation: ja },
};

// Initialize i18n with default language
// LanguageProvider will handle loading the saved language
i18n.use(initReactI18next).init({
  resources,
  lng: "en", // Default language, will be overridden by LanguageProvider
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18n;
