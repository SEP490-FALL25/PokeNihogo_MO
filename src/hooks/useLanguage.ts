import { useGlobalStore } from '@stores/global/global.config';
import { useCallback } from 'react';

export const useLanguage = () => {
    const language = useGlobalStore((state) => state.language);
    const setLanguage = useGlobalStore((state) => state.setLanguage);

    const changeLanguage = useCallback(async (newLanguage: 'en' | 'vi' | 'ja') => {
        // setLanguage now handles both Zustand store and i18n updates
        await setLanguage(newLanguage);
    }, [setLanguage]);

    return {
        language,
        changeLanguage,
        isEnglish: language === 'en',
        isVietnamese: language === 'vi',
        isJapanese: language === 'ja',
    };
};

export default useLanguage;
