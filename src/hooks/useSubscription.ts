import { ISubscriptionPurchaseRequest } from "@models/subscription/subscription.request";
import subscriptionService from "@services/subscription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


/**
 * Hook to get all subscription marketplace packages
 * @returns Query object with packages data
 */
export const useSubscriptionMarketplacePackages = () => {
    return useQuery({
        queryKey: ['subscription-marketplace-packages'],
        queryFn: () => subscriptionService.getMarketplacePackages(),
    });
};
//----------------------End----------------------//



/**
 * Hook to get all subscription packages
 * @returns Query object with packages data
 */
export const useSubscriptionPackages = () => {
    return useQuery({
        queryKey: ['subscription-packages'],
        queryFn: () => subscriptionService.getPackages(),
    });
};
