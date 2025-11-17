import { ICreateInvoiceRequest } from "@models/invoice/invoice.request";
import invoiceService from "@services/invoice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSubscriptionMarketplacePackages } from "./useSubscription";
import { useWalletUser } from "./useWallet";


/**
 * Hook to refetch all user-related data
 * Useful after payment success, manual refresh, or any data update
 */
export const useRefetchUserData = () => {
    const queryClient = useQueryClient();
    const { refetch: refetchPackages } = useSubscriptionMarketplacePackages();
    const { refetch: refetchWallet } = useWalletUser();

    const refetchAll = useCallback(() => {
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        queryClient.invalidateQueries({ queryKey: ['subscription-marketplace-packages'] });
        queryClient.invalidateQueries({ queryKey: ['wallet-user'] });

        // Manually refetch to ensure fresh data
        refetchPackages();
        refetchWallet();
    }, [queryClient, refetchPackages, refetchWallet]);

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

