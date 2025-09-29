import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import vi from './vi.json';

const resources = {
    en: { translation: en },
    vi: { translation: vi },
};

const locale = Localization.getLocales()[0]?.languageCode; // Lấy ngôn ngữ mặc định của thiết bị (ví dụ: 'en-US')

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: locale && resources[locale as keyof typeof resources] ? locale : 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;