import subscriptionService from "@services/subscription";
import { useAuthStore } from "@stores/auth/auth.config";
import { useGlobalStore } from "@stores/global/global.config";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";


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

/**
 * Hook to get user's subscription features and sync with global state
 * Automatically updates global state when data is fetched
 * @returns Query object with subscription features data
 */
export const useUserSubscriptionFeatures = () => {
    const { accessToken } = useAuthStore();
    const { setSubscriptionKeys, clearSubscriptionKeys } = useGlobalStore();

    const query = useQuery({
        queryKey: ['user-subscription-features', accessToken],
        queryFn: async (): Promise<{ features: string[] }> => {
            const response = await subscriptionService.getUserFeatures();
            return response;
        },
        enabled: !!accessToken, // Only fetch when user is authenticated
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    });

    // Sync subscription keys to global state when data changes
    useEffect(() => {
        const data = query.data as { features: string[] } | undefined;
        if (data?.features) {
            setSubscriptionKeys(data.features);
        } else if (!accessToken) {
            // Clear subscription keys when user logs out
            clearSubscriptionKeys();
        }
    }, [query.data, accessToken, setSubscriptionKeys, clearSubscriptionKeys]);

    return query;
};
