import { useWalletStore } from "./wallet.config";

export const useSparklesBalanceSelector = () => useWalletStore((state: ZUSTAND.IWalletState) => state.sparklesBalance);
export const useWalletSetSparklesBalance = () => useWalletStore((state: ZUSTAND.IWalletState) => state.setSparklesBalance)
export const usePokeCoinsBalanceSelector = () => useWalletStore((state: ZUSTAND.IWalletState) => state.pokeCoinsBalance);
export const useWalletSetPokeCoinsBalance = () => useWalletStore((state: ZUSTAND.IWalletState) => state.setPokeCoinsBalance);