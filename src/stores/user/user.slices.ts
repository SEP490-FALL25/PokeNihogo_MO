
export const createUserSlice = (
    set: any
): ZUSTAND.IUserState => ({
    email: "",
    level: undefined,
    starterId: undefined,
    isFirstTimeLogin: undefined,
    hasCompletedPlacementTest: false,
    showWelcomeModal: false,
    isTourGuideActive: false,

    setEmail: (email: string) => set({ email }),
    setLevel: (level: 'N5' | 'N4' | 'N3') => set({ level }),
    setStarterId: (starterId: string) => set({ starterId }),
    setIsFirstTimeLogin: (value: boolean) => set({ isFirstTimeLogin: value }),
    setHasCompletedPlacementTest: (value: boolean) => set({ hasCompletedPlacementTest: value }),
    setShowWelcomeModal: (value: boolean) => set({ showWelcomeModal: value }),
    setIsTourGuideActive: (value: boolean) => set({ isTourGuideActive: value }),
})

// Cần khai báo set bên ngoài slice nếu bạn dùng slice độc lập
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let set: any
export const bindSet = (_set: any) => {
    set = _set
}