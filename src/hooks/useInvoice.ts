import { ICreateInvoiceRequest } from "@models/invoice/invoice.request";
import invoiceService from "@services/invoice";
import subscriptionService from "@services/subscription";
import { useAuthStore } from "@stores/auth/auth.config";
import { useGlobalStore } from "@stores/global/global.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSubscriptionMarketplacePackages, useUserSubscription } from "./useSubscription";
import { useWalletUser } from "./useWallet";

/**
 * Hook to refetch all user-related data
 * Useful after payment success, manual refresh, or any data update
 */
export const useRefetchUserData = () => {
    const queryClient = useQueryClient();
    const { accessToken } = useAuthStore();
    const { setSubscriptionFeatures } = useGlobalStore();
    const { refetch: refetchPackages } = useSubscriptionMarketplacePackages();
    const { refetch: refetchSubscription } = useUserSubscription('sort:status', 1, 10);
    const { refetch: refetchWallet } = useWalletUser();

    const refetchAll = useCallback(async () => {
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        // Invalidate subscription marketplace packages (with accessToken in queryKey)
        queryClient.invalidateQueries({ queryKey: ['subscription-marketplace-packages'] });
        queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
        queryClient.invalidateQueries({ queryKey: ['wallet-user'] });
        queryClient.invalidateQueries({ queryKey: ['user-subscription-features'] });
        // Invalidate user-tests queries to refresh abilities data
        queryClient.invalidateQueries({ queryKey: ['user-tests'] });

        // Manually refetch to ensure fresh data
        if (accessToken) {
            refetchPackages();
        }
        refetchSubscription();
        refetchWallet();

        // Refetch subscription features and update global state immediately
        if (accessToken) {
            try {
                // Refetch query
                await queryClient.refetchQueries({ queryKey: ['user-subscription-features', accessToken] });

                // Also fetch and update global state directly to ensure immediate update
                const response = await subscriptionService.getUserFeatures();
                if (response?.features) {
                    setSubscriptionFeatures(response.features);
                }
            } catch (error) {
                console.error('Error refetching subscription features:', error);
            }
        }
    }, [queryClient, accessToken, setSubscriptionFeatures, refetchPackages, refetchWallet, refetchSubscription]);

    return { refetchAll };
};
//----------------------End----------------------//

/**
 * Hook to create an invoice
 * @returns Mutation object with mutate function
 */
export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    const { refetchAll } = useRefetchUserData();

    return useMutation({
        mutationFn: (data: ICreateInvoiceRequest) => invoiceService.createInvoice(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice'] });
            refetchAll();
        },
        onError: (error) => {
            console.error(error);
        },
    });
}
//----------------------End----------------------//

