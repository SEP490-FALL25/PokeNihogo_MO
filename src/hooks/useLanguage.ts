import i18n from '@i18n/i18n';
import { useGlobalStore } from '@stores/global/global.config';
import { useCallback } from 'react';

export const useLanguage = () => {
    const language = useGlobalStore((state) => state.language);
    const setLanguage = useGlobalStore((state) => state.setLanguage);

    const changeLanguage = useCallback(async (newLanguage: 'en' | 'vi') => {
        // Update Zustand store
        setLanguage(newLanguage);
        
        // Update i18n system
        await i18n.changeLanguage(newLanguage);
    }, [setLanguage]);

    return {
        language,
        changeLanguage,
        isEnglish: language === 'en',
        isVietnamese: language === 'vi',
    };
};

export default useLanguage;
