export const createWalletSlice = (
    set: any
): ZUSTAND.IWalletState => ({
    sparklesBalance: 0,
    pokeCoinsBalance: 0,

    setSparklesBalance: (balance: number) => set({ sparklesBalance: balance }),
    setPokeCoinsBalance: (balance: number) => set({ pokeCoinsBalance: balance }),
})
