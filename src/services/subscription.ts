import { axiosPrivate } from "@configs/axios";
import {
    IUserSubscriptionFeatureDetail,
    IUserSubscriptionFeaturesResponse,
    UserSubscriptionFeaturesResponseSchema
} from "@models/subscription/subscription.response";

const subscriptionService = {
    getMarketplacePackages: async () => {
        return await axiosPrivate.get(`/subscription/marketplace/list`);
    },

    getUserSubscription: async (qs: string, currentPage: number, pageSize: number) => {
        const search = new URLSearchParams();
        search.append("qs", qs);
        search.append("currentPage", currentPage.toString());
        search.append("pageSize", pageSize.toString());
        return await axiosPrivate.get(`/user-subscription/user?${search.toString()}`);
    },

    /**
     * Get user's subscription features (keys)
     * Returns array of feature keys that user has access to
     */
    getUserFeatures: async (): Promise<{ features: IUserSubscriptionFeatureDetail[] }> => {
        const response = await axiosPrivate.get(`/user-subscription/user/features`);
        const parsed: IUserSubscriptionFeaturesResponse = UserSubscriptionFeaturesResponseSchema.parse(response.data);

        const features =
            parsed.data?.result
                ?.map((item) => {
                    const featureKey = item.featureKey || item.feature?.featureKey;
                    if (!featureKey) {
                        return null;
                    }

                    const numericValue =
                        item.value !== null && item.value !== undefined
                            ? Number(item.value)
                            : null;

                    return {
                        featureKey,
                        featureId: item.featureId || item.feature?.id,
                        value: item.value,
                        numericValue: Number.isFinite(numericValue) ? numericValue : null,
                        nameKey: item.feature?.nameKey,
                        nameTranslation: item.feature?.nameTranslation,
                    } as IUserSubscriptionFeatureDetail;
                })
                .filter((item): item is IUserSubscriptionFeatureDetail => Boolean(item)) || [];

        return { features };
    },
}

export default subscriptionService;

