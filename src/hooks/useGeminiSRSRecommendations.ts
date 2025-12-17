import { ISubscriptionMarketplaceEntity } from "@models/subscription/subscription.entity";
import geminiService from "@services/gemini";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";

interface UseGeminiSRSRecommendationsOptions {
    limit?: number;
    useServiceAccount?: boolean;
}

/**
 * Hook to check if Ultra package is purchased and call Gemini SRS recommendations API
 * @param options - Options for the API call
 * @returns Object with checkAndCall function to trigger the check and API call
 */
export const useGeminiSRSRecommendations = (options: UseGeminiSRSRecommendationsOptions = {}) => {
    const { limit = 10, useServiceAccount = false } = options;

    const mutation = useMutation({
        mutationFn: async () => {
            return await geminiService.getSRSRecommendations(limit, useServiceAccount);
        },
        onSuccess: () => {
            console.log('Gemini SRS recommendations API called successfully');
        },
        onError: (error: any) => {
            console.error('Error calling Gemini SRS recommendations API:', error);
            // Don't show error to user as this is a background operation
        },
    });

    /**
     * Check if Ultra package is purchased and call Gemini API if so
     * @param packages - Array of subscription packages to check
     */
    const checkAndCall = useCallback(
        (packages: ISubscriptionMarketplaceEntity[]) => {
            // Find Ultra package
            const ultraPackage = packages.find(
                (pkg: ISubscriptionMarketplaceEntity) => pkg.tagName === 'ULTRA'
            );

            // If Ultra package exists and canBuy is false (meaning it's purchased), call Gemini API
            if (ultraPackage && !ultraPackage.canBuy) {
                mutation.mutate();
            }
        },
        [mutation]
    );

    return {
        checkAndCall,
        isCalling: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
    };
};

