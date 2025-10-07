import { useAuthStore } from "./auth.config"

export const useAccessTokenSelector = () => useAuthStore((state: ZUSTAND.IAuthState) => state.accessToken)
export const useGlobalInitialize = () => useAuthStore((state: ZUSTAND.IAuthState) => state.initialize)
export const useGlobalSetAccessToken = () => useAuthStore((state: ZUSTAND.IAuthState) => state.setAccessToken)
export const useGlobalDeleteAccessToken = () => useAuthStore((state: ZUSTAND.IAuthState) => state.deleteAccessToken)

export const useIsLoadingSelector = () => useAuthStore((state: ZUSTAND.IAuthState) => state.isLoading)
export const useGlobalSetIsLoading = () => useAuthStore((state: ZUSTAND.IAuthState) => state.setIsLoading)
