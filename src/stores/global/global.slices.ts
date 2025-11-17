
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_STORAGE_KEY = 'app_language';

export const createGlobalSlice = (set: any, get: any): ZUSTAND.IGlobalState => ({
  language: "en", // Default language

  // DraggableOverlay position state
  overlayPosition: { x: 0, y: 0 },
  isOverlayPositionLoaded: false,

  // Subscription features state
  subscriptionKeys: [],

  setLanguage: async (language: string) => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      // Update Zustand store
      set({ language });
      // Update i18n
      const i18n = require('@i18n/i18n').default;
      await i18n.changeLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },

  // Initialize language from storage
  initializeLanguage: async () => {
    try {
      // Try to get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      if (savedLanguage) {
        // Use saved language
        set({ language: savedLanguage });
        const i18n = require('@i18n/i18n').default;
        await i18n.changeLanguage(savedLanguage);
      } else {
        // No saved language, use default
        set({ language: 'en' });
        const i18n = require('@i18n/i18n').default;
        await i18n.changeLanguage('en');
      }
    } catch (error) {
      console.error('Error loading language:', error);
      // Fallback to 'en' if there's an error
      set({ language: 'en' });
    }
  },


  // Overlay position management
  setOverlayPosition: (position: { x: number; y: number }) =>
    set({ overlayPosition: position }),

  setOverlayPositionLoaded: (loaded: boolean) =>
    set({ isOverlayPositionLoaded: loaded }),

  resetOverlayPosition: () => {
    const { width: screenWidth, height: screenHeight } =
      require("react-native").Dimensions.get("window");
    const OVERLAY_SIZE = 150;
    const defaultPosition = {
      x: screenWidth / 2 - OVERLAY_SIZE / 2,
      y: screenHeight / 2 - OVERLAY_SIZE / 2,
    };
    set({ overlayPosition: defaultPosition, isOverlayPositionLoaded: true });
  },

  // Subscription features management
  setSubscriptionKeys: (keys: string[]) => set({ subscriptionKeys: keys }),
  clearSubscriptionKeys: () => set({ subscriptionKeys: [] }),
  hasFeature: (featureKey: string) => {
    const { subscriptionKeys } = get();
    return subscriptionKeys.includes(featureKey);
  },
});

// Cần khai báo set bên ngoài slice nếu bạn dùng slice độc lập
let set: any;
export const bindSet = (_set: any) => {
  set = _set;
};
