
export const createUserSlice = (
    set: any
): ZUSTAND.IUserState => ({
    email: "",
    starterId: undefined,
    isFirstTimeLogin: undefined,
    level: undefined,
    hasCompletedPlacementTest: false,

    setEmail: (email: string) => set({ email }),
    setStarterId: (starterId: string) => set({ starterId }),
    setIsFirstTimeLogin: (value: boolean) => set({ isFirstTimeLogin: value }),
    setLevel: (level: ZUSTAND.IUserState["level"]) => set({ level }),
    setHasCompletedPlacementTest: (value: boolean) =>
        set({ hasCompletedPlacementTest: value }),
})
// Cần khai báo set bên ngoài slice nếu bạn dùng slice độc lập
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let set: any
export const bindSet = (_set: any) => {
    set = _set
}
