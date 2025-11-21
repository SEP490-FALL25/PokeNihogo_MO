import { z } from "zod";
import { SubscriptionPackageType } from "./subscription.request";
import { UserSubscriptionFeatureItemSchema } from "./subscription.entity";

/**
 * Subscription Package Response Schema
 */
export const SubscriptionPackageResponseSchema = z.object({
    id: z.number(),
    packageType: z.nativeEnum(SubscriptionPackageType),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    duration: z.string().nullable(), // "lifetime" or "1 month" etc.
    benefits: z.array(z.string()),
    isActive: z.boolean(),
});

export type ISubscriptionPackageResponse = z.infer<typeof SubscriptionPackageResponseSchema>;

/**
 * Subscription Purchase Response Schema
 */
export const SubscriptionPurchaseResponseSchema = z.object({
    message: z.string(),
    subscriptionId: z.number(),
    expiresAt: z.string().nullable(), // null for lifetime subscriptions
});

export type ISubscriptionPurchaseResponse = z.infer<typeof SubscriptionPurchaseResponseSchema>;

/**
 * User Subscription Features Response Schema
 * Matches API response structure: { statusCode, data: { result: [...] }, message }
 */
export const UserSubscriptionFeaturesResponseSchema = z.object({
    statusCode: z.number(),
    data: z.object({
        result: z.array(UserSubscriptionFeatureItemSchema),
    }),
    message: z.string(),
});

export type IUserSubscriptionFeaturesResponse = z.infer<typeof UserSubscriptionFeaturesResponseSchema>;

export type IUserSubscriptionFeatureItem = z.infer<typeof UserSubscriptionFeatureItemSchema>;

export interface IUserSubscriptionFeatureDetail {
    featureKey: string;
    featureId?: number;
    value: string | null | undefined;
    numericValue: number | null;
    nameKey?: string;
    nameTranslation?: string;
}
//----------------------End----------------------//

