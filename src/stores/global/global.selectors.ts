import { useGlobalStore } from "./global.config";

export const useLanguageSelector = () => useGlobalStore((state: ZUSTAND.IGlobalState) => state.language);
export const useGlobalSetLanguage = () => useGlobalStore((state: ZUSTAND.IGlobalState) => state.setLanguage)

