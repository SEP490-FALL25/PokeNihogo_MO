
export const createGlobalSlice = (
    set: any
): ZUSTAND.IGlobalState => ({
    language: "en",

    setLanguage: (language: string) => set({ language }),
})

// Cần khai báo set bên ngoài slice nếu bạn dùng slice độc lập
let set: any
export const bindSet = (_set: any) => {
    set = _set
}