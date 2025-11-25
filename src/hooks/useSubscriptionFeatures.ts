import { SubscriptionFeatureKey } from "@constants/subscription.enum";
import { useGlobalStore } from "@stores/global/global.config";

/**
 * Simple hook to check if user has a specific subscription feature
 * @param featureKey - The feature key to check (can be string or SubscriptionFeatureKey enum)
 * @returns true if user has the feature, false otherwise
 * 
 * @example
 * const hasReading = useCheckFeature(SubscriptionFeatureKey.UNLOCK_READING);
 * if (hasReading) {
 *   // User has access to reading content
 * }
 */
export const useCheckFeature = (featureKey: string | SubscriptionFeatureKey): boolean => {
    // Subscribe to subscriptionFeatureDetails to trigger re-render when state changes
    const subscriptionFeatureDetails = useGlobalStore((state) => state.subscriptionFeatureDetails);
    // Check if feature exists in the details
    return Boolean(subscriptionFeatureDetails[featureKey]);
};

/**
 * Hook to check if user has access to subscription features
 * @returns Object with subscription keys and helper functions
 * 
 * @example
 * const { hasFeature, subscriptionKeys } = useSubscriptionFeatures();
 * 
 * if (hasFeature(SubscriptionFeatureKey.UNLOCK_READING)) {
 *   // User has access to reading content
 * }
 */
export const useSubscriptionFeatures = () => {
    const subscriptionKeys = useGlobalStore((state) => state.subscriptionKeys);
    const hasFeature = useGlobalStore((state) => state.hasFeature);
    const getFeatureValue = useGlobalStore((state) => state.getFeatureValue);
    const subscriptionFeatureDetails = useGlobalStore((state) => state.subscriptionFeatureDetails);

    /**
     * Check if user has a specific feature
     * @param featureKey - The feature key to check (can be string or SubscriptionFeatureKey enum)
     * @returns true if user has the feature, false otherwise
     */
    const checkFeature = (featureKey: string | SubscriptionFeatureKey): boolean => {
        return hasFeature(featureKey);
    };

    /**
     * Check if user has any of the provided features
     * @param featureKeys - Array of feature keys to check
     * @returns true if user has at least one of the features
     */
    const hasAnyFeature = (featureKeys: (string | SubscriptionFeatureKey)[]): boolean => {
        return featureKeys.some(key => hasFeature(key));
    };

    /**
     * Check if user has all of the provided features
     * @param featureKeys - Array of feature keys to check
     * @returns true if user has all of the features
     */
    const hasAllFeatures = (featureKeys: (string | SubscriptionFeatureKey)[]): boolean => {
        return featureKeys.every(key => hasFeature(key));
    };

    return {
        subscriptionKeys,
        subscriptionFeatureDetails,
        hasFeature: checkFeature,
        hasAnyFeature,
        hasAllFeatures,
        getFeatureValue,
    };
};

//----------------------End----------------------//

