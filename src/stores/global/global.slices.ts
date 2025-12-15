
import type { IUserSubscriptionFeatureDetail } from '@models/subscription/subscription.response';
import AsyncStorage from '@react-native-async-storage/async-storage';
const LANGUAGE_STORAGE_KEY = 'app_language';
const OVERLAY_STORAGE_KEY = '@DraggableOverlay:enabled';

export const createGlobalSlice = (set: any, get: any): ZUSTAND.IGlobalState => ({
  language: "en", // Default language

  // DraggableOverlay position state
  overlayPosition: { x: 0, y: 0 },
  isOverlayPositionLoaded: false,
  isPokemonOverlayEnabled: true,
  isOverlayPreferenceLoaded: false,

  // Subscription features state
  subscriptionKeys: [],
  subscriptionFeatureDetails: {} as Record<string, IUserSubscriptionFeatureDetail>,

  setLanguage: async (language: string) => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      // Update Zustand store
      set({ language });
      // Update i18n
      const i18n = require('@configs/i18n').default;
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
        const i18n = require('@configs/i18n').default;
        await i18n.changeLanguage(savedLanguage);
      } else {
        // No saved language, use default
        set({ language: 'en' });
        const i18n = require('@configs/i18n').default;
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

  // Overlay visibility preference
  setPokemonOverlayEnabled: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(OVERLAY_STORAGE_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('Error saving overlay preference:', error);
    } finally {
      set({ isPokemonOverlayEnabled: enabled });
    }
  },

  initializeOverlayPreference: async () => {
    try {
      const stored = await AsyncStorage.getItem(OVERLAY_STORAGE_KEY);
      if (stored !== null) {
        set({ isPokemonOverlayEnabled: stored === "true" });
      }
    } catch (error) {
      console.error('Error loading overlay preference:', error);
    } finally {
      set({ isOverlayPreferenceLoaded: true });
    }
  },

  // Subscription features management
  setSubscriptionFeatures: (features: IUserSubscriptionFeatureDetail[]) => {
    const featureMap = features.reduce<Record<string, IUserSubscriptionFeatureDetail>>((acc, feature) => {
      acc[feature.featureKey] = feature;
      return acc;
    }, {});

    set({
      subscriptionKeys: Object.keys(featureMap),
      subscriptionFeatureDetails: featureMap,
    });
  },
  clearSubscriptionFeatures: () => set({ subscriptionKeys: [], subscriptionFeatureDetails: {} }),
  hasFeature: (featureKey: string) => {
    const { subscriptionFeatureDetails } = get();
    return Boolean(subscriptionFeatureDetails[featureKey]);
  },
  getFeatureValue: (featureKey: string) => {
    const { subscriptionFeatureDetails } = get();
    const numericValue = subscriptionFeatureDetails[featureKey]?.numericValue;
    return typeof numericValue === 'number' ? numericValue : null;
  },
});

// Cần khai báo set bên ngoài slice nếu bạn dùng slice độc lập
let set: any;
export const bindSet = (_set: any) => {
  set = _set;
};
