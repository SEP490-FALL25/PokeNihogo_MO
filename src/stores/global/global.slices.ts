
export const createGlobalSlice = (set: any): ZUSTAND.IGlobalState => ({
  language: "en",

  // DraggableOverlay position state
  overlayPosition: { x: 0, y: 0 },
  isOverlayPositionLoaded: false,

  setLanguage: (language: string) => set({ language }),

  // Initialize language from i18n
  initializeLanguage: () => {
    try {
      const i18n = require('@i18n/i18n').default;
      const currentLanguage = i18n.language || 'en';
      set({ language: currentLanguage });
    } catch {
      // Fallback to 'en' if i18n is not available
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
});

// Cần khai báo set bên ngoài slice nếu bạn dùng slice độc lập
let set: any;
export const bindSet = (_set: any) => {
  set = _set;
};
