import { IShopPurchaseRequest } from "@models/shop-purchase/shop-purchase.request";
import shopPurchaseService from "@services/shop-purchase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Hook to purchase items from the shop
 * @param body  
 * @returns 
 */
export const useShopPurchase = (body: IShopPurchaseRequest) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: IShopPurchaseRequest) => shopPurchaseService.purchase(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-purchase'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-user'] });
        },
        onError: (error) => {
            console.error(error);
        },
    });
};
//----------------------End----------------------//