import { z } from "zod";

/**
 * Subscription Marketplace Entity Schema
 */
export const SubscriptionMarketplaceEntitySchema = z.object({
    id: z.number(),
    tagName: z.string(),
    nameTranslation: z.string(),
    descriptionTranslation: z.string(),
    plans: z.array(z.object({
        id: z.number(),
        subscriptionId: z.number(),
        price: z.number(),
        type: z.string(),
        durationInDays: z.number().nullable(),
        isActive: z.boolean(),
    })),
    features: z.array(z.object({
        id: z.number(),
        featureId: z.number(),
        value: z.string().nullable(),
        feature: z.object({
            id: z.number(),
            featureKey: z.string(),
            nameKey: z.string(),
            nameTranslation: z.string(),
        })
    })),
    isPopular: z.boolean(),
    canBuy: z.boolean(),
});

export type ISubscriptionMarketplaceEntity = z.infer<typeof SubscriptionMarketplaceEntitySchema>;
//----------------------End----------------------//