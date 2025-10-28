import { WALLET } from "@constants/wallet.enum";
import walletService from "@services/wallet";
import { useWalletStore } from "@stores/wallet/wallet.config";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";


/**
 * Hook to get wallet user data and auto-sync SPARKLES balance to Zustand
 * @returns Wallet user data
 */
export const useWalletUser = () => {
    const setSparklesBalance = useWalletStore((state) => state.setSparklesBalance);
    const currentBalance = useWalletStore((state) => state.sparklesBalance);
    const setPokeCoinsBalance = useWalletStore((state) => state.setPokeCoinsBalance);
    const currentPokeCoinsBalance = useWalletStore((state) => state.pokeCoinsBalance);

    const { data: walletUser, isLoading, isError, error } = useQuery({
        queryKey: ['wallet-user'],
        queryFn: () => walletService.getWalletUser(),
    });

    useEffect(() => {
        if (walletUser?.data && Array.isArray(walletUser.data)) {
            const sparklesWallet = walletUser.data.find((wallet) => wallet.type === WALLET.WALLET_TYPES.FREE_COIN);
            if (sparklesWallet && sparklesWallet.balance !== currentBalance) {
                setSparklesBalance(sparklesWallet.balance);
            }
            const pokeCoinsWallet = walletUser.data.find((wallet) => wallet.type === WALLET.WALLET_TYPES.PAID_COINS);
            if (pokeCoinsWallet && pokeCoinsWallet.balance !== currentPokeCoinsBalance) {
                setPokeCoinsBalance(pokeCoinsWallet.balance);
            }
        }
    }, [walletUser?.data, currentBalance, setSparklesBalance, currentPokeCoinsBalance, setPokeCoinsBalance]);

    return { walletUser: walletUser?.data, isLoading, isError, error };
};
//----------------------End----------------------//