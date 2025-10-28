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
    const setPokeCoinsBalance = useWalletStore((state) => state.setPokeCoinsBalance);

    const { data: walletUser, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['wallet-user'],
        queryFn: () => walletService.getWalletUser(),
    });

    useEffect(() => {
        const walletsArray = walletUser?.data?.data;

        if (walletsArray && Array.isArray(walletsArray)) {
            const sparklesWallet = walletsArray.find((wallet) => wallet.type === WALLET.WALLET_TYPES.FREE_COIN);
            const pokeCoinsWallet = walletsArray.find((wallet) => wallet.type === WALLET.WALLET_TYPES.PAID_COINS);

            if (sparklesWallet) {
                setSparklesBalance(sparklesWallet.balance);
            }

            if (pokeCoinsWallet) {
                setPokeCoinsBalance(pokeCoinsWallet.balance);
            }
        }
    }, [walletUser?.data, setSparklesBalance, setPokeCoinsBalance]);

    return { walletUser: walletUser?.data?.data, isLoading, isError, error, refetch };
};
//----------------------End----------------------//