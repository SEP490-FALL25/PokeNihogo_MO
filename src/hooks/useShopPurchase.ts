import { IShopPurchaseRequest } from "@models/shop-purchase/shop-purchase.request";
import shopPurchaseService from "@services/shop-purchase";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to purchase items from the shop
 * @param body  
 * @returns 
 */
export const useShopPurchase = (body: IShopPurchaseRequest) => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['shop-purchase', body],
        queryFn: () => shopPurchaseService.purchase(body),
    });
    return { data: data?.data, isLoading, isError, error };
};
//----------------------End----------------------//