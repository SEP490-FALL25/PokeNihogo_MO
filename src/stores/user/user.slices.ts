
export const createUserSlice = (
    set: any
): ZUSTAND.IUserState => ({
    email: "",
    level: undefined,
    starterId: undefined,
    isFirstTimeLogin: undefined,

    setEmail: (email: string) => set({ email }),
    setLevel: (level: 'N5' | 'N4' | 'N3') => set({ level }),
    setStarterId: (starterId: string) => set({ starterId }),
    setIsFirstTimeLogin: (value: boolean) => set({ isFirstTimeLogin: value }),
})

// Cần khai báo set bên ngoài slice nếu bạn dùng slice độc lập
let set: any
export const bindSet = (_set: any) => {
    set = _set
}