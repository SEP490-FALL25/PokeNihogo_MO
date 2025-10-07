import { deleteSecureStorage, getValueForSecureStorage, saveSecureStorage } from "@utils/secure-storage";

export const createAuthSlice = (set: any): ZUSTAND.IAuthState => ({
  accessToken: "",
  isLoading: true,

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
  },
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
})