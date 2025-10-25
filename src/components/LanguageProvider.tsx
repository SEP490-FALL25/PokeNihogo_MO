import i18n from '@i18n/i18n';
import { useGlobalStore } from '@stores/global/global.config';
import React, { useEffect } from 'react';

interface LanguageProviderProps {
    children: React.ReactNode;
}

/**
 * LanguageProvider component to sync i18n with Zustand store
 * This ensures that when the app starts, i18n uses the language from the store
 */
export default function LanguageProvider({ children }: LanguageProviderProps) {
    const language = useGlobalStore((state) => state.language);
    const initializeLanguage = useGlobalStore((state) => state.initializeLanguage);

    useEffect(() => {
        // Initialize language from i18n on mount
        initializeLanguage();
    }, [initializeLanguage]);

    useEffect(() => {
        // Sync i18n with store language when language changes
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language]);

    return <>{children}</>;
}
