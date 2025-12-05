import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "@stores/user/user.config";
import { deleteSecureStorage, getValueForSecureStorage, saveSecureStorage } from "@utils/secure-storage";

export const createAuthSlice = (set: any): ZUSTAND.IAuthState => ({
  accessToken: "",
  isLoading: true,
  // accessToken: "temp-bypass-token", // TODO: TEMPORARY BYPASS - Remove this after testing
  // isLoading: false, // Set to false to avoid loading state


  initialize: async () => {
    const token = await getValueForSecureStorage('accessToken');
    if (token) {
      set({ accessToken: token });
    }
    set({ isLoading: false });
  },
  setAccessToken: async (newToken: string) => {
    console.log('newToken: ', newToken);
    
    const newTokenSave = await saveSecureStorage('accessToken', newToken);
    console.log('newTokenSave: ', newTokenSave);
    
    set({ accessToken: newToken });
  },
  deleteAccessToken: async () => {
    await deleteSecureStorage('accessToken');
    set({ accessToken: "" });
    // Reset user-related UI state when logging out so it doesn't leak to another account
    try {
      useUserStore.getState().resetUserState();
    } catch (_) {
      // ignore reset failure
    }
    // Clear onboarding/tour flag so next login can see tour again
    try {
      await AsyncStorage.removeItem("@WelcomeModal:hasBeenShown");
    } catch (_) {
      // ignore cleanup failure
    }
  },
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
})