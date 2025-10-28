import { IShopPurchaseRequest } from "@models/shop-purchase/shop-purchase.request";
import shopPurchaseService from "@services/shop-purchase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to purchase items from the shop
 * @returns Mutation object with mutate function
 */
export const useShopPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: IShopPurchaseRequest) => shopPurchaseService.purchase(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-banner'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-user'] });
        },
        onError: (error) => {
            console.error(error);
        },
    });
};
//----------------------End----------------------//