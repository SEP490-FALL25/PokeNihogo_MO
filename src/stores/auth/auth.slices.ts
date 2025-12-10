import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserStore } from "@stores/user/user.config";
import { clearUserCache } from "@utils/clearUserCache";
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
    try {
      await deleteSecureStorage('accessToken');
    } catch (error) {
      console.error('Error deleting access token from secure storage:', error);
    }

    set({ accessToken: "" });

    // Reset user-related UI state when logging out so it doesn't leak to another account
    try {
      useUserStore.getState().resetUserState();
    } catch (error) {
      console.error('Error resetting user state:', error);
    }

    // Clear user-related React Query cache when logging out to prevent data leakage between accounts
    // This clears only user-specific queries, keeping public data (dictionary, elemental, etc.) intact
    try {
      clearUserCache();
    } catch (error) {
      console.error('Error clearing user cache:', error);
      // Continue with logout even if cache clearing fails
    }

    // Clear onboarding/tour flag so next login can see tour again
    try {
      await AsyncStorage.removeItem("@WelcomeModal:hasBeenShown");
    } catch (error) {
      console.error('Error removing welcome modal flag:', error);
    }
  },
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
})
