import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import subscriptionService from "@services/subscription";
import { ISubscriptionPurchaseRequest } from "@models/subscription/subscription.request";

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

/**
 * Hook to purchase a subscription package
 * @returns Mutation object with mutate function
 */
export const useSubscriptionPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: ISubscriptionPurchaseRequest) => subscriptionService.purchase(body),
        onSuccess: () => {
            // Invalidate related queries after successful purchase
            queryClient.invalidateQueries({ queryKey: ['subscription-packages'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-user'] });
        },
        onError: (error) => {
            console.error('Subscription purchase error:', error);
        },
    });
};

